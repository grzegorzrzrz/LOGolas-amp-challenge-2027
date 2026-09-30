import torch
import torch.nn as nn
import torch.nn.functional as F

class GeneratorLinEASMap(nn.Module):
    def __init__(self, feature_dim):
        super().__init__()
        self.feature_dim = feature_dim

        self.G_A = nn.Parameter(torch.zeros(feature_dim, feature_dim))
        self.t = nn.Parameter(torch.zeros(feature_dim))

        self.register_buffer('A_s', torch.eye(feature_dim))
        self.register_buffer('t_s', torch.zeros(feature_dim))
        self.register_buffer('current_s', torch.tensor(0.0))

    def _base_G(self, dtype, device):
        dim = self.feature_dim
        G = torch.zeros(dim + 1, dim + 1, dtype=dtype, device=device)
        G[:dim, :dim] = self.G_A
        G[:dim, dim] = self.t
        return G

    @torch.no_grad()
    def set_strength(self, s):
        """
        Precalculates the exact affine transformation for a specific strength 's'.
        Called once before generation to avoid running matrix_exp on every diffusion step.
        """
        self.current_s.fill_(float(s))
        if s == 0.0:
            self.A_s.copy_(torch.eye(self.feature_dim, device=self.A_s.device))
            self.t_s.copy_(torch.zeros(self.feature_dim, device=self.t_s.device))
            return

        dim = self.feature_dim
        G = self._base_G(self.G_A.dtype, self.G_A.device)
        M_s = torch.matrix_exp(s * G)
        self.A_s.copy_(M_s[:dim, :dim])
        self.t_s.copy_(M_s[:dim, dim])

    def forward(self, x):
        """Applies the affine map cached by the last set_strength() call."""
        if self.current_s.item() == 0.0:
            return x
        return F.linear(x, self.A_s.to(x.dtype), self.t_s.to(x.dtype))

    def forward_pairs(self, v1, delta_t):
        """
        v1:       (B, seq_len, dim) source vectors
        delta_t:  (B,) per-sample scalar Δt = y - x
        returns:  (B, seq_len, dim) predicted v2
        """
        B, _, dim = v1.shape
        G = self._base_G(v1.dtype, v1.device)

        delta = delta_t.to(v1.dtype).view(B, 1, 1)
        G_batch = delta * G.unsqueeze(0)
        M_batch = torch.matrix_exp(G_batch)

        A_batch = M_batch[:, :dim, :dim]
        t_batch = M_batch[:, :dim, dim].unsqueeze(1)

        v2_pred = torch.bmm(v1, A_batch.transpose(1, 2)) + t_batch

        return v2_pred


captured_activations = {}

def get_all_layernorms(model):
    """Finds all LayerNorm modules and returns their names and dimensions."""
    layers_info = {}

    for name, module in model.named_modules():
        if isinstance(module, torch.nn.LayerNorm):
            if isinstance(module.normalized_shape, (list, tuple)):
                dim = module.normalized_shape[0]
            else:
                dim = module.normalized_shape

            layers_info[name] = dim

    return layers_info

class MultiLayerLinEAS(nn.Module):
    def __init__(self, layers_info):
        super().__init__()
        self.maps = nn.ModuleDict()
        self.layer_names = list(layers_info.keys())

        for name, dim in layers_info.items():
            safe_name = name.replace('.', '_')
            self.maps[safe_name] = GeneratorLinEASMap(dim)

    def get_map(self, layer_name):
        return self.maps[layer_name.replace('.', '_')]

    def set_strength(self, new_strength):
        """Updates the strength for ALL layers controlled by this module."""
        for layer_map in self.maps.values():
            layer_map.set_strength(new_strength)

def get_capture_hook(save_key):
    def hook(model, input, output):
        captured_activations[save_key] = output
        return output
    return hook

def apply_steering_only_hook(steering_map):
    def hook(model, input, output):
        return steering_map(output)
    return hook

class MonotonicTimeWarp(nn.Module):
    def __init__(self, hidden_dim: int = 16, n_hidden_layers: int = 1, weight_floor: float = 1e-4):
        super().__init__()
        dims = [1] + [hidden_dim] * n_hidden_layers + [1]
        self.raw_weights = nn.ParameterList([
            nn.Parameter(torch.randn(dims[i + 1], dims[i]) * 0.5)
            for i in range(len(dims) - 1)
        ])
        self.biases = nn.ParameterList([
            nn.Parameter(torch.zeros(dims[i + 1])) for i in range(len(dims) - 1)
        ])
        self.weight_floor = weight_floor
        self.n_layers = len(dims) - 1

    def forward(self, s: torch.Tensor) -> torch.Tensor:
        h = s.unsqueeze(-1)
        for i, (raw_w, b) in enumerate(zip(self.raw_weights, self.biases)):
            w = F.softplus(raw_w) + self.weight_floor
            h = F.linear(h, w, b)
            if i < self.n_layers - 1:
                h = torch.tanh(h)
        return h.squeeze(-1)
