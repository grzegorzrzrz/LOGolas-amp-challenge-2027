# LOGolas — AMP Challenge 2027 Submission

**Authors:** Grzegorz Siudak, Paweł Skierś, Kamil Deja

---

## Quick start

```bash
uv sync
uv run generate
```

---
## Abstract
LOGolas is an inference-time activation steering framework for antimicrobial peptide (AMP) generation that extends the steering approach of Legolas. It is built on the frozen CPL-Diff latent diffusion model and requires no retraining.

Unlike standard activation steering, LOGolas parameterizes the intervention as a continuous affine transformation. Rather than learning a static transformation matrix, we learn its matrix logarithm: a Lie-algebra generator **G** for every LayerNorm activation in the denoiser. The intervention is applied as the matrix exponential **exp(Δ·G)**, where the scalar Δ is a continuous steering strength and Δ = 0 recovers the unmodified model.

The generators are trained on experimentally measured minimum inhibitory concentrations (MICs), converted into a normalized log₂ potency score. We sample pairs of peptides with different potencies, noise their latent embeddings to a given diffusion step, and pass both through the frozen denoiser. At each LayerNorm, exp(Δ·G) is trained to map the activations of one peptide onto those of the other, using a Wasserstein plus cosine loss. Here Δ is the difference between the two potencies after a jointly learned monotonic time warp. Because internal representations shift along the generative trajectory, we train 20 independent sets of generators and time warps, each covering a window of the diffusion process (t = 100 … 2000). Only the generators and time warps are trained; the denoiser is never updated.

At generation time, steering is closed-loop. Every 50 diffusion steps, the partially denoised latent is decoded into a sequence and scored by an APEX predictor ensemble. The steering strength Δ is set to the difference between the time-warped target potency and the time-warped current potency, clamped at zero. The intervention therefore weakens as the sequence approaches the target activity and switches off once it is reached.

## Data Description
**Base CPL-Diff Training Data.** The foundational CPL-Diff model was trained on a large corpus of sequences assembled from public AMP databases, including APD3, CAMPR4, dbAMP2, LAMP2, DRAMP 3.0, DBAASP v3, and GRAMP.

**Steering Map Data.** The steering maps (Lie-algebra generators) and the monotonic time warps are trained on a proprietary dataset comprising AMPs tested against 11 bacterial strains (the training dataset of the APEX Predictor). To train the steering maps, we filtered this dataset for MIC measurements against *E. coli*. Peptides that were not tested against this specific strain were removed, and right-censored/inactive MIC measurements were capped at a maximum of 256 µM.

## Top Candidates Selection Procedure
Following the generation of a 50,000-member peptide library, candidates are traversed in ascending order of their predicted MIC. The selection of the top 100 candidates (`create_top_100`) is governed by a strict filtering and ranking pipeline:

**1. Novelty Filter:**
Every generated candidate must have a Levenshtein similarity ratio of ≤ 0.80 against all 39,448 known sequences in the provided `antibacterial.fasta` reference set. Peptides exceeding this similarity threshold are discarded.

**2. Physicochemical Developability Filter:**
Inspired by the biologically informed boundaries defined in the OmegAMP paper, candidates are filtered to retain only those falling within expert-defined ranges known to favor synthesizability, stability, and broad-spectrum activity:
*   **Length:** 10 to 30 amino acids.
*   **Net Charge:** +2.0 to +10.0 (calculated at neutral pH as K + R − D − E + 0.1·H).
*   **Hydrophobicity:** −0.5 to 0.8 (mean per-residue hydrophobicity on the Eisenberg consensus scale).

**3. Ranking:**
Surviving peptides that pass both the novelty and developability filters are ranked by their mean predicted MIC across all 11 bacterial strains, as evaluated by the APEX Predictor ensemble.

**4. Fallback Mechanism:**
If fewer than 100 peptides pass both filters, the remaining slots are backfilled with the best-MIC peptides that clear the Novelty Filter (never relaxed) but fall outside the developability window.

***

## References
1. Luo, Z., Geng, A., Wei, L., Zou, Q., Cui, F., Zhang, Z. (2025). CPL-Diff: A Diffusion Model for De Novo Design of Functional Peptide Sequences with Fixed Length. *Advanced Science*, 12, 2412926. https://doi.org/10.1002/advs.202412926
2. Siudak, G., Szymczak, P., Szczurek, E., Deja, K. (2026). Activity is in the Activations: Inference-Time Steering of Peptide Models for Antimicrobial Design. In: Ceci, M., et al. *Machine Learning and Knowledge Discovery in Databases. Research Track. ECML PKDD 2026*. Lecture Notes in Computer Science, vol 16942. Springer, Cham. https://doi.org/10.1007/978-3-032-37657-2_21
3. Wan, F., Torres, M.D.T., Peng, J. et al. (2024). Deep-learning-enabled antibiotic discovery through molecular de-extinction. *Nature Biomedical Engineering*, 8, 854–871. https://doi.org/10.1038/s41551-024-01201-x
4. Soares, D., Hetzel, L., Szymczak, P., Torres, M.D.T., Sommer, J., de la Fuente-Nunez, C., Theis, F., Günnemann, S., Szczurek, E. (2026). OmegAMP: Targeted AMP Discovery via Biologically Informed Generation. *arXiv preprint*, arXiv:2504.17247. https://arxiv.org/abs/2504.17247

## License

Three licenses apply. Full license texts are provided in the `LICENSE` file at each relevant location.

* **LOGolas code** (everything not listed below): MIT License, © 2026 Grzegorz Siudak. See `LICENSE`.
* **`src/apple/wasserstein.py`**: modified Apple Inc. software, © 2025 Apple Inc., distributed under Apple's license. See `src/apple/LICENSE`.
* **`apex/` and `data/training/training.csv`**: distributed under the Penn Software APEX license, © 2022 The Trustees of the University of Pennsylvania. **Non-profit research use only.** See `apex/LICENSE`.

The MIT License for LOGolas code does not apply to the third-party Apple or Penn Software APEX components listed above.