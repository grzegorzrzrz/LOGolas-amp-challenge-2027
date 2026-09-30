import torch
import torch.nn.functional as F
from torch.optim.lr_scheduler import CosineAnnealingLR
import pandas as pd
import numpy as np
from tqdm import tqdm
import configparser
import os
import argparse
from torch.utils.tensorboard import SummaryWriter
from torch.utils.data import DataLoader

from CPLDiff.models.Denoiser import Denoiser
from CPLDiff.utils.CPLDiffDataset import XYDataset
from CPLDiff.utils.utils import extract
from transformers import EsmTokenizer, EsmModel

from .logolasmap import (
    MultiLayerLinEAS, get_all_layernorms,
    get_capture_hook, captured_activations,
    MonotonicTimeWarp,
)

from apple.wasserstein import get_loss


def parse_arguments():
    parser = argparse.ArgumentParser(description="Train Continuous LinEAS models.")
    parser.add_argument('--config_path', type=str, default='config.ini')
    parser.add_argument('--dataset_path', type=str, default='data/new_lineas/ecoli.csv', help='Path to single dataset CSV')
    parser.add_argument('--save_dir', type=str, default='models/legolas')
    parser.add_argument('--denoiser_path', type=str, default='save_model/denoise_model.pkl')

    parser.add_argument('--lr', type=float, default=1e-3)
    parser.add_argument('--batch_size', type=int, default=64)
    parser.add_argument('--main_steps', type=int, default=1000)
    parser.add_argument('--gpu_id', type=int, default=0)
    parser.add_argument('--grad_clip', type=float, default=1.0)
    parser.add_argument('--init_scale', type=float, default=0.001)

    parser.add_argument('--t_start', type=int, default=100)
    parser.add_argument('--t_end', type=int, default=2000)
    parser.add_argument('--t_step', type=int, default=100)

    parser.add_argument('--w_swd', type=float, default=1.0, help='Weight for Sliced Wasserstein Distance')
    parser.add_argument('--w_cosine', type=float, default=0.1, help='Weight for Cosine Distance loss')

    return parser.parse_args()


def precompute_embeddings(dataset, tokenizer, model, device, batch_size=32, max_len=128):
    temp_loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    all_embeddings = []
    all_labels = []

    with torch.no_grad():
        for batch in tqdm(temp_loader, desc="Embedding"):
            sequences = batch['sequences']
            labels = batch['labels']
            encoded = tokenizer(sequences, padding='max_length', truncation=True, max_length=max_len, return_tensors="pt")
            outputs = model(encoded['input_ids'].to(device)).last_hidden_state
            all_embeddings.append(outputs.cpu())
            all_labels.append(labels.cpu())

    return torch.cat(all_embeddings, dim=0), torch.cat(all_labels, dim=0)


def small_init_(lineas_model, scale: float):
    with torch.no_grad():
        for p in lineas_model.maps.parameters():
            if scale == 0.0:
                p.zero_()
            else:
                p.normal_(mean=0.0, std=scale)


def main():
    args = parse_arguments()
    DEVICE = torch.device(f"cuda:{args.gpu_id}" if torch.cuda.is_available() else "cpu")
    print(f"Device: {DEVICE}")

    if args.w_swd <= 0 and args.w_cosine <= 0:
        raise ValueError("No active loss term: set --w_swd and/or --w_cosine above 0.")

    conf = configparser.ConfigParser()
    conf.read(args.config_path)
    conf_dict = dict(conf.items('CPLDiff_conf'))

    diff_t_range = torch.arange(1, int(conf_dict['time_steps']) + 1, dtype=torch.long, device=DEVICE)
    alphas_cumprod = 1 - torch.sqrt(diff_t_range / (int(conf_dict['time_steps']) + float(conf_dict['sqrt_s'])))
    sqrt_alphas_cumprod = torch.sqrt(alphas_cumprod)
    sqrt_one_minus_alphas_cumprod = torch.sqrt(1. - alphas_cumprod)

    print(f"Loading data from {args.dataset_path}...")
    df = pd.read_csv(args.dataset_path)

    df['log2_MIC'] = np.log2(df['MIC'])
    max_mic_log = df['log2_MIC'].max()
    min_mic_log = df['log2_MIC'].min()

    df['s_value'] = (max_mic_log - df['log2_MIC']) / (max_mic_log - min_mic_log + 1e-9)
    print(f"MIC Range: {df['MIC'].min()} to {df['MIC'].max()}")
    print(f"Normalized 's' Range: {df['s_value'].min():.2f} to {df['s_value'].max():.2f}")

    dataset_xy = XYDataset(df)
    s_values_tensor = torch.tensor(df['s_value'].values, dtype=torch.float32)

    tokenizer = EsmTokenizer.from_pretrained(conf_dict['denoiser_esm_model_name'])
    esm2_model = EsmModel.from_pretrained(conf_dict['denoiser_esm_model_name']).to(DEVICE)
    esm2_model.eval()

    emb_tensor, label_tensor = precompute_embeddings(dataset_xy, tokenizer, esm2_model, DEVICE, 32)
    del esm2_model
    torch.cuda.empty_cache()

    N = emb_tensor.shape[0]

    denoiser = Denoiser(
        conf_dict['denoiser_esm_model_name'],
        int(conf_dict['denoiser_embedding']),
        [int(i) for i in conf_dict['denoiser_mlp'].split(',')]
    ).to(DEVICE)
    denoiser.load_state_dict(torch.load(args.denoiser_path, map_location=DEVICE))
    denoiser.eval()

    layers_info = get_all_layernorms(denoiser)
    denoiser_modules = dict(denoiser.named_modules())
    criterion_omegamp = get_loss("wasserstein_omegamp")

    def train_lineas_for_diff_timestep(diff_timestep):
        save_path = f'{args.save_dir}/lineas_map_t{diff_timestep}.pth'
        writer = SummaryWriter(log_dir=f'{args.save_dir}/logs/t{diff_timestep}')

        lineas_model = MultiLayerLinEAS(layers_info).to(DEVICE)
        small_init_(lineas_model, args.init_scale)

        time_warp = MonotonicTimeWarp().to(DEVICE)

        params = list(lineas_model.maps.parameters()) + list(time_warp.parameters())
        optimizer = torch.optim.Adam(params, lr=args.lr, weight_decay=0.0)

        scheduler = CosineAnnealingLR(optimizer, T_max=args.main_steps, eta_min=args.lr * 0.01)

        progress_bar = tqdm(range(args.main_steps), desc=f"Training Diff_t={diff_timestep}")

        for step in progress_bar:
            idx1 = torch.randint(0, N, (args.batch_size,))
            idx2 = torch.randint(0, N, (args.batch_size,))

            v1_x0 = emb_tensor[idx1].to(DEVICE)
            v2_x0 = emb_tensor[idx2].to(DEVICE)
            v1_y = label_tensor[idx1].to(DEVICE)
            v2_y = label_tensor[idx2].to(DEVICE)
            x_s = s_values_tensor[idx1].to(DEVICE)
            y_s = s_values_tensor[idx2].to(DEVICE)

            delta_t = time_warp(y_s) - time_warp(x_s)

            with torch.no_grad():
                dt = torch.full((args.batch_size,), diff_timestep, device=DEVICE, dtype=torch.long)
                noise = torch.randn_like(v1_x0)

                sqrt_a = extract(sqrt_alphas_cumprod, dt - 1, v1_x0.shape)
                sqrt_oneminus = extract(sqrt_one_minus_alphas_cumprod, dt - 1, v1_x0.shape)

                v1_x_t = sqrt_a * v1_x0 + sqrt_oneminus * noise
                v2_x_t = sqrt_a * v2_x0 + sqrt_oneminus * noise

                x_t_cat = torch.cat([v1_x_t, v2_x_t], dim=0)
                y_cat = torch.cat([v1_y, v2_y], dim=0)
                dt_cat = torch.cat([dt, dt], dim=0)

            captured_activations.clear()
            hooks = []
            for name in lineas_model.layer_names:
                module = denoiser_modules[name]
                hooks.append(module.register_forward_hook(get_capture_hook(name)))

            with torch.no_grad():
                denoiser(x_t_cat, dt_cat, y=y_cat)

            for h in hooks: h.remove()

            optimizer.zero_grad()
            total_loss = 0.0

            track_swd = 0.0
            track_cosine = 0.0

            B = args.batch_size

            for name in lineas_model.layer_names:
                act = captured_activations[name]
                v1_act, v2_act = act[:B], act[B:]
                map_module = lineas_model.get_map(name)

                v2_pred_3d = map_module.forward_pairs(v1_act, delta_t)

                v2_pred_flat = v2_pred_3d.reshape(-1, v2_pred_3d.shape[-1])
                v2_flat = v2_act.reshape(-1, v2_act.shape[-1])

                layer_loss = 0.0

                if args.w_swd > 0:
                    w_loss = criterion_omegamp(v2_pred_flat, v2_flat, p=2)
                    layer_loss += args.w_swd * w_loss
                    track_swd += w_loss.item()

                if args.w_cosine > 0:
                    c_loss = (1.0 - F.cosine_similarity(v2_pred_flat, v2_flat, dim=-1)).mean()
                    layer_loss += args.w_cosine * c_loss
                    track_cosine += c_loss.item()

                total_loss = total_loss + layer_loss

            num_layers = len(lineas_model.layer_names)
            final_loss = total_loss / num_layers
            final_loss.backward()

            torch.nn.utils.clip_grad_norm_(params, max_norm=args.grad_clip)

            optimizer.step()
            scheduler.step()

            writer.add_scalar('Loss/Total', final_loss.item(), step)
            if args.w_swd > 0: writer.add_scalar('Loss_Components/SWD', track_swd / num_layers, step)
            if args.w_cosine > 0: writer.add_scalar('Loss_Components/Cosine', track_cosine / num_layers, step)

            writer.add_scalar('Metrics/delta_t_mean', delta_t.mean().item(), step)
            writer.add_histogram('Metrics/delta_t_dist', delta_t.detach().cpu(), step)

        writer.close()
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        save_dict = {
            'lineas_map': lineas_model.state_dict(),
            'time_warp': time_warp.state_dict()
        }
        torch.save(save_dict, save_path)
        print(f"Saved generator maps and time warp to {save_path}")

    timesteps_to_train = list(range(args.t_start, args.t_end + 1, args.t_step))
    for t in timesteps_to_train:
        train_lineas_for_diff_timestep(t)


if __name__ == "__main__":
    main()
