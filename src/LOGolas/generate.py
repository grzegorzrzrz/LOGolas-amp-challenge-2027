import os
import re
import sys
import math
import torch
import torch.nn.functional as F
import numpy as np
import pandas as pd
import configparser
import argparse
import Levenshtein
from pathlib import Path
from Bio import SeqIO
from collections import Counter, defaultdict
from transformers import AutoTokenizer, AutoModelForMaskedLM

from CPLDiff.models.Denoiser import Denoiser
from CPLDiff.utils.utils import set_seed, extract

from logolasmap import (
    apply_steering_only_hook,
    MultiLayerLinEAS,
    get_all_layernorms,
    MonotonicTimeWarp,
)

VALID_AA = set("ACDEFGHIKLMNPQRSTVWY")

ROOT = Path(__file__).resolve().parents[2]
CPLDIFF_DIR = ROOT / "src" / "CPL-Diff"

LIBRARY_SIZE = 50_000

TOP_SIZE = 100
SIMILARITY_THRESHOLD = 0.8
TOP_MIN_LENGTH, TOP_MAX_LENGTH = 10, 30
TOP_MIN_CHARGE, TOP_MAX_CHARGE = 2.0, 10.0
TOP_MIN_HYDROPHOBICITY, TOP_MAX_HYDROPHOBICITY = -0.5, 0.8

EISENBERG_CONSENSUS = {
    'A':  0.25, 'R': -1.76, 'N': -0.64, 'D': -0.72, 'C':  0.04,
    'Q': -0.69, 'E': -0.62, 'G':  0.16, 'H': -0.40, 'I':  0.73,
    'L':  0.53, 'K': -1.10, 'M':  0.26, 'F':  0.61, 'P': -0.07,
    'S': -0.26, 'T': -0.18, 'W':  0.37, 'Y':  0.02, 'V':  0.54,
}

ALL_COLUMNS = [
    'E. coli ATCC11775', 'P. aeruginosa PAO1', 'P. aeruginosa PA14', 'S. aureus ATCC12600', 'E. coli AIG221',
    'E. coli AIG222', 'K. pneumoniae ATCC13883', 'A. baumannii ATCC19606', 'A. muciniphila ATCC BAA-835',
    'B. fragilis ATCC25285', 'B. vulgatus ATCC8482', 'C. aerofaciens ATCC25986', 'C. scindens ATCC35704',
    'B. thetaiotaomicron ATCC29148', 'B. thetaiotaomicron Complemmented', 'B. thetaiotaomicron Mutant',
    'B. uniformis ATCC8492', 'B. eggerthi ATCC27754', 'C. spiroforme ATCC29900', 'P. distasonis ATCC8503',
    'P. copri DSMZ18205', 'B. ovatus ATCC8483', 'E. rectale ATCC33656', 'C. symbiosum', 'R. obeum', 'R. torques',
    'S. aureus (ATCC BAA-1556) - MRSA', 'vancomycin-resistant E. faecalis ATCC700802',
    'vancomycin-resistant E. faecium ATCC700221', 'E. coli Nissle', 'Salmonella enterica ATCC 9150 (BEIRES NR-515)',
    'Salmonella enterica (BEIRES NR-170)', 'Salmonella enterica ATCC 9150 (BEIRES NR-174)',
    'L. monocytogenes ATCC 19111 (BEIRES NR-106)'
]
APEX_COLS = [
    'E. coli ATCC11775', 'P. aeruginosa PAO1', 'P. aeruginosa PA14', 'S. aureus ATCC12600',
    'E. coli AIG221', 'E. coli AIG222', 'K. pneumoniae ATCC13883', 'A. baumannii ATCC19606',
    'S. aureus (ATCC BAA-1556) - MRSA', 'vancomycin-resistant E. faecalis ATCC700802',
    'vancomycin-resistant E. faecium ATCC700221'
]
APEX_INDICES = [ALL_COLUMNS.index(c) for c in APEX_COLS]


class MICEvaluator:
    def __init__(self, apex_dir, device):
        self.device = device
        self.max_len = 52
        if apex_dir not in sys.path:
            sys.path.append(apex_dir)
        try:
            from utils import make_vocab, onehot_encoding
        except ImportError:
            raise ImportError(f"Could not find 'utils.py' in {apex_dir}.")
        self.onehot_encoding = onehot_encoding
        original_cwd = os.getcwd()
        os.chdir(apex_dir)
        self.word2idx, self.idx2word = make_vocab()
        if not os.path.exists('best_key_list'):
            os.chdir(original_cwd)
            raise FileNotFoundError("best_key_list not found in Battleamp-apex directory.")
        with open('best_key_list', 'r') as f:
            model_list = [line.strip('\n').strip('\r') for line in f.readlines()]
        self.repeat_num = 5
        self.deep_model_list = []
        print(f"\n[MIC Evaluator] Loading {len(model_list) * self.repeat_num} models...")
        for a_model_name in model_list:
            for a_en in range(self.repeat_num):
                key = 'trained_all_model_' + a_model_name + '_ensemble_' + str(a_en)
                model = torch.load(os.path.join('trained_models', key), map_location=self.device, weights_only=False)
                model.eval()
                self.deep_model_list.append(model)
        os.chdir(original_cwd)
        print("[MIC Evaluator] Ready.")

    def evaluate(self, seq_list):
        if not seq_list:
            return []
        clean_seqs = []
        for s in seq_list:
            clean_s = ''.join([c for c in s if c in self.word2idx])
            clean_seqs.append(clean_s[:self.max_len])
        clean_seqs = [s if len(s) > 0 else 'G' for s in clean_seqs]
        seq_rep, _, _ = self.onehot_encoding(clean_seqs, self.max_len, self.word2idx)
        X_seq = torch.LongTensor(seq_rep).to(self.device)
        ensemble_sum = None
        with torch.no_grad():
            for AMP_model in self.deep_model_list:
                AMP_pred_batch = AMP_model(X_seq).cpu().detach().numpy()
                AMP_pred_batch = 10 ** (6 - AMP_pred_batch)
                ensemble_sum = AMP_pred_batch if ensemble_sum is None else ensemble_sum + AMP_pred_batch
        AMP_pred = ensemble_sum / len(self.deep_model_list)
        return np.nanmean(AMP_pred[:, APEX_INDICES], axis=1).tolist()


def parse_arguments():
    parser = argparse.ArgumentParser(description="Dynamic Steering Peptide Decoding.")
    parser.add_argument('--config_path', type=str, default=str(CPLDIFF_DIR / 'config.ini'))
    parser.add_argument('--gpu_id', type=int, default=0)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--sample_type', type=str, default='amp', choices=['amp', 'afp', 'avp'])
    parser.add_argument('--n_sequences', type=int, default=LIBRARY_SIZE,
                        help='Size of the generated library')
    parser.add_argument('--cfs', type=float, default=1.5)
    parser.add_argument('--log_interval', type=int, default=100)
    parser.add_argument('--dynamic_mic_interval', type=int, default=50)
    parser.add_argument('--apex_dir', type=str, default=str(ROOT / 'src/apex'))
    parser.add_argument('--dataset_path', type=str, default=str(ROOT / 'data/training/training.csv'))
    parser.add_argument('--source_mic', type=float, default=83.0)
    parser.add_argument('--target_mic', type=float, default=32.0)
    parser.add_argument('--base_model_dir', type=str, default=str(ROOT / 'checkpoint'))
    parser.add_argument('--specific_timesteps', nargs='+', type=int, default=[
        2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200, 1100,
        1000,  900,  800,  700,  600,  500,  400,  300,  200,  100
    ])
    parser.add_argument('--steering_window', type=int, default=100)
    parser.add_argument('--denoiser_path', type=str,
                        default=str(CPLDIFF_DIR / 'save_model/denoise_model.pkl'))
    parser.add_argument('--decoder_dir', type=str, default=str(CPLDIFF_DIR / 'save_model'))
    parser.add_argument('--data_dir', type=str, default=str(CPLDIFF_DIR / 'data/train'))
    parser.add_argument('--out_dir', type=str, default=None,
                        help='Output directory for library.fasta and top.fasta '
                             '(default: a directory named after the entry point)')
    parser.add_argument('--batch_size', type=int, default=256)
    parser.add_argument('--verbose', action='store_true')
    parser.add_argument('--no_steering', action='store_true',
                    help='Alias for --steering_mode none')

    parser.add_argument('--min_pep_len', type=int, default=8,
                        help='Minimum length of a saved peptide (inclusive)')
    parser.add_argument('--max_pep_len', type=int, default=50,
                        help='Maximum length of a saved peptide (inclusive)')
    parser.add_argument('--antibacterial_fasta', type=str,
                        default=str(ROOT / 'data/antibacterial.fasta'),
                        help='Known antibacterial peptides. The library may contain none of '
                             'these verbatim, and no top-list sequence may exceed 80%% '
                             'Levenshtein ratio against any of them.')
    parser.add_argument('--top_k', type=int, default=TOP_SIZE,
                        help='Number of ranked sequences to write to the top list')
    parser.add_argument('--oversample', type=float, default=1.3,
                        help='Generate this factor more sequences than still needed per batch, '
                             'to compensate for rejected sequences (capped by --batch_size)')

    parser.add_argument(
        '--steering_mode', type=str, default='full',
        choices=['full', 'none'],
        help=(
            "full → MIC steering applied at every diffusion timestep\n"
            "none → no steering (equivalent to baseline CPLDiff with no LinEAS hooks)"
        )
    )

    return parser.parse_args()


def load_reference_set(path):
    """Loads all sequences from a FASTA file into a normalised (upper-case) set."""
    if not os.path.exists(path):
        print(f"Error: Reference FASTA not found at {path}")
        sys.exit(1)
    refs = set()
    with open(path, "r") as fh:
        for record in SeqIO.parse(fh, "fasta"):
            refs.add(str(record.seq).strip().upper())
    return refs


def filter_candidates(candidates, accepted_set, reference_set, min_len, max_len, max_accept):
    """
    Filters decoded peptides. A peptide is accepted only if it
      1. contains only the 20 standard amino acids,
      2. has min_len <= length <= max_len,
      3. is NOT present in the reference FASTA,
      4. has NOT been accepted before (unique across all batches).
    Accepted peptides are added to `accepted_set` and returned in order.
    """
    accepted = []
    rejected = Counter()
    for seq in candidates:
        if len(accepted) >= max_accept:
            break
        seq = seq.strip().upper()
        if not seq or not set(seq) <= VALID_AA:
            rejected['non_standard_or_empty'] += 1
            continue
        if not (min_len <= len(seq) <= max_len):
            rejected['bad_length'] += 1
            continue
        if seq in reference_set:
            rejected['in_reference'] += 1
            continue
        if seq in accepted_set:
            rejected['duplicate'] += 1
            continue
        accepted_set.add(seq)
        accepted.append(seq)
    return accepted, rejected


def net_charge(seq):
    """Net charge at neutral pH: K + R - D - E, with histidine contributing 0.1."""
    return (seq.count('K') + seq.count('R') + 0.1 * seq.count('H')
            - seq.count('D') - seq.count('E'))


def mean_hydrophobicity(seq):
    """Mean per-residue hydrophobicity on the Eisenberg consensus scale."""
    return sum(EISENBERG_CONSENSUS[a] for a in seq) / len(seq)


def passes_properties(seq):
    """Synthesizability/activity window: charge 2-10, length 10-30, hydrophobicity -0.5-0.8."""
    if not (TOP_MIN_LENGTH <= len(seq) <= TOP_MAX_LENGTH):
        return False
    if not (TOP_MIN_CHARGE <= net_charge(seq) <= TOP_MAX_CHARGE):
        return False
    return TOP_MIN_HYDROPHOBICITY <= mean_hydrophobicity(seq) <= TOP_MAX_HYDROPHOBICITY


def index_by_length(sequences):
    by_length = defaultdict(list)
    for s in sequences:
        by_length[len(s)].append(s)
    return by_length


def too_similar(seq, refs_by_length, threshold=SIMILARITY_THRESHOLD):
    """True if seq exceeds `threshold` Levenshtein ratio against any reference.

    Reference lengths that cannot reach the threshold are skipped outright: the
    best achievable ratio between lengths L and M is 2*min(L, M) / (L + M), so
    anything failing that bound is discarded without computing a distance.
    """
    L = len(seq)
    for M, refs in refs_by_length.items():
        if 2 * min(L, M) <= threshold * (L + M):
            continue
        for ref in refs:
            if Levenshtein.ratio(seq, ref, score_cutoff=threshold) > threshold:
                return True
    return False


def read_library_with_mic(path):
    """Read a generated FASTA into (sequence, MIC) pairs, MIC taken from the header."""
    entries = []
    for record in SeqIO.parse(path, "fasta"):
        match = re.search(r"MIC=([-+\d.eE]+)", record.description)
        mic = float(match.group(1)) if match else float('inf')
        entries.append((str(record.seq).strip().upper(), mic))
    return entries


def create_top_100(library_path, antibacterial_fasta, top_path, top_k=TOP_SIZE,
                   threshold=SIMILARITY_THRESHOLD):
    """Select the top_k lowest-MIC peptides that clear the similarity and property filters.

    Peptides are considered best-MIC first. A candidate is kept only if it stays
    at or below `threshold` Levenshtein ratio against every sequence in
    `antibacterial_fasta` (the competition's hard rule for the top list) and
    falls inside the charge/length/hydrophobicity window.

    If too few peptides clear both, the remainder is filled with the best-MIC
    peptides that clear the similarity rule but fall outside the property
    window, so the list still reaches top_k without ever breaking the hard rule.
    """
    library = read_library_with_mic(library_path)
    library.sort(key=lambda pair: pair[1])
    print(f"  Ranking {len(library)} peptides by MIC (ascending)")

    references = load_reference_set(antibacterial_fasta)
    refs_by_length = index_by_length(references)
    print(f"  Loaded {len(references)} antibacterial references from {antibacterial_fasta}")

    selected, property_failed = [], []
    for seq, mic in library:
        if len(selected) >= top_k:
            break
        if not passes_properties(seq):
            property_failed.append((seq, mic))
            continue
        if too_similar(seq, refs_by_length, threshold):
            continue
        selected.append((seq, mic))

    print(f"  {len(selected)} peptides passed both the property window and the "
          f"<={threshold} similarity rule")

    if len(selected) < top_k:
        print(f"  [WARNING] Only {len(selected)} peptides cleared the property window. "
              f"Filling {top_k - len(selected)} slot(s) with the best-MIC peptides that "
              f"clear the similarity rule but fall outside it.")
        for seq, mic in property_failed:
            if len(selected) >= top_k:
                break
            if too_similar(seq, refs_by_length, threshold):
                continue
            selected.append((seq, mic))

    selected.sort(key=lambda pair: pair[1])

    os.makedirs(os.path.dirname(os.path.abspath(top_path)), exist_ok=True)
    with open(top_path, 'w') as f:
        for rank, (seq, mic) in enumerate(selected, start=1):
            f.write(f">top_{rank} | MIC={mic:.2f} | charge={net_charge(seq):.1f} "
                    f"| H={mean_hydrophobicity(seq):.2f}\n{seq}\n")

    if len(selected) < top_k:
        print(f"  [WARNING] Wrote only {len(selected)}/{top_k} sequences to {top_path}.")
    else:
        print(f"  Wrote {len(selected)} ranked sequences to {top_path}")
    return selected


def verify_output_file(path, reference_set, min_len, max_len):
    """Re-reads the saved FASTA and independently verifies every constraint."""
    seqs = [str(r.seq) for r in SeqIO.parse(path, "fasta")]
    n_bad_len = sum(1 for s in seqs if not (min_len <= len(s) <= max_len))
    n_bad_aa = sum(1 for s in seqs if not set(s) <= VALID_AA)
    n_in_ref = sum(1 for s in seqs if s in reference_set)
    n_dup = len(seqs) - len(set(seqs))
    print("\n--- Output verification ---")
    print(f"Sequences in file:      {len(seqs)}")
    if seqs:
        lens = [len(s) for s in seqs]
        print(f"Length range:           {min(lens)}-{max(lens)} (allowed {min_len}-{max_len})")
    print(f"Out-of-range length:    {n_bad_len}")
    print(f"Non-standard residues:  {n_bad_aa}")
    print(f"Found in reference:     {n_in_ref}")
    print(f"Duplicates:             {n_dup}")
    ok = (n_bad_len == 0 and n_bad_aa == 0 and n_in_ref == 0 and n_dup == 0)
    print("VERIFICATION:", "PASSED" if ok else "FAILED")
    return ok


class LengthSampler:
    def __init__(self, path, max_len, min_pep_len=0, max_pep_len=None):
        """
        Empirical length distribution from `path`, restricted to
        [min_pep_len, max_pep_len] so no batch is wasted on lengths
        that would be rejected later.
        """
        freqs = {}
        if os.path.exists(path):
            for rec in SeqIO.parse(path, 'fasta'):
                L = min(len(str(rec.seq)), max_len)
                freqs[L] = freqs.get(L, 0) + 1
        self.distrib = np.array([freqs.get(i, 0) for i in range(max_len + 1)], dtype=float)
        if self.distrib.sum() <= 0:
            self.distrib = np.ones(max_len + 1)

        hi = max_len if max_pep_len is None else min(max_len, max_pep_len)
        mask = np.zeros(max_len + 1)
        mask[min_pep_len:hi + 1] = 1.0
        self.distrib = self.distrib * mask
        if self.distrib.sum() <= 0:
            self.distrib = mask
        self.distrib = self.distrib / self.distrib.sum()

    def sample(self, n):
        return np.argmax(np.random.multinomial(1, self.distrib, size=n), axis=1)


def get_active_model_key(t, sorted_keys):
    if not sorted_keys:
        return None
    for k in sorted_keys:
        if k >= t:
            return k
    return None


def _load_time_warp(checkpoint, device):
    """Load the MonotonicTimeWarp from a checkpoint dict.

    A checkpoint with no 'time_warp' key yields an un-initialised warp.
    """
    tw = MonotonicTimeWarp().to(device)
    if 'time_warp' in checkpoint:
        tw.load_state_dict(checkpoint['time_warp'])
    tw.eval()
    return tw


def decode_batch(pred_x0, decoder, tokenizer):
    """Decode a (B, L, dim) tensor → list of amino-acid strings."""
    with torch.no_grad():
        logits = decoder(pred_x0)
        seq_ids_list = logits.argmax(dim=-1)
    decoded = []
    for seq_ids in seq_ids_list:
        eos_idx = torch.nonzero(seq_ids == 2).squeeze()
        if eos_idx.numel() > 1:
            eos_idx = eos_idx[0].item()
        elif eos_idx.numel() == 1:
            eos_idx = eos_idx.item()
        else:
            eos_idx = len(seq_ids)
        s = tokenizer.decode(seq_ids[1:eos_idx]) \
            .replace(" ", "").replace("<cls>", "").replace("<eos>", "").replace("<pad>", "")
        decoded.append(s)
    return decoded


def ddpm_sample(
    denoiser, x_T, timesteps, betas, sqrt_alphas, alphas_cumprod,
    alphas_cumprod_prev, sqrt_alphas_cumprod_prev,
    attention_mask, conditional, unconditional,
    decoder, tokenizer, mic_evaluator,
    log_interval, dynamic_mic_interval,
    s_target, max_mic_log, min_mic_log, initial_source_mic, cfs,
    lineas_models_dict, steering_window, steering_mode, step_noise,
    verbose, device,
):
    B = x_T.shape[0]
    x_shape = x_T.shape
    ones = torch.ones_like(x_T)

    def calc_normalized_s(mic_vals):
        mic_vals = np.clip(np.array(mic_vals, dtype=np.float32), 1e-5, None)
        return (max_mic_log - np.log2(mic_vals)) / (max_mic_log - min_mic_log + 1e-9)

    sorted_model_keys = sorted(lineas_models_dict.keys()) if lineas_models_dict else []
    denoiser_modules = dict(denoiser.named_modules())
    current_mics = [initial_source_mic] * B
    x_t = x_T.clone()

    for step_idx, t in enumerate(reversed(range(1, timesteps + 1))):
        hooks = []
        active_strengths = [0.0] * B

        do_steer = steering_mode == 'full'
        if do_steer and t % dynamic_mic_interval == 0:
            decoded = decode_batch(x_t, decoder, tokenizer)
            mics = mic_evaluator.evaluate(decoded)
            current_mics = [m if not np.isnan(m) else current_mics[i]
                             for i, m in enumerate(mics)]

        if do_steer and lineas_models_dict:
            model_key = get_active_model_key(t, sorted_model_keys)
            if model_key is not None and (model_key - t) < steering_window:
                sd = lineas_models_dict[model_key]
                steer_model = sd['model']
                time_warp   = sd['time_warp']

                with torch.no_grad():
                    s_src = torch.tensor(calc_normalized_s(current_mics),
                                         device=device, dtype=torch.float32)
                    s_tgt = torch.full((B,), s_target, device=device, dtype=torch.float32)
                    delta_t = (time_warp(s_tgt) - time_warp(s_src)).clamp(min=0.0)
                    steer_model.set_strength(delta_t.mean().item())
                    active_strengths = delta_t.tolist()

                for layer_name in steer_model.layer_names:
                    module = denoiser_modules[layer_name]
                    map_m = steer_model.get_map(layer_name)
                    hooks.append(module.register_forward_hook(apply_steering_only_hook(map_m)))

        batched_t = torch.full((B,), t, device=device, dtype=torch.long)

        cond_pred   = denoiser(x_t, batched_t, y=conditional,   attention_mask=attention_mask)
        for h in hooks: h.remove()
        uncond_pred = denoiser(x_t, batched_t, y=unconditional, attention_mask=attention_mask)

        pred_x0 = (1 + cfs) * cond_pred - cfs * uncond_pred

        if verbose and (t % log_interval == 0 or t == 1):
            dl = decode_batch(pred_x0, decoder, tokenizer)
            ml = mic_evaluator.evaluate(dl)
            print(f"  [t={t:04d} | {steering_mode}]")
            for i, (seq, mic, st) in enumerate(zip(dl, ml, active_strengths)):
                print(f"    [{i+1}] MIC={mic:6.2f} str={st:.4f} {seq[:52]}{'*' if len(seq)>52 else ''}")

        if t == 1:
            x_t = pred_x0
            break

        pt = batched_t - 1
        acp  = extract(alphas_cumprod_prev,      pt, x_shape)
        sacp = extract(sqrt_alphas_cumprod_prev, pt, x_shape)
        bt   = extract(betas,                    pt, x_shape)
        sa_t = extract(sqrt_alphas,              pt, x_shape)
        act  = extract(alphas_cumprod,           pt, x_shape)

        noise = step_noise[step_idx]

        miu = (sacp * bt / (ones - act) * pred_x0
               + sa_t * (ones - acp) / (ones - act) * x_t)
        sigma = (ones - acp) / (ones - act) * bt
        x_t = miu + (0.5 * torch.log(sigma)).exp() * noise

    return x_t


def main():
    args = parse_arguments()

    if args.no_steering:
        args.steering_mode = 'none'

    DEVICE = torch.device(f"cuda:{args.gpu_id}" if torch.cuda.is_available() else "cpu")
    print(f"Device: {DEVICE} | Mode: {args.steering_mode} | Target MIC: {args.target_mic}")
    print(f"Allowed peptide length: {args.min_pep_len}-{args.max_pep_len}")

    conf = configparser.ConfigParser()
    conf.read(args.config_path)
    conf_dict = dict(conf.items('CPLDiff_conf'))
    set_seed(args.seed)

    esm_model_name = conf_dict['denoiser_esm_model_name']
    bundled_esm = CPLDIFF_DIR / esm_model_name
    if bundled_esm.exists():
        esm_model_name = str(bundled_esm)

    label_map  = {'antimicrobial': 0, 'antifungal': 1, 'antiviral': 2}
    type_map   = {'amp': 'antimicrobial', 'afp': 'antifungal', 'avp': 'antiviral'}
    target_type  = type_map[args.sample_type]
    target_label = label_map[target_type]
    data_path    = os.path.join(args.data_dir, f'{target_type}.fasta')

    reference_set = load_reference_set(args.antibacterial_fasta)
    print(f"Loaded {len(reference_set)} known antibacterial peptides from {args.antibacterial_fasta}")

    df = pd.read_csv(args.dataset_path)
    df['log2_MIC'] = np.log2(df['MIC'].clip(lower=1e-5))
    max_mic_log = df['log2_MIC'].max()
    min_mic_log = df['log2_MIC'].min()
    s_target = (max_mic_log - np.log2(args.target_mic)) / (max_mic_log - min_mic_log + 1e-9)
    s_target = float(np.clip(s_target, 0.0, 1.0))
    print(f"MIC log2 range: [{min_mic_log:.2f}, {max_mic_log:.2f}] | s_target={s_target:.4f}")

    print("Loading denoiser...")
    denoiser_mlp = [int(x) for x in conf_dict['denoiser_mlp'].split(',')]
    denoiser = Denoiser(esm_model_name,
                        int(conf_dict['denoiser_embedding']), denoiser_mlp).to(DEVICE)
    denoiser.load_state_dict(torch.load(args.denoiser_path, map_location=DEVICE, weights_only=False))
    denoiser.eval()

    print("Loading decoder...")
    tokenizer = AutoTokenizer.from_pretrained(esm_model_name, trust_remote_code=True)
    esm2 = AutoModelForMaskedLM.from_pretrained(esm_model_name,
                                                trust_remote_code=True).to(DEVICE)
    decoder = esm2.lm_head
    decoder_file = os.path.join(args.decoder_dir, f"{target_type}_decoder_model_1.pkl")
    if os.path.exists(decoder_file):
        decoder.load_state_dict(torch.load(decoder_file, map_location=DEVICE, weights_only=False))
    decoder.eval()

    print("Loading BattleAMP-APEX MIC evaluator...")
    mic_evaluator = MICEvaluator(apex_dir=args.apex_dir, device=DEVICE)

    lineas_models_dict = {}
    if args.steering_mode != 'none' and args.base_model_dir:
        layers_info = get_all_layernorms(denoiser)
        for t in args.specific_timesteps:
            path = os.path.join(args.base_model_dir, f'lineas_map_t{t}.pth')
            if not os.path.exists(path):
                print(f"  [warn] checkpoint not found: {path}")
                continue
            try:
                ckpt = torch.load(path, map_location=DEVICE, weights_only=False)
                lm = MultiLayerLinEAS(layers_info).to(DEVICE)
                lm.load_state_dict(ckpt.get('lineas_map', ckpt), strict=False)
                lm.eval()
                tw = _load_time_warp(ckpt, DEVICE)
                lineas_models_dict[t] = {'model': lm, 'time_warp': tw}
                print(f"  Loaded LinEAS checkpoint t={t}")
            except Exception as e:
                print(f"  [warn] failed to load t={t}: {e}")

    timesteps = int(conf_dict['time_steps'])
    t_range = torch.arange(1, timesteps + 1, dtype=torch.long, device=DEVICE)
    alphas_cumprod = 1 - torch.sqrt(t_range / (timesteps + float(conf_dict['sqrt_s'])))
    betas_list = []
    onemb = 0.0
    for i in range(timesteps):
        ac = alphas_cumprod[i].item()
        betas_list.append(1 - ac if i == 0 else 1 - ac / onemb)
        onemb = ac
    betas = torch.tensor(betas_list, device=DEVICE)
    alphas = 1.0 - betas
    sqrt_alphas = torch.sqrt(alphas)
    alphas_cumprod_prev = F.pad(alphas_cumprod[:-1], (1, 0), value=1.0)
    sqrt_alphas_cumprod_prev = torch.sqrt(alphas_cumprod_prev)

    max_len   = int(conf_dict['max_length'])
    emb_dim   = int(conf_dict['denoiser_embedding'])
    length_sampler = LengthSampler(
        path=data_path, max_len=max_len,
        min_pep_len=args.min_pep_len, max_pep_len=args.max_pep_len,
    )

    out_dir = Path(args.out_dir) if args.out_dir else Path(Path(sys.argv[0]).stem)
    out_dir.mkdir(parents=True, exist_ok=True)
    library_path = out_dir / 'library.fasta'
    top_path = out_dir / 'top.fasta'
    library_path.write_text('')

    accepted_set    = set()
    total_saved     = 0
    total_rejected  = Counter()
    batch_idx       = 0

    while total_saved < args.n_sequences:
        needed = args.n_sequences - total_saved
        current_bs = max(1, min(args.batch_size, int(math.ceil(needed * args.oversample))))

        batch_seed = args.seed + batch_idx
        set_seed(batch_seed)
        print(f"\n>>> Batch {batch_idx + 1} ({current_bs} sequences, need {needed} more) seed={batch_seed} <<<")

        lens = length_sampler.sample(current_bs)
        attention_mask = torch.zeros(current_bs, max_len + 2, device=DEVICE)
        for i, L in enumerate(lens):
            attention_mask[i, :int(L) + 2] = 1.0

        x_shape = [current_bs, max_len + 2, emb_dim]
        cond   = torch.full((current_bs,), target_label, device=DEVICE, dtype=torch.int)
        uncond = torch.full((current_bs,), 3,            device=DEVICE, dtype=torch.int)

        x_T = torch.randn(x_shape, device=DEVICE)
        step_noise = [torch.randn_like(x_T) for _ in range(timesteps - 1)]

        print(f"  Running sampler (mode={args.steering_mode})...")
        with torch.no_grad():
            final_x = ddpm_sample(
                denoiser=denoiser, x_T=x_T,
                timesteps=timesteps,
                betas=betas, sqrt_alphas=sqrt_alphas,
                alphas_cumprod=alphas_cumprod,
                alphas_cumprod_prev=alphas_cumprod_prev,
                sqrt_alphas_cumprod_prev=sqrt_alphas_cumprod_prev,
                attention_mask=attention_mask,
                conditional=cond, unconditional=uncond,
                decoder=decoder, tokenizer=tokenizer,
                mic_evaluator=mic_evaluator,
                log_interval=args.log_interval,
                dynamic_mic_interval=args.dynamic_mic_interval,
                s_target=s_target, max_mic_log=max_mic_log, min_mic_log=min_mic_log,
                initial_source_mic=args.source_mic,
                cfs=args.cfs,
                lineas_models_dict=lineas_models_dict,
                steering_window=args.steering_window,
                steering_mode=args.steering_mode,
                step_noise=step_noise,
                verbose=args.verbose,
                device=DEVICE,
            )

        final_decoded = decode_batch(final_x, decoder, tokenizer)
        new_seqs, rejected = filter_candidates(
            final_decoded, accepted_set, reference_set,
            args.min_pep_len, args.max_pep_len, max_accept=needed,
        )
        total_rejected.update(rejected)

        if new_seqs:
            new_mics = mic_evaluator.evaluate(new_seqs)
            with open(library_path, 'a') as f:
                for seq, mic in zip(new_seqs, new_mics):
                    total_saved += 1
                    f.write(f">seq_{total_saved} | mode={args.steering_mode} | MIC={mic:.2f}\n{seq}\n")

        batch_idx += 1
        print(f"  Accepted {len(new_seqs)} | rejected: {dict(rejected)} "
              f"| saved {total_saved}/{args.n_sequences} so far.")

    print(f"\nDone. {total_saved} sequences written to {library_path}")
    print(f"Total rejected: {dict(total_rejected)}")

    verify_output_file(library_path, reference_set, args.min_pep_len, args.max_pep_len)

    print(f"\n--- Building top-{args.top_k} list ---")
    create_top_100(library_path, args.antibacterial_fasta, top_path, top_k=args.top_k)


if __name__ == '__main__':
    main()
