import os
import time
import hashlib
import warnings
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List, Literal, Optional, Union

import albumentations as A
import albumentations.pytorch
import matplotlib.gridspec as gridspec
import matplotlib.patches as patches
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from PIL import Image
from skimage.transform import resize
from torch.utils.data import DataLoader, Dataset

plt.rcParams.update({
    'font.sans-serif': ['DejaVu Sans', 'SimHei'],
    'axes.unicode_minus': False,
    'figure.dpi': 150,
    'savefig.dpi': 300,
})


# ============================================================
# ⚙️  配置
# ============================================================
@dataclass
class InferenceConfig:
    """
    推理优化开关。

    路径优先级（自动选择）：
        1. use_gpu_preprocessor=True  → GPUPreprocessor（数据全量上传GPU）
        2. use_stream_prefetch=True   → StreamPrefetchLoader（双流流水线）
        3. fallback                   → 原始 DataLoader

    fp8_mode:
        "weight_only" → Float8WeightOnlyConfig，权重一次量化（推荐）
        "dynamic"     → 动态量化，有运行时开销
        "disabled"    → 不使用 FP8

    effective_cuda_graph:
        compile=True  → inductor 内置 CUDAGraph Trees（自动）
        compile=False → 手动 CUDAGraphEngine（use_cuda_graph 控制）
    """
    use_fp8_quantization:       bool = True
    fp8_mode:                   str  = "weight_only"
    use_flash_attention:        bool = True
    use_bfloat16:               bool = True
    use_torch_compile:          bool = True
    compile_mode:               str  = "max-autotune"
    use_cuda_graph:             bool = True
    use_tf32:                   bool = True
    use_cudnn_benchmark:        bool = True
    use_gallery_cache:          bool = True
    dataloader_num_workers:     int  = 4
    dataloader_prefetch_factor: int  = 2
    # 优化路径开关
    use_gpu_preprocessor:       bool = True
    use_stream_prefetch:        bool = True
    # Profiling
    enable_profiling:           bool = False
    profile_batches:            int  = 5

    @property
    def effective_cuda_graph(self) -> bool:
        return self.use_cuda_graph and not self.use_torch_compile


# ============================================================
# 🔧  全局硬件初始化
# ============================================================
def _apply_hw_opts(cfg: InferenceConfig) -> None:
    if cfg.use_tf32:
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32        = True
        torch.set_float32_matmul_precision("high")
    if cfg.use_cudnn_benchmark:
        torch.backends.cudnn.benchmark    = True
        torch.backends.cudnn.deterministic = False
    if cfg.use_flash_attention:
        torch.backends.cuda.enable_flash_sdp(True)
        torch.backends.cuda.enable_math_sdp(False)
        torch.backends.cuda.enable_mem_efficient_sdp(True)


# ============================================================
# 📌  模型结构
# ============================================================
class NormedLinear(torch.nn.Module):
    def __init__(self, in_f: int, out_f: int):
        super().__init__()
        self.weight = torch.nn.Parameter(torch.Tensor(in_f, out_f))
        self.weight.data.uniform_(-1, 1).renorm_(2, 1, 1e-5).mul_(1e5)
        self.s = 30

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.s * F.normalize(x, dim=1).mm(
            F.normalize(self.weight, dim=0))


class AttentionPooling(torch.nn.Module):
    def __init__(self, dim: int):
        super().__init__()
        self.attn = torch.nn.Linear(dim, 1)
        torch.nn.init.trunc_normal_(self.attn.weight, std=2e-5)
        torch.nn.init.zeros_(self.attn.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return (x * torch.softmax(self.attn(x), dim=1)).sum(dim=1)


class MetricHead(torch.nn.Module):
    def __init__(self, in_dim: int = 768, hidden: int = 512,
                 out_dim: int = 256, use_bn: bool = True):
        super().__init__()
        self.mlp = torch.nn.Sequential(
            torch.nn.Linear(in_dim, hidden),
            torch.nn.BatchNorm1d(hidden) if use_bn else torch.nn.Identity(),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(hidden, out_dim),
        )
        for m in self.mlp.modules():
            if isinstance(m, torch.nn.Linear):
                torch.nn.init.kaiming_normal_(
                    m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    torch.nn.init.constant_(m.bias, 0)
            elif isinstance(m, torch.nn.BatchNorm1d):
                torch.nn.init.constant_(m.weight, 1.0)
                torch.nn.init.constant_(m.bias,   0.0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return F.normalize(self.mlp(x), p=2, dim=1)


class DINOv3Matcher(torch.nn.Module):
    """DINOv3 + gap+cls pooling + metric head。"""
    REGISTER_TOKEN_COUNT = 5

    def __init__(self, backbone: torch.nn.Module,
                 num_classes: int = 1000,
                 feature_dim: int = 768,
                 pooling: Literal[
                     "pooler", "cls", "gap-patch",
                     "gap-all", "attention", "gap+cls"
                 ] = "gap+cls",
                 head_feat_dim: int = 1024,
                 use_norm: bool = True,
                 metric_hidden: int = 512,
                 metric_out: int = 256,
                 metric_bn: bool = True):
        super().__init__()
        self.backbone  = backbone
        self.pooling   = pooling
        self.feat_dim  = feature_dim * 2 if pooling == "gap+cls" else feature_dim
        self.attn_pool = (AttentionPooling(feature_dim)
                          if pooling == "attention" else None)
        self.fc = (NormedLinear(self.feat_dim, num_classes) if use_norm
                   else torch.nn.Linear(self.feat_dim, num_classes))

        def _head():
            return torch.nn.Sequential(
                torch.nn.Linear(self.feat_dim, self.feat_dim),
                torch.nn.BatchNorm1d(self.feat_dim),
                torch.nn.ReLU(inplace=True),
                torch.nn.Linear(self.feat_dim, head_feat_dim),
            )
        self.head        = _head()
        self.head_fc     = _head()
        self.metric_head = MetricHead(self.feat_dim, metric_hidden,
                                      metric_out, metric_bn)
        self.metric_out  = metric_out
        self._init_weights()

    def _init_weights(self):
        if isinstance(self.fc, torch.nn.Linear):
            torch.nn.init.trunc_normal_(self.fc.weight, std=2e-5)
            if self.fc.bias is not None:
                torch.nn.init.zeros_(self.fc.bias)
        for head in [self.head, self.head_fc]:
            for m in head.modules():
                if isinstance(m, torch.nn.Linear):
                    torch.nn.init.trunc_normal_(m.weight, std=2e-5)
                    if m.bias is not None:
                        torch.nn.init.zeros_(m.bias)
                elif isinstance(m, torch.nn.BatchNorm1d):
                    torch.nn.init.constant_(m.weight, 1.0)
                    torch.nn.init.constant_(m.bias,   0.0)

    def _pool(self, outputs) -> torch.Tensor:
        r = self.REGISTER_TOKEN_COUNT
        if self.pooling == "pooler":
            return outputs.pooler_output
        t = outputs.last_hidden_state
        if self.pooling == "cls":
            return t[:, 0]
        if self.pooling == "gap+cls":
            return torch.cat((t[:, 0], t[:, r:].mean(1)), dim=-1)
        if self.pooling == "gap-all":
            return t.mean(1)
        if self.pooling == "gap-patch":
            return t[:, r:].mean(1)
        if self.pooling == "attention":
            return self.attn_pool(t[:, r:])
        raise ValueError(f"Unknown pooling: {self.pooling}")

    def get_embedding(self, x: torch.Tensor) -> torch.Tensor:
        """核心推理接口，供 torch.compile 编译。"""
        return self.metric_head(self._pool(self.backbone(x)))


# ============================================================
# 🚀  优化应用
# ============================================================
def _apply_model_opts(model: DINOv3Matcher,
                      cfg: InferenceConfig,
                      device: torch.device) -> DINOv3Matcher:
    model.eval()

    # 1. bfloat16
    if cfg.use_bfloat16 and device.type == "cuda":
        if torch.cuda.is_bf16_supported():
            model = model.to(torch.bfloat16)
        else:
            warnings.warn("GPU 不支持 bfloat16，跳过")

    # 2. FP8 weight_only
    if (cfg.use_fp8_quantization and cfg.fp8_mode != "disabled"
            and device.type == "cuda"):
        try:
            cc = torch.cuda.get_device_capability()
            if cc[0] > 8 or (cc[0] == 8 and cc[1] >= 9):
                from torchao.quantization import quantize_
                if cfg.fp8_mode == "weight_only":
                    try:
                        from torchao.quantization import Float8WeightOnlyConfig
                        quantize_(model, Float8WeightOnlyConfig())
                    except ImportError:
                        from torchao.quantization import float8_weight_only
                        quantize_(model, float8_weight_only())
                elif cfg.fp8_mode == "dynamic":
                    from torchao.quantization import (
                        float8_dynamic_activation_float8_weight)
                    quantize_(model,
                              float8_dynamic_activation_float8_weight())
        except ImportError:
            warnings.warn("torchao 未安装，跳过 FP8。pip install torchao")
        except Exception as e:
            warnings.warn(f"FP8 量化失败，跳过: {e}")

    # 3. torch.compile（包装独立函数，避免绑定方法重赋值问题）
    if cfg.use_torch_compile and device.type == "cuda":
        try:
            torch._dynamo.config.inline_inbuilt_nn_modules = True
            model.get_embedding = torch.compile(
                model.get_embedding,
                mode=cfg.compile_mode,
                fullgraph=False,
            )
        except Exception as e:
            warnings.warn(f"torch.compile 失败，回退 eager: {e}")

    return model


# ============================================================
# 🎯  手动 CUDA Graph 引擎（compile=False 时使用）
# ============================================================
class CUDAGraphEngine:
    def __init__(self, model: DINOv3Matcher, bs: int, sz: int,
                 device: torch.device, use_bf16: bool = True,
                 warmup: int = 3):
        self.model  = model
        self.device = device
        self.bs     = bs
        self.dtype  = (torch.bfloat16
                       if use_bf16 and torch.cuda.is_bf16_supported()
                       else torch.float32)
        self._in  = torch.zeros((bs, 3, sz, sz),
                                device=device, dtype=self.dtype)
        self._out = None
        self._g   = torch.cuda.CUDAGraph()
        with torch.inference_mode():
            for _ in range(warmup):
                self.model.get_embedding(self._in)
        torch.cuda.synchronize()
        with torch.inference_mode():
            with torch.cuda.graph(self._g):
                self._out = self.model.get_embedding(self._in)
        torch.cuda.synchronize()

    @torch.inference_mode()
    def run(self, x: torch.Tensor) -> torch.Tensor:
        x = x.to(self.device, dtype=self.dtype)
        if x.shape[0] != self.bs:
            return self.model.get_embedding(x).float()
        self._in.copy_(x)
        self._g.replay()
        return self._out.clone().float()


# ============================================================
# 🔧  数据预处理工具
# ============================================================
@lru_cache(maxsize=8)
def _circle_mask(h: int, w: int) -> np.ndarray:
    """按 (h,w) 缓存圆形 mask。"""
    cy, cx = h // 2, w // 2
    y, x   = np.ogrid[:h, :w]
    return np.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= min(h, w) / 2.0


def wafer_circle_fix(batch: np.ndarray) -> np.ndarray:
    """批量最大内接圆修正：圆内像素值为 0 → 修正为 1。"""
    if batch.ndim != 3:
        raise ValueError(f"需要 (N,H,W)，当前: {batch.shape}")
    _, h, w = batch.shape
    out     = np.asarray(batch, dtype=np.uint8).copy()
    mask    = _circle_mask(h, w)[np.newaxis]
    out[mask & (out == 0)] = 1
    return out


def preprocess_wafer_map(wmap: np.ndarray,
                         target: tuple = (64, 64)) -> np.ndarray:
    wmap = np.nan_to_num(wmap, nan=0)
    return np.clip(
        resize(wmap, target, mode='edge', order=0, preserve_range=True),
        0, 3
    ).astype(np.uint8)


class DiscreteToGray(A.ImageOnlyTransform):
    """
    离散值 [0,3] → 3 通道灰度图。
    单次内存分配：np.broadcast_to 替代 np.stack × 3。
    """
    _MAP = np.array([0, 85, 170, 255], dtype=np.uint8)

    def __init__(self, p: float = 1.0):
        super().__init__(p=p)

    def apply(self, img: np.ndarray, **params) -> np.ndarray:
        img  = np.asarray(img, dtype=np.uint8)
        gray = self._MAP[np.clip(img, 0, 3)]
        return np.ascontiguousarray(
            np.broadcast_to(gray[:, :, np.newaxis], (*gray.shape, 3))
        )

    def get_transform_init_args_names(self):
        return ()


def _build_transform(size: int = 256,
                     discrete: bool = False,
                     no_resize: bool = False) -> A.Compose:
    ops = []
    if discrete:
        ops.append(DiscreteToGray())
    if not no_resize:
        ops.append(A.Resize(size, size))
    ops += [
        A.Normalize(mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]),
        albumentations.pytorch.ToTensorV2(),
    ]
    return A.Compose(ops)


class WaferDataset(Dataset):
    def __init__(self, arr: np.ndarray, transform: A.Compose,
                 discrete: bool = False):
        if not isinstance(arr, np.ndarray):
            raise TypeError(f"需要 ndarray，当前: {type(arr)}")
        self.arr       = np.asarray(arr, dtype=np.uint8) if discrete else arr
        self.transform = transform

    def __len__(self) -> int:
        return self.arr.shape[0]

    def __getitem__(self, i: int) -> torch.Tensor:
        return self.transform(image=self.arr[i].copy())["image"]


# ============================================================
# 🚀  方向1：GPU 预处理器
# ============================================================
class GPUPreprocessor:
    """
    一次性将整个数组上传 GPU，在 GPU 上完成全部预处理。

    精度等价性（与 CPU albumentations 路径完全一致）：
      CPU: DiscreteToGray → MAP[v]/255 → Normalize((x-mean)/std)
      GPU: _MAP_F[v]      →             (x - mean) / std
      其中 _MAP_F = [0, 85/255, 170/255, 1.0]，与 MAP[v]/255 完全相同。

    注意：circle_fix 在 CPU 上完成后再传入，GPU 端不重复处理。
    """
    # 与 DiscreteToGray._MAP / 255 完全对齐
    _MAP_F = torch.tensor([0.0, 85.0/255.0, 170.0/255.0, 1.0],
                          dtype=torch.float32)
    # 与 A.Normalize 完全对齐
    _MEAN  = torch.tensor([0.485, 0.456, 0.406],
                          dtype=torch.float32).view(1, 3, 1, 1)
    _STD   = torch.tensor([0.229, 0.224, 0.225],
                          dtype=torch.float32).view(1, 3, 1, 1)

    def __init__(self, arr: np.ndarray, device: torch.device,
                 batch_size: int = 64, use_bf16: bool = True):
        """
        arr        : (N, H, W) uint8，已经过 circle_fix，离散值 [0,3]
        device     : CUDA device
        batch_size : 推理 batch 大小
        use_bf16   : 与模型精度保持一致
        """
        assert arr.ndim == 3,            f"需要 (N,H,W)，当前: {arr.shape}"
        assert arr.dtype == np.uint8,    f"需要 uint8，当前: {arr.dtype}"
        assert device.type == "cuda",    "GPUPreprocessor 仅支持 CUDA"

        self.device     = device
        self.batch_size = batch_size
        self.n          = arr.shape[0]
        self.dtype      = (torch.bfloat16
                           if use_bf16 and torch.cuda.is_bf16_supported()
                           else torch.float32)

        # ── CPU 端一次性预处理，然后整体上传 GPU ──────────────────
        # Step1: uint8 → int64（避免 GPU 端 uint8 索引溢出）
        t = torch.from_numpy(arr.astype(np.int64))           # (N,H,W)

        # Step2: 离散值 [0,3] → float [0,1]
        #   等价于 DiscreteToGray 的 MAP[v]/255
        t_f = self._MAP_F[t.clamp(0, 3)]                     # (N,H,W) float32

        # Step3: 扩展 3 通道 (N,3,H,W)，contiguous 保证内存连续
        t_f = t_f.unsqueeze(1).expand(-1, 3, -1, -1).contiguous()

        # Step4: ImageNet 归一化，等价于 A.Normalize
        t_f = (t_f - self._MEAN) / self._STD                 # (N,3,H,W)

        # Step5: pin_memory 加速 H2D，然后异步上传 GPU
        self.data = t_f.pin_memory().to(
            device, dtype=self.dtype, non_blocking=True
        )
        # 初始化时同步一次，确保数据完整上传
        torch.cuda.synchronize(device)

    def __len__(self) -> int:
        return self.n

    def __iter__(self):
        """直接切片 GPU tensor，零 CPU 开销，零 H2D 传输。"""
        for start in range(0, self.n, self.batch_size):
            yield self.data[start: start + self.batch_size]

    @classmethod
    def verify_equivalence(cls,
                           arr: np.ndarray,
                           transform: A.Compose,
                           device: torch.device,
                           n_check: int = 20,
                           tol: float = 1e-2) -> bool:
        """
        验证 GPU 路径与 CPU albumentations 路径数值等价。
        tol=1e-2：bfloat16 精度约为 1e-2，float32 误差 < 1e-5。
        """
        # 用 float32 对比，排除精度格式干扰
        gpu_proc = cls(arr[:n_check], device,
                       batch_size=n_check, use_bf16=False)
        gpu_out  = next(iter(gpu_proc)).cpu().float()         # (n,3,H,W)

        cpu_outs = []
        for i in range(n_check):
            t = transform(image=arr[i].copy())["image"]
            cpu_outs.append(t.float())
        cpu_out = torch.stack(cpu_outs, dim=0)                # (n,3,H,W)

        max_diff  = (gpu_out - cpu_out).abs().max().item()
        mean_diff = (gpu_out - cpu_out).abs().mean().item()
        passed    = max_diff < tol
        print(f"  [精度验证] 最大误差={max_diff:.6f}  "
              f"均值误差={mean_diff:.6f}  "
              f"容差={tol}  {'✅ 通过' if passed else '❌ 超出容差'}")
        return passed


# ============================================================
# 🚀  方向2：正确的 CUDA 双流 Prefetch
# ============================================================
class StreamPrefetchLoader:
    """
    真正并行的双 Stream 流水线。

    硬件层面：
      PCIe DMA 引擎（负责 H2D）与 GPU SM（负责推理）是独立硬件，
      分别挂在不同 CUDA stream 上即可天然并行。

    时序（以 4 个 batch 为例）：
    ┌──────────────────────────────────────────────────────────────┐
    │ stream_h2d : [H2D b0]──e0  [H2D b1]──e1  [H2D b2]──e2  ... │
    │ stream_comp:      wait(e0)[infer b0] wait(e1)[infer b1] ...  │
    │ CPU        : [fetch b1]   [fetch b2]   [fetch b3]   ...      │
    │                                                              │
    │ wait_event 只阻塞 GPU compute stream，CPU 线程立即继续        │
    └──────────────────────────────────────────────────────────────┘

    关键修正（相比之前版本）：
      1. event.record() 必须在 with stream_h2d 块内调用
      2. prefetch 在 __iter__ 时立即启动第一个，消费时启动下一个
      3. ping-pong 双缓冲区，避免 H2D 覆盖正在推理的 buffer
      4. _ensure_buffer 处理最后一个 batch 形状不同的情况
      5. wait_event 只阻塞 GPU stream，不阻塞 CPU 线程
    """

    def __init__(self, loader: DataLoader,
                 device: torch.device,
                 dtype: torch.dtype = torch.bfloat16,
                 n_buffers: int = 2):
        """
        loader    : 原始 CPU DataLoader
        device    : CUDA device
        dtype     : H2D 后目标精度（与模型一致）
        n_buffers : ping-pong 缓冲区数，2 足够，3 可进一步减少等待
        """
        assert device.type == "cuda", "StreamPrefetchLoader 仅支持 CUDA"
        self.loader    = loader
        self.device    = device
        self.dtype     = dtype
        self.n_buffers = n_buffers

        # 专用 H2D stream，priority=-1（高优先级，减少调度延迟）
        self.stream_h2d = torch.cuda.Stream(device=device, priority=-1)

        # 每个 buffer 对应一个 event，enable_timing=False 减少开销
        self._events: List[torch.cuda.Event] = [
            torch.cuda.Event(enable_timing=False)
            for _ in range(n_buffers)
        ]

        # ping-pong GPU 缓冲区（延迟按形状分配）
        self._buffers: List[Optional[torch.Tensor]] = [None] * n_buffers

        # 状态变量
        self._iter:       Optional[object]      = None
        self._cpu_next:   Optional[torch.Tensor] = None
        self._exhausted:  bool                   = False
        self._write_idx:  int                    = 0   # 下一个 H2D 写入哪个 buf
        self._read_queue: List[int]              = []  # 已发起 H2D 的 buf 索引队列

    def __len__(self) -> int:
        return len(self.loader)

    def _ensure_buffer(self, idx: int, shape: torch.Size):
        """按需分配或复用 GPU buffer（形状变化时重新分配）。"""
        if (self._buffers[idx] is None
                or self._buffers[idx].shape != shape):
            self._buffers[idx] = torch.empty(
                shape, device=self.device, dtype=self.dtype)

    def _fetch_cpu(self) -> Optional[torch.Tensor]:
        """从 DataLoader 取下一个 CPU batch。阻塞 CPU，不阻塞 GPU。"""
        try:
            return next(self._iter)
        except StopIteration:
            return None

    def _launch_h2d(self):
        """
        在 stream_h2d 上发起异步 H2D 传输，并在同一 stream 上 record event。

        ✅ 关键：event.record() 必须在 with stream_h2d 块内，
           确保 event 捕获的是 H2D 完成的时间点，而非默认 stream 的状态。
        """
        if self._cpu_next is None:
            return

        batch_cpu = self._cpu_next
        buf_idx   = self._write_idx % self.n_buffers

        # 确保目标 buffer 形状匹配
        target_shape = torch.Size(
            [batch_cpu.shape[0]] + list(batch_cpu.shape[1:])
        )
        self._ensure_buffer(buf_idx, target_shape)

        with torch.cuda.stream(self.stream_h2d):
            # copy_ + non_blocking=True：DMA 异步传输，CPU 立即返回
            self._buffers[buf_idx].copy_(
                batch_cpu.to(dtype=self.dtype), non_blocking=True
            )
            # ✅ record 在 with 块内：捕获 H2D 完成事件
            self._events[buf_idx].record(self.stream_h2d)

        # 将此 buffer 加入消费队列
        self._read_queue.append(buf_idx)
        self._write_idx += 1

    def __iter__(self):
        self._iter       = iter(self.loader)
        self._exhausted  = False
        self._write_idx  = 0
        self._read_queue.clear()

        # ✅ 立即预取第一个 CPU batch 并启动 H2D
        # 这样第一次调用 __next__ 时，H2D 已经在进行中
        self._cpu_next = self._fetch_cpu()
        if self._cpu_next is None:
            self._exhausted = True
        else:
            self._launch_h2d()
            # 同时预取第二个 CPU batch（为下一次 H2D 做准备）
            self._cpu_next = self._fetch_cpu()
            if self._cpu_next is None:
                self._exhausted = True

        return self

    def __next__(self) -> torch.Tensor:
        # 队列空且无更多数据 → 迭代结束
        if not self._read_queue:
            raise StopIteration

        consume_idx = self._read_queue.pop(0)

        # ✅ compute stream 等待对应 H2D event
        # 语义：GPU 推理 kernel 在 H2D 完成后才执行
        # 注意：这只阻塞 GPU compute stream，CPU 线程立即继续
        torch.cuda.current_stream(self.device).wait_event(
            self._events[consume_idx]
        )

        result = self._buffers[consume_idx]

        # ✅ 立即启动下一个 H2D（与当前 batch 的 GPU 推理并行）
        if not self._exhausted:
            self._launch_h2d()
            self._cpu_next = self._fetch_cpu()
            if self._cpu_next is None:
                self._exhausted = True

        return result


# ============================================================
# 🔬  Profiling 模块
# ============================================================
class PerformanceProfiler:
    """
    多层次性能分析器。
    使用 CUDA Event 计时（比 perf_counter 更精确，直接在 GPU 时间轴上）。
    """

    def __init__(self, device: torch.device, enable: bool = True):
        self.device  = device
        self.enable  = enable
        self.records: Dict[str, List[float]] = {}

        # CUDA Event 对计时
        self._start_events: Dict[str, torch.cuda.Event] = {}

    def tick(self, name: str):
        """开始计时（在 current stream 上插入 start event）。"""
        if not self.enable:
            return
        if self.device.type == "cuda":
            e = torch.cuda.Event(enable_timing=True)
            e.record()
            self._start_events[name] = e
        else:
            self._start_events[name] = time.perf_counter()

    def tock(self, name: str):
        """
        结束计时（插入 end event，elapsed 通过 event.elapsed_time 获取）。
        注意：elapsed_time 会隐式同步，仅在 profiling 场景下调用。
        """
        if not self.enable:
            return
        if self.device.type == "cuda":
            end_e = torch.cuda.Event(enable_timing=True)
            end_e.record()
            torch.cuda.synchronize(self.device)
            start_e = self._start_events.get(name)
            if start_e is not None:
                ms = start_e.elapsed_time(end_e)
                self.records.setdefault(name, []).append(ms)
        else:
            start = self._start_events.get(name, time.perf_counter())
            ms = (time.perf_counter() - start) * 1000
            self.records.setdefault(name, []).append(ms)

    def record(self, name: str, value_ms: float):
        """直接记录一个值（ms）。"""
        if not self.enable:
            return
        self.records.setdefault(name, []).append(value_ms)

    def summary(self) -> str:
        if not self.enable or not self.records:
            return ""
        lines = [
            "",
            "╔══════════════════════════════════════════════════════════════╗",
            "║                📊  Profiling 报告 (ms)                      ║",
            "╠══════════════════════════════════════════════════════════════╣",
            f"  {'阶段':<30} {'均值':>8} {'最小':>8} {'最大':>8} {'次数':>6}",
            f"  {'─'*62}",
        ]
        for name, vals in self.records.items():
            if not vals:
                continue
            avg = sum(vals) / len(vals)
            mn  = min(vals)
            mx  = max(vals)
            lines.append(
                f"  {name:<30} {avg:>8.2f} {mn:>8.2f} {mx:>8.2f} "
                f"{len(vals):>6}"
            )
        lines.append(
            "╚══════════════════════════════════════════════════════════════╝"
        )
        return "\n".join(lines)


def run_torch_profiler(model_fn,
                       loader: DataLoader,
                       device: torch.device,
                       n_batches: int = 5,
                       save_path: str = "/tmp/trace.json") -> None:
    """
    运行 torch.profiler，导出 Chrome trace。
    用 chrome://tracing 或 https://ui.perfetto.dev 打开。
    """
    print(f"\n🔬 torch.profiler 分析（前 {n_batches} 个 batch）...")
    with torch.profiler.profile(
        activities=[
            torch.profiler.ProfilerActivity.CPU,
            torch.profiler.ProfilerActivity.CUDA,
        ],
        with_stack=True,
        record_shapes=True,
        profile_memory=True,
        with_flops=True,
    ) as prof:
        with torch.inference_mode():
            for i, batch in enumerate(loader):
                if i >= n_batches:
                    break
                with torch.profiler.record_function(f"batch_{i}"):
                    imgs = batch.to(device, non_blocking=True)
                    if imgs.dim() == 3:
                        imgs = imgs.unsqueeze(0)
                    with torch.autocast(device_type=device.type,
                                        dtype=torch.bfloat16,
                                        enabled=(device.type == "cuda")):
                        feat = model_fn(imgs)
                    feat.detach().clone()

    prof.export_chrome_trace(save_path)
    print(f"  ✅ Chrome trace → {save_path}")
    print(f"     打开方式: chrome://tracing 或 https://ui.perfetto.dev\n")
    print("  📋 Top-15 CUDA kernel（按 cuda_time_total 排序）：")
    print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=15))
    print("  📋 Top-15 CPU 操作（按 cpu_time_total 排序）：")
    print(prof.key_averages().table(sort_by="cpu_time_total",  row_limit=15))


# ============================================================
# 🚀  模型初始化
# ============================================================
def init_matcher(
    checkpoint_path: str,
    num_classes: int = 9,
    device: str = "cuda",
    input_size: int = 256,
    backbone_path: Optional[str] = None,
    discrete_input: bool = False,
    metric_out_dim: int = 256,
    cfg: Optional[InferenceConfig] = None,
) -> dict:
    cfg    = cfg or InferenceConfig()
    device = torch.device(device)
    _apply_hw_opts(cfg)

    if backbone_path is None:
        backbone_path = (
            "/ossfs/workspace/representation_learning/dinov3/vision/ckpt/"
            "dinov3-vitb16-pretrain-lvd1689m"
        )

    from transformers import AutoModel
    attn     = "sdpa" if cfg.use_flash_attention else "eager"
    backbone = AutoModel.from_pretrained(backbone_path,
                                         attn_implementation=attn)

    model = DINOv3Matcher(
        backbone=backbone,
        num_classes=num_classes,
        feature_dim=768,
        pooling="gap+cls",
        metric_out=metric_out_dim,
    ).to(device).eval()

    ckpt = torch.load(checkpoint_path, map_location="cpu", weights_only=False)
    sd   = (ckpt.get("state_dict_ema")
            or ckpt.get("model")
            or ckpt.get("state_dict"))
    if sd is None:
        raise RuntimeError(
            "Checkpoint 中未找到有效权重键"
            "（尝试: state_dict_ema / model / state_dict）")
    sd = {k.replace("module.", "").replace("_orig_mod.", ""): v
          for k, v in sd.items()}
    model.load_state_dict(sd, strict=True)
    model = _apply_model_opts(model, cfg, device)

    return {
        "model":      model,
        "device":     device,
        "cfg":        cfg,
        "input_size": input_size,
        "discrete":   discrete_input,
        "metric_dim": metric_out_dim,
        "tfm":        _build_transform(input_size, discrete_input),
        "tfm_nr":     _build_transform(input_size, discrete_input,
                                       no_resize=True),
        "_cg_engine": None,
        "_g_cache":   None,
        "_g_hash":    None,
    }


# ============================================================
# 🎯  相似度计算（三路径统一入口）
# ============================================================
def _fast_hash(arr: np.ndarray) -> str:
    n    = arr.shape[0]
    step = max(1, n // 200)
    s    = arr[::step].ravel()
    key  = (f"{arr.shape}{arr.dtype}"
            f"{int(arr[0,0,0])}{int(arr[-1,-1,-1])}"
            f"{int(s.sum())}{int(np.count_nonzero(s))}"
            f"{float(arr.mean()):.4f}")
    return hashlib.md5(key.encode()).hexdigest()[:16]


def _to_ndarray(x: Union[torch.Tensor, np.ndarray, list, Image.Image],
                name: str) -> np.ndarray:
    if isinstance(x, Image.Image):
        arr = np.array(x)
        return arr[np.newaxis] if arr.ndim == 2 else arr
    if isinstance(x, torch.Tensor):
        arr = x.cpu().numpy()
    elif isinstance(x, list):
        arr = np.stack(
            [np.array(i) if isinstance(i, Image.Image) else i for i in x],
            axis=0)
    elif isinstance(x, np.ndarray):
        arr = x.copy()
    else:
        raise TypeError(f"{name} 不支持类型: {type(x)}")
    if arr.ndim == 2:
        arr = arr[np.newaxis]
    if arr.ndim != 3:
        raise ValueError(f"{name} 需要 2D/3D，当前: {arr.shape}")
    return arr


def compute_similarity(
    matcher:     dict,
    gallery:     Union[torch.Tensor, np.ndarray, list, Image.Image],
    query:       Union[torch.Tensor, np.ndarray, list, Image.Image],
    batch_size:  int  = 64,
    metric:      str  = "cosine",
    return_topk: bool = False,
    k:           int  = 10,
    gallery_pre: Optional[np.ndarray] = None,
    query_pre:   Optional[np.ndarray] = None,
    profiler:    Optional[PerformanceProfiler] = None,
) -> dict:
    """
    三路径统一推理入口。

    路径选择（优先级从高到低）：
      1. use_gpu_preprocessor=True  → GPUPreprocessor
         适合：gallery 能全量放入 GPU 显存
      2. use_stream_prefetch=True   → StreamPrefetchLoader
         适合：数据量大，无法全量上传，但需要高吞吐
      3. fallback                   → 原始 DataLoader
         适合：调试、CPU 环境

    gallery_pre / query_pre : 已预存为目标尺寸的数组，跳过 A.Resize
    gallery / query         : 原始数组，用于 circle_fix / hash / 可视化
    """
    model    = matcher["model"]
    device   = matcher["device"]
    cfg: InferenceConfig = matcher["cfg"]
    discrete = matcher["discrete"]

    # ── 原始数组处理（circle_fix + hash + 可视化）──────────────
    t0 = time.perf_counter()
    g_arr = wafer_circle_fix(_to_ndarray(gallery, "gallery"))
    q_arr = wafer_circle_fix(_to_ndarray(query,   "query"))
    if profiler:
        profiler.record("circle_fix",
                        (time.perf_counter() - t0) * 1000)

    # 推理用数组（优先使用预存的目标尺寸版本）
    g_infer = gallery_pre if gallery_pre is not None else g_arr
    q_infer = query_pre   if query_pre   is not None else q_arr

    use_bf16 = (cfg.use_bfloat16 and device.type == "cuda"
                and torch.cuda.is_bf16_supported())
    ac_dtype = torch.bfloat16 if use_bf16 else torch.float32

    # 路径选择
    use_gpu_proc  = (cfg.use_gpu_preprocessor and device.type == "cuda")
    use_stream_pf = (cfg.use_stream_prefetch   and device.type == "cuda"
                     and not use_gpu_proc)

    # ── DataLoader 构建（Stream Prefetch / Baseline 共用）──────
    def _make_loader(arr: np.ndarray, no_resize: bool) -> DataLoader:
        tfm = matcher["tfm_nr"] if no_resize else matcher["tfm"]
        ds  = WaferDataset(arr, tfm, discrete)
        nw  = 0 if len(ds) <= batch_size else cfg.dataloader_num_workers
        pf  = cfg.dataloader_prefetch_factor if nw > 0 else None
        return DataLoader(
            ds, batch_size=batch_size,
            num_workers=nw,
            pin_memory=(device.type == "cuda"),
            prefetch_factor=pf,
            persistent_workers=False,
            shuffle=False, drop_last=False,
        )

    # ── CUDA Graph 引擎（compile=False 时）─────────────────────
    use_cg = cfg.effective_cuda_graph and device.type == "cuda"
    if use_cg and matcher["_cg_engine"] is None:
        matcher["_cg_engine"] = CUDAGraphEngine(
            model, batch_size, matcher["input_size"],
            device, use_bf16, warmup=3,
        )
    cg = matcher["_cg_engine"] if use_cg else None

    # ── 路径1：GPU 预处理 ────────────────────────────────────────
    @torch.inference_mode()
    def _extract_gpu_proc(arr: np.ndarray, label: str) -> torch.Tensor:
        """
        数据已全量在 GPU 上，推理时直接切片，零 H2D 传输。
        """
        t_upload = time.perf_counter()
        gpu_proc = GPUPreprocessor(
            arr, device, batch_size=batch_size, use_bf16=use_bf16
        )
        if profiler:
            profiler.record(f"{label}/GPU上传",
                            (time.perf_counter() - t_upload) * 1000)

        use_compile = cfg.use_torch_compile and device.type == "cuda"
        res = []
        for batch_gpu in gpu_proc:
            if profiler:
                profiler.tick(f"{label}/推理/batch")

            if use_compile:
                torch.compiler.cudagraph_mark_step_begin()
            with torch.autocast(device_type="cuda",
                                 dtype=ac_dtype, enabled=True):
                feat = model.get_embedding(batch_gpu)
            res.append(feat.detach().clone())

            if profiler:
                profiler.tock(f"{label}/推理/batch")

        # 同步后 cat，确保所有推理完成
        torch.cuda.synchronize(device)
        out = torch.cat(res, dim=0).float()
        assert out.shape[0] == len(gpu_proc), \
            f"[{label}] 特征数量不匹配: 预期 {len(gpu_proc)}，实际 {out.shape[0]}"
        return out

    # ── 路径2：Stream Prefetch ───────────────────────────────────
    @torch.inference_mode()
    def _extract_stream(arr: np.ndarray, no_resize: bool,
                        label: str) -> torch.Tensor:
        """
        双 Stream 流水线：H2D 与 GPU 推理并行。
        stream_h2d 传输 batch[i+1] 时，compute stream 推理 batch[i]。
        """
        loader    = _make_loader(arr, no_resize)
        pf_loader = StreamPrefetchLoader(
            loader, device, dtype=ac_dtype, n_buffers=2
        )
        use_compile = cfg.use_torch_compile and device.type == "cuda"
        res = []

        for batch_gpu in pf_loader:
            # batch_gpu 已在 GPU 上，compute stream 已 wait H2D event
            if batch_gpu.dim() == 3:
                batch_gpu = batch_gpu.unsqueeze(0)

            if profiler:
                profiler.tick(f"{label}/推理/batch")

            if use_compile:
                torch.compiler.cudagraph_mark_step_begin()
            with torch.autocast(device_type="cuda",
                                 dtype=ac_dtype, enabled=True):
                feat = model.get_embedding(batch_gpu)
            res.append(feat.detach().clone())

            if profiler:
                profiler.tock(f"{label}/推理/batch")

        # 同步后 cat
        torch.cuda.synchronize(device)
        out = torch.cat(res, dim=0).float()
        assert out.shape[0] == arr.shape[0], \
            f"[{label}] 特征数量不匹配: 预期 {arr.shape[0]}，实际 {out.shape[0]}"
        return out

    # ── 路径3：Baseline DataLoader ───────────────────────────────
    @torch.inference_mode()
    def _extract_baseline(arr: np.ndarray, no_resize: bool,
                          label: str) -> torch.Tensor:
        """原始串行路径，用于对比和 CPU 环境 fallback。"""
        loader      = _make_loader(arr, no_resize)
        use_compile = cfg.use_torch_compile and device.type == "cuda"
        res = []

        for batch in loader:
            if profiler:
                profiler.tick(f"{label}/H2D")
            imgs = batch.to(device, non_blocking=True)
            if imgs.dim() == 3:
                imgs = imgs.unsqueeze(0)
            if profiler:
                if device.type == "cuda":
                    torch.cuda.synchronize(device)
                profiler.tock(f"{label}/H2D")
                profiler.tick(f"{label}/推理/batch")

            if cg is not None:
                res.append(cg.run(imgs))
            else:
                if use_compile:
                    torch.compiler.cudagraph_mark_step_begin()
                with torch.autocast(device_type=device.type,
                                    dtype=ac_dtype,
                                    enabled=(device.type == "cuda")):
                    feat = model.get_embedding(imgs)
                res.append(feat.detach().clone())

            if profiler:
                if device.type == "cuda":
                    torch.cuda.synchronize(device)
                profiler.tock(f"{label}/推理/batch")

        if device.type == "cuda":
            torch.cuda.synchronize(device)
        out = torch.cat(res, dim=0).float()
        assert out.shape[0] == arr.shape[0], \
            f"[{label}] 特征数量不匹配: 预期 {arr.shape[0]}，实际 {out.shape[0]}"
        return out

    # ── 路由函数 ─────────────────────────────────────────────────
    def _extract(arr_infer: np.ndarray, no_resize: bool,
                 label: str) -> torch.Tensor:
        if use_gpu_proc:
            return _extract_gpu_proc(arr_infer, label)
        if use_stream_pf:
            return _extract_stream(arr_infer, no_resize, label)
        return _extract_baseline(arr_infer, no_resize, label)

    # ── Query 特征提取 ───────────────────────────────────────────
    if profiler:
        profiler.tick("Query/总耗时")
    q_feats = _extract(q_infer, query_pre is not None, "Query")
    if profiler:
        profiler.tock("Query/总耗时")

    # ── Gallery 特征提取（含缓存）────────────────────────────────
    g_hash = _fast_hash(g_arr)
    if (cfg.use_gallery_cache
            and matcher["_g_cache"] is not None
            and matcher["_g_hash"] == g_hash):
        g_feats = matcher["_g_cache"]
        if profiler:
            profiler.record("Gallery/缓存命中", 0.0)
    else:
        if profiler:
            profiler.tick("Gallery/总耗时")
        g_feats = _extract(g_infer, gallery_pre is not None, "Gallery")
        if profiler:
            profiler.tock("Gallery/总耗时")
        matcher["_g_cache"] = g_feats
        matcher["_g_hash"]  = g_hash

    # ── 相似度矩阵 ───────────────────────────────────────────────
    if profiler:
        profiler.tick("相似度矩阵")
    if metric == "cosine":
        sim = torch.mm(q_feats, g_feats.T)
    elif metric == "euclidean":
        sim = -torch.cdist(q_feats, g_feats, p=2)
    else:
        raise ValueError(f"不支持的 metric: {metric}")
    if profiler:
        if device.type == "cuda":
            torch.cuda.synchronize(device)
        profiler.tock("相似度矩阵")

    result = {
        "similarities":  sim.cpu().numpy(),
        "n_gallery":     g_arr.shape[0],
        "n_query":       q_arr.shape[0],
        "feature_dim":   matcher["metric_dim"],
        "gallery_array": g_arr,
        "query_array":   q_arr,
    }

    if return_topk:
        best_s, best_i = torch.max(sim, dim=1)
        result["best_match_indices"] = best_i.cpu().numpy()
        result["best_match_scores"]  = best_s.cpu().numpy()
        _k = min(k, sim.shape[1])
        top_s, top_i = torch.topk(sim, _k, dim=1, largest=True, sorted=True)
        result["top_indices"] = top_i.cpu().numpy()
        result["top_scores"]  = top_s.cpu().numpy()

    return result


# ============================================================
# 📊  可视化
# ============================================================
def visualize_topk(result: dict, query_idx: int = 0,
                   save_path: str = "top10_matches.png",
                   title: str = "Top-K Similarity Matches") -> None:
    if "top_indices" not in result:
        raise ValueError("需要 return_topk=True 才能可视化")

    q_img   = result["query_array"][query_idx]
    g_imgs  = result["gallery_array"]
    indices = result["top_indices"][query_idx]
    scores  = result["top_scores"][query_idx]
    k       = len(indices)

    cmap = plt.cm.colors.ListedColormap(
        ['#F0F0F0', '#808080', '#FF4444', '#FFDD00'])
    norm = plt.cm.colors.BoundaryNorm([-0.5, 0.5, 1.5, 2.5, 3.5], cmap.N)

    fig = plt.figure(figsize=(24, 4), dpi=150)
    gs  = gridspec.GridSpec(1, k + 1, width_ratios=[1] * (k + 1),
                            wspace=0.1, hspace=0.1)
    fig.suptitle(f"{title} — Query {query_idx}",
                 fontsize=16, fontweight='bold', y=0.98)

    def _draw_defect_rect(ax, img):
        m = (img == 2) | (img == 3)
        if m.any():
            y, x = np.where(m)
            ax.add_patch(patches.Rectangle(
                (x.min() - .5, y.min() - .5),
                x.max() - x.min() + 1, y.max() - y.min() + 1,
                lw=1.5, edgecolor='red', facecolor='none', zorder=5))

    ax0 = plt.subplot(gs[0])
    im0 = ax0.imshow(q_img, cmap=cmap, norm=norm, aspect='equal')
    ax0.set_title("Query", fontsize=12, pad=6, fontweight='bold')
    ax0.axis('off')
    _draw_defect_rect(ax0, q_img)

    for i, (idx, sc) in enumerate(zip(indices, scores)):
        ax = plt.subplot(gs[i + 1])
        ax.imshow(g_imgs[idx], cmap=cmap, norm=norm, aspect='equal')
        ax.set_title(f"Top{i+1}\n#{idx}\n{sc:.4f}", fontsize=9, pad=4)
        ax.axis('off')
        _draw_defect_rect(ax, g_imgs[idx])

    cb = fig.add_axes([0.92, 0.2, 0.01, 0.6])
    c  = fig.colorbar(im0, cax=cb, ticks=[0, 1, 2, 3])
    c.ax.set_yticklabels(['BG', 'Normal', 'Defect', 'Severe'], fontsize=9)
    c.ax.set_ylabel('Pixel Value', fontsize=10, rotation=270, labelpad=14)

    plt.tight_layout(rect=[0, 0, 0.9, 0.95])
    plt.savefig(save_path, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    print(f"✅ 已保存: {save_path}")


# ============================================================
# 🏁  主程序
# ============================================================
def load_pkl(path: str):
    try:
        return pd.read_pickle(path)
    except Exception as e:
        print(f"读取失败: {e}")
        return None


if __name__ == "__main__":
    from skimage.transform import resize as sk_resize

    # ── 参数 ──────────────────────────────────────────────────────
    CKPT         = "/ossfs/workspace/representation_learning/dinov3/vision/ckpt/0317.pth"
    PKL          = "/ossfs/workspace/representation_learning/dinov3/vision/datasets/LSWMD.pkl"
    BACKBONE     = ("/ossfs/workspace/representation_learning/dinov3/vision/ckpt/"
                    "dinov3-vitb16-pretrain-lvd1689m")
    CACHE_PATH   = "/tmp/wafer_pre256.npy"
    INPUT_SIZE   = 256
    BATCH_SIZE   = 64
    GALLERY_SIZE = 10000
    QUERY_IDX    = 6
    N_REPEAT     = 3
    DEVICE       = "cuda" if torch.cuda.is_available() else "cpu"

    # ── Step 1: 初始化 ────────────────────────────────────────────
    cfg = InferenceConfig(
        use_fp8_quantization=True,
        fp8_mode="weight_only",
        use_flash_attention=True,
        use_bfloat16=True,
        use_torch_compile=True,
        compile_mode="max-autotune",
        use_cuda_graph=True,
        use_tf32=True,
        use_cudnn_benchmark=True,
        use_gallery_cache=True,
        dataloader_num_workers=4,
        dataloader_prefetch_factor=2,
        use_gpu_preprocessor=True,
        use_stream_prefetch=True,
        enable_profiling=True,
        profile_batches=5,
    )
    matcher = init_matcher(
        CKPT, num_classes=8, device=DEVICE,
        input_size=INPUT_SIZE, backbone_path=BACKBONE,
        discrete_input=True, metric_out_dim=256, cfg=cfg,
    )

    # ── Step 2: 加载数据 ──────────────────────────────────────────
    data = load_pkl(PKL)
    assert data is not None, "PKL 文件加载失败，请检查路径"

    imgs = []
    for _, row in data.iterrows():
        ft = row["failureType"]
        try:
            is_empty = (len(ft) == 0)
        except TypeError:
            is_empty = (ft is None)
        if is_empty:
            continue
        try:
            label = ft[0][0] if hasattr(ft[0], '__len__') else str(ft[0])
        except (IndexError, TypeError):
            continue
        if str(label).lower() in ("unknown", "none", ""):
            continue
        imgs.append(preprocess_wafer_map(row["waferMap"], (64, 64)))
        if len(imgs) >= GALLERY_SIZE:
            break

    assert len(imgs) > 0, "未加载到任何有效样本，请检查数据集格式"
    print(f"✅ 加载 {len(imgs)} 张图像")

    gallery_imgs = np.array(imgs)           # (N, 64, 64)
    query_img    = gallery_imgs[QUERY_IDX]  # (64, 64)
    total        = len(gallery_imgs) + 1

    # ── Step 3: 预存 256×256 缓存 ────────────────────────────────
    def _pre256(arr2d: np.ndarray) -> np.ndarray:
        return np.clip(
            sk_resize(arr2d.astype(np.float32),
                      (INPUT_SIZE, INPUT_SIZE),
                      mode='edge', order=0, preserve_range=True),
            0, 3
        ).astype(np.uint8)

    if os.path.exists(CACHE_PATH):
        g_pre = np.load(CACHE_PATH)
        print(f"✅ 预存缓存命中: {CACHE_PATH}  shape={g_pre.shape}")
    else:
        print("🔄 首次预计算 256×256 缓存...")
        g_pre = np.stack([_pre256(im) for im in gallery_imgs])
        np.save(CACHE_PATH, g_pre)
        print(f"✅ 缓存已保存: {CACHE_PATH}")

    q_pre = _pre256(query_img)[np.newaxis]  # (1, 256, 256)

    # ── Step 4: 精度等价验证 ──────────────────────────────────────
    if cfg.use_gpu_preprocessor and DEVICE == "cuda":
        print("\n🔍 验证 GPU 预处理与 CPU 路径精度等价性...")
        # ✅ 正确参数名：discrete（不是 discrete_input）
        tfm_cpu = _build_transform(INPUT_SIZE, discrete=True, no_resize=True)
        GPUPreprocessor.verify_equivalence(
            g_pre[:20], tfm_cpu, torch.device(DEVICE),
            n_check=20, tol=1e-2,
        )

    # ── Step 5: torch.profiler 详细分析（可选）───────────────────
    if cfg.enable_profiling and DEVICE == "cuda":
        print("\n🔬 运行 torch.profiler 详细 kernel 分析...")
        _tfm_nr   = _build_transform(INPUT_SIZE, discrete=True, no_resize=True)
        _ds_prof  = WaferDataset(
            g_pre[: BATCH_SIZE * cfg.profile_batches],
            _tfm_nr, discrete=True,
        )
        _ldr_prof = DataLoader(
            _ds_prof, batch_size=BATCH_SIZE,
            num_workers=0, pin_memory=True,
            shuffle=False, drop_last=False,
        )
        run_torch_profiler(
            model_fn  = matcher["model"].get_embedding,
            loader    = _ldr_prof,
            device    = torch.device(DEVICE),
            n_batches = cfg.profile_batches,
            save_path = "/tmp/wafer_trace.json",
        )

    # ── Step 6: Warmup（触发 torch.compile，不计入计时）──────────
    print("\n🔥 Warmup（触发 torch.compile）...")
    _wg = np.random.randint(
        0, 4, (BATCH_SIZE * 4, INPUT_SIZE, INPUT_SIZE), dtype=np.uint8)
    _wq = np.random.randint(
        0, 4, (INPUT_SIZE, INPUT_SIZE), dtype=np.uint8)
    compute_similarity(
        matcher, _wg, _wq,
        batch_size=BATCH_SIZE,
        gallery_pre=_wg,
        query_pre=_wq[np.newaxis],
    )
    matcher["_g_cache"] = None
    matcher["_g_hash"]  = None
    if DEVICE == "cuda":
        torch.cuda.synchronize()
    print("✅ Warmup 完成\n")

    # ── Step 7: 三路径对比计时 ────────────────────────────────────
    # 依次测试：GPU预处理 / StreamPrefetch / Baseline
    PATH_CONFIGS = [
        ("GPU预处理",       True,  False),
        ("StreamPrefetch", False, True),
        ("Baseline",       False, False),
    ]
    path_results: Dict[str, dict] = {}

    for path_name, use_gpu, use_stream in PATH_CONFIGS:
        print(f"{'─'*60}")
        print(f"  🧪  路径: {path_name}")
        print(f"{'─'*60}")

        cfg.use_gpu_preprocessor = use_gpu
        cfg.use_stream_prefetch  = use_stream

        # 每条路径独立 profiler
        profiler = PerformanceProfiler(
            device=torch.device(DEVICE),
            enable=cfg.enable_profiling,
        )

        times_a: List[float] = []   # 场景A：无缓存（gallery+query 全量提取）
        times_b: List[float] = []   # 场景B：缓存命中（仅 query 提取）

        # ── 场景 A ────────────────────────────────────────────────
        for i in range(N_REPEAT):
            matcher["_g_cache"] = None
            matcher["_g_hash"]  = None
            if DEVICE == "cuda":
                torch.cuda.synchronize()

            t0 = time.perf_counter()
            compute_similarity(
                matcher, gallery_imgs, query_img,
                batch_size=BATCH_SIZE, return_topk=True,
                gallery_pre=g_pre, query_pre=q_pre,
                # 只在第一轮记录 profiling，避免 tock 计时累积失真
                profiler=profiler if i == 0 else None,
            )
            if DEVICE == "cuda":
                torch.cuda.synchronize()

            elapsed = time.perf_counter() - t0
            times_a.append(elapsed)
            print(f"  场景A  Run {i+1}/{N_REPEAT}: "
                  f"{elapsed:.4f}s  ({total/elapsed:.1f} img/s)")

        # ── 场景 B 预热缓存 ───────────────────────────────────────
        compute_similarity(
            matcher, gallery_imgs, query_img,
            batch_size=BATCH_SIZE,
            gallery_pre=g_pre, query_pre=q_pre,
        )
        if DEVICE == "cuda":
            torch.cuda.synchronize()

        # ── 场景 B ────────────────────────────────────────────────
        for i in range(N_REPEAT):
            if DEVICE == "cuda":
                torch.cuda.synchronize()

            t0 = time.perf_counter()
            compute_similarity(
                matcher, gallery_imgs, query_img,
                batch_size=BATCH_SIZE, return_topk=True,
                gallery_pre=g_pre, query_pre=q_pre,
            )
            if DEVICE == "cuda":
                torch.cuda.synchronize()

            elapsed = time.perf_counter() - t0
            times_b.append(elapsed)
            print(f"  场景B  Run {i+1}/{N_REPEAT}: "
                  f"{elapsed:.4f}s  ({total/elapsed:.1f} img/s)"
                  f"  [缓存命中]")

        avg_a = sum(times_a) / N_REPEAT
        avg_b = sum(times_b) / N_REPEAT
        path_results[path_name] = {
            "avg_a":  avg_a,
            "avg_b":  avg_b,
            "tps_a":  total / avg_a,
            "tps_b":  total / avg_b,
            "best_a": min(times_a),
            "best_b": min(times_b),
        }

        # 打印该路径的 profiling 摘要
        if cfg.enable_profiling:
            print(profiler.summary())

    # ── Step 8: 综合性能对比报告 ──────────────────────────────────
    baseline = path_results.get("Baseline", {})
    base_tps = baseline.get("tps_a", 1.0)

    print(f"\n{'═'*76}")
    print(f"  {'📊  综合性能对比报告':^72}")
    print(f"{'═'*76}")
    print(f"  {'路径':<18} {'场景A均值':>10} {'场景A吞吐':>12} "
          f"{'加速比':>8} {'场景B均值':>10} {'场景B吞吐':>12}")
    print(f"  {'─'*74}")
    for name, r in path_results.items():
        speedup = r["tps_a"] / base_tps if base_tps > 0 else 1.0
        print(
            f"  {name:<18}"
            f"  {r['avg_a']:>8.4f}s"
            f"  {r['tps_a']:>10.1f}/s"
            f"  ×{speedup:>5.2f}"
            f"  {r['avg_b']:>8.4f}s"
            f"  {r['tps_b']:>10.1f}/s"
        )
    print(f"{'═'*76}")

    # ── Step 9: GPU 内存报告 ──────────────────────────────────────
    if DEVICE == "cuda":
        alloc  = torch.cuda.memory_allocated()    / 1024**3
        reserv = torch.cuda.memory_reserved()     / 1024**3
        peak   = torch.cuda.max_memory_allocated() / 1024**3
        print(f"\n💾  GPU 内存使用：")
        print(f"    当前已分配: {alloc:.3f} GB")
        print(f"    当前已保留: {reserv:.3f} GB")
        print(f"    峰值已分配: {peak:.3f} GB")

    # ── Step 10: 最优路径可视化 ───────────────────────────────────
    best_name = max(path_results, key=lambda k: path_results[k]["tps_a"])
    best_tps  = path_results[best_name]["tps_a"]
    print(f"\n🏆  最优路径: {best_name}  吞吐量: {best_tps:.1f} img/s")

    # 切换到最优路径
    cfg.use_gpu_preprocessor = (best_name == "GPU预处理")
    cfg.use_stream_prefetch  = (best_name == "StreamPrefetch")
    matcher["_g_cache"]      = None
    matcher["_g_hash"]       = None

    final = compute_similarity(
        matcher, gallery_imgs, query_img,
        batch_size=BATCH_SIZE, return_topk=True, k=10,
        gallery_pre=g_pre, query_pre=q_pre,
    )
    visualize_topk(
        final, query_idx=0,
        save_path="top10_matches.png",
        title=(
            f"Cosine Top-10  |  {best_name}  |  "
            f"dim={matcher['metric_dim']}  FP8=weight_only"
        ),
    )
    print(
        f"🏆  最佳匹配: gallery[{final['best_match_indices'][0]}]  "
        f"score={final['best_match_scores'][0]:.4f}"
    )
