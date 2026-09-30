# For licensing see accompanying LICENSE file.
# Copyright (C) 2025 Apple Inc. All Rights Reserved.
import typing as t
import torch
import numpy as np


def wasserstein_trim_sort(u_values, v_values, p=1):
    """
    Computes a naive, non-deterministic approximation of the p-Wasserstein
    distance by randomly subsampling the larger distribution.

    *** WARNING: This is not the correct Wasserstein distance. ***
    The result is non-deterministic (changes on every run) and biased.
    It should not be used for reliable or reproducible measurements.

    Args:
        u_values (Tensor): Samples from the first distribution.
        v_values (Tensor): Samples from the second distribution.
        p (int): The order of the distance.

    Returns:
        Tensor: A random, biased approximation of the p-Wasserstein distance.
    """
    u_values = torch.as_tensor(u_values, dtype=torch.float32)
    v_values = torch.as_tensor(v_values, dtype=torch.float32)

    src_size = u_values.shape[-1]
    dst_size = v_values.shape[-1]

    # If sizes are different, subsample the larger distribution
    if src_size != dst_size:
        min_size = min(src_size, dst_size)
        if src_size > dst_size:
            # u_values is larger, sample it down
            # NOTE: This uses the same random indices for all items in a batch
            rand_indices = torch.randperm(src_size)[:min_size]
            u_sub = u_values[..., rand_indices]
            v_sub = v_values
        else:
            # v_values is larger, sample it down
            rand_indices = torch.randperm(dst_size)[:min_size]
            u_sub = u_values
            v_sub = v_values[..., rand_indices]
    else:
        # Sizes are the same, no subsampling needed
        u_sub = u_values
        v_sub = v_values

    # Sort the samples
    u_sorted = torch.sort(u_sub, dim=-1).values
    v_sorted = torch.sort(v_sub, dim=-1).values

    # Compute the distance on the (potentially subsampled) distributions
    diff = u_sorted - v_sorted

    if p == 1:
        return torch.sum(torch.abs(diff), dim=-1)

    return torch.sum(torch.pow(diff, p), dim=-1)

def wasserstein_trim_sort_omegamp(u_values, v_values, p=1):
    """
    Fixed for OmegaMP.
    Expects u_values and v_values of shape (N_samples, Channels).
    Sorts across N_samples (dim=0) to preserve the biological meaning of Channels.
    """
    u_values = torch.as_tensor(u_values, dtype=torch.float32)
    v_values = torch.as_tensor(v_values, dtype=torch.float32)

    # FIX 1: Look at dim=0 (number of tokens/samples) instead of dim=-1 (Channels)
    src_size = u_values.shape[0]
    dst_size = v_values.shape[0]

    # If sizes are different, subsample the larger distribution
    if src_size != dst_size:
        min_size = min(src_size, dst_size)
        if src_size > dst_size:
            # u_values is larger, sample it down along dim=0
            rand_indices = torch.randperm(src_size, device=u_values.device)[:min_size]
            u_sub = u_values[rand_indices, :]
            v_sub = v_values
        else:
            # v_values is larger, sample it down along dim=0
            rand_indices = torch.randperm(dst_size, device=v_values.device)[:min_size]
            u_sub = u_values
            v_sub = v_values[rand_indices, :]
    else:
        # Sizes are the same, no subsampling needed
        u_sub = u_values
        v_sub = v_values

    # FIX 2: Sort along dim=0 (Tokens/Samples), NOT dim=-1 (Channels)
    u_sorted = torch.sort(u_sub, dim=0).values
    v_sorted = torch.sort(v_sub, dim=0).values

    # Compute the distance
    diff = u_sorted - v_sorted

    # FIX 3: Average across the sorted samples (dim=0) to get distance per channel
    if p == 1:
        return torch.mean(torch.abs(diff), dim=0)

    return torch.mean(torch.pow(torch.abs(diff), p), dim=0)

def wasserstein_distance_pytorch(
    u_values, v_values, u_weights=None, v_weights=None, p=1
):
    """
    Computes the 1D Wasserstein-p distance for batches of discrete distributions.

    Parameters
    ----------
    u_values, v_values : torch.Tensor
        2-D tensors of shape (batch_size, num_u_values) and (batch_size, num_v_values).
    u_weights, v_weights : torch.Tensor, optional
        2-D tensors of weights. If None, weights are assumed to be uniform.
        Shapes must match u_values and v_values respectively.
    p : int, optional
        The order of the Wasserstein distance. Default is 1.

    Returns
    -------
    distance : torch.Tensor
        A 1-D tensor of shape (batch_size,) containing the Wasserstein distance
        for each pair of distributions in the batch.
    """
    # Ensure inputs are 2D tensors.
    # We'll keep float64 for precision.
    u_values = torch.as_tensor(u_values, dtype=torch.float64)
    v_values = torch.as_tensor(v_values, dtype=torch.float64)
    if u_values.dim() == 1:
        u_values = u_values.unsqueeze(0)
    if v_values.dim() == 1:
        v_values = v_values.unsqueeze(0)

    batch_size = u_values.shape[0]
    device, dtype = u_values.device, u_values.dtype

    if u_weights is not None:
        u_weights = torch.as_tensor(u_weights, dtype=dtype, device=device)
        if u_weights.dim() == 1:
            u_weights = u_weights.unsqueeze(0)
        # ADD THIS: Broadcast weights to match the batch size of u_values
        if u_weights.shape[0] == 1 and u_values.shape[0] > 1:
            u_weights = u_weights.expand(u_values.shape[0], -1)

    if v_weights is not None:
        v_weights = torch.as_tensor(v_weights, dtype=dtype, device=device)
        if v_weights.dim() == 1:
            v_weights = v_weights.unsqueeze(0)
        # ADD THIS: Broadcast weights to match the batch size of v_values
        if v_weights.shape[0] == 1 and v_values.shape[0] > 1:
            v_weights = v_weights.expand(v_values.shape[0], -1)

    # Sort the values along the last dimension
    u_sorter = torch.argsort(u_values, dim=-1)
    v_sorter = torch.argsort(v_values, dim=-1)

    # Gather the sorted values
    u_values_sorted = torch.gather(u_values, -1, u_sorter)
    v_values_sorted = torch.gather(v_values, -1, v_sorter)

    # Concatenate and sort all values
    all_values = torch.cat([u_values_sorted, v_values_sorted], dim=-1)
    all_values_sorted, _ = torch.sort(all_values, dim=-1, stable=True)

    # Compute the differences between adjacent sorted values
    deltas = torch.diff(all_values_sorted, dim=-1)

    # Get the respective positions of the values of u and v among the values of
    # both distributions. `torch.searchsorted` is batched-aware.
    u_cdf_indices = torch.searchsorted(
        u_values_sorted, all_values_sorted[:, :-1].contiguous(), right=True
    )
    v_cdf_indices = torch.searchsorted(
        v_values_sorted, all_values_sorted[:, :-1].contiguous(), right=True
    )

    # Calculate the CDFs of u and v using their weights, if specified.
    if u_weights is None:
        # Uniform weights
        u_cdf = u_cdf_indices.to(dtype) / u_values.shape[-1]
    else:
        # Use provided weights
        u_sorted_weights = torch.gather(u_weights, -1, u_sorter)
        u_cumweights = torch.cumsum(u_sorted_weights, dim=-1)
        # Pad with a zero at the beginning for each batch item
        zeros_pad = torch.zeros((batch_size, 1), dtype=dtype, device=device)
        u_sorted_cumweights = torch.cat([zeros_pad, u_cumweights], dim=-1)

        # Gather the cumulative weights and normalize
        u_cdf = torch.gather(u_sorted_cumweights, -1, u_cdf_indices)
        # Denominator needs to be broadcastable: (batch_size, 1)
        total_weight = u_sorted_cumweights[:, -1].unsqueeze(-1)
        u_cdf = u_cdf / total_weight

    if v_weights is None:
        # Uniform weights
        v_cdf = v_cdf_indices.to(dtype) / v_values.shape[-1]
    else:
        # Use provided weights
        v_sorted_weights = torch.gather(v_weights, -1, v_sorter)
        v_cumweights = torch.cumsum(v_sorted_weights, dim=-1)
        zeros_pad = torch.zeros((batch_size, 1), dtype=dtype, device=device)
        v_sorted_cumweights = torch.cat([zeros_pad, v_cumweights], dim=-1)

        v_cdf = torch.gather(v_sorted_cumweights, -1, v_cdf_indices)
        total_weight = v_sorted_cumweights[:, -1].unsqueeze(-1)
        v_cdf = v_cdf / total_weight

    # Compute the value of the integral based on the CDFs.
    # This is a batched dot product: (a * b).sum(dim=-1)
    diff_cdf = u_cdf - v_cdf

    if p == 1:
        # Batched dot product
        return (torch.abs(diff_cdf) * deltas).sum(dim=-1)
    if p == 2:
        return (torch.square(diff_cdf) * deltas).sum(dim=-1)

    return (torch.pow(diff_cdf, p) * deltas).sum(dim=-1)

def get_loss(name: str) -> t.Callable[[torch.Tensor, torch.Tensor], torch.Tensor]:
    """
    Returns the final loss function. We will compute the mean over all dimensions.
    """
    if name == "wasserstein":
        # The returned function will be our final loss criterion
        return lambda x, y, p: wasserstein_trim_sort(x, y, p=p).mean()
    elif name == "wasserstein_omegamp":
        return lambda x, y, p: wasserstein_trim_sort_omegamp(x, y, p=p).mean()
    elif name == "wasserstein_exact":
        return lambda x, y, p, wx, wy: wasserstein_distance_pytorch(
            x.T, y.T, u_weights=wx, v_weights=wy, p=p
        ).mean()
    else:
        raise ValueError(f"Loss '{name}' not recognized.")