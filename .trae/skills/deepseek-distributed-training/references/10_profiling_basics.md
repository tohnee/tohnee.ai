# 10 Profiling 基础

适用信号：`profiling`、`trace`、`step time`、`热点分析`、`kernel 慢`

## 目标

先把“感觉慢”变成可量化的 step time 拆分，再决定是数据、CPU launch、CUDA kernel、通信还是同步等待。

## Profiling 原则

- 先做短跑，不直接 profile 全量训练
- 先 profile 稳定的 BF16 基线
- 只采 5 到 20 个稳定 step
- 先采单节点，再扩到多节点
- 先拿 trace，再讨论调参

## 先准备输出目录

```bash
export SWIFT_HOME=/nas_train/tc/ms-swift
export SWIFT_ENV=/nas_train/tc/ms-swift/.py310_ds
export OUTPUT_ROOT=/nas_train/tc/output
export RUN_NAME=profile_baseline_$(date +%Y%m%d_%H%M%S)
export PROFILE_DIR="${OUTPUT_ROOT}/${RUN_NAME}"
mkdir -p "${PROFILE_DIR}"
source "${SWIFT_ENV}/bin/activate"
cd "${SWIFT_HOME}"
```

## 先拿轻量级时间分解

```bash
export LOG_FILE=/nas_train/tc/output/<run>.log
grep -nE 'step_time|tokens/s|samples/s|throughput|dataloader|load' "${LOG_FILE}" | tail -n 100
```

这一步只是为了判断是否值得进入 profiler，不足以做根因归因。

## torch.profiler 最小模板

PyTorch profiler 支持 schedule 和 trace handler，trace 可直接送到 TensorBoard。[1][2]

```bash
python3 - <<'PY'
import os
import torch
from torch.profiler import profile, schedule, ProfilerActivity, tensorboard_trace_handler

profile_dir = os.environ['PROFILE_DIR']
rank = int(os.environ.get('RANK', '0'))
trace_dir = os.path.join(profile_dir, f'rank{rank}')
os.makedirs(trace_dir, exist_ok=True)

with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    schedule=schedule(wait=2, warmup=2, active=4, repeat=1),
    on_trace_ready=tensorboard_trace_handler(trace_dir, worker_name=f'rank{rank}'),
    record_shapes=True,
    profile_memory=True,
    with_stack=True
) as prof:
    for step in range(8):
        prof.step()

print(trace_dir)
PY
```

## 采集建议

- `wait=2, warmup=2, active=4` 适合作为第一次短跑模板
- `record_shapes` 和 `profile_memory` 先开
- `with_stack` 只在需要追 operator 到代码时开启
- trace 目录按 rank 分开，避免覆盖

## TensorBoard 查看

```bash
tensorboard --logdir "${PROFILE_DIR}" --port 6006
```

PyTorch profiler 的 TensorBoard 视图可看 step time breakdown，且支持 distributed view。[2]

## 首次分析顺序

1. 看 Step Time Breakdown
2. 看 DataLoader 时间占比
3. 看 CPU launch 是否拖慢 GPU
4. 看是否有大量空洞或同步等待
5. 再看最长 kernel 或最长 operator

## 什么时候切换到 Nsight Systems

- 需要看 CPU、GPU、CUDA runtime、NVTX、MPI 一张统一时间线
- 需要看多 rank 时间轴
- 需要看 NIC 或 GPU metrics
- 需要看 host 侧空转、同步、launch 抖动

Nsight Systems 是系统级低开销时间线工具，适合大图景定位。[3][4]

## 交付物清单

- 一份原始训练日志
- 一份 profiler trace 目录
- 记录采样配置：wait、warmup、active、repeat
- 对应 run 的 batch、max_length、并行配置

## 下一步

- 单节点 trace 已拿到：去 `11_multi_node_profiling.md`
- 怀疑通信问题：去 `12_comm_network_profiling.md`

## 参考

- [1] PyTorch Profiler 文档：schedule、trace handler、Chrome/TensorBoard trace
- [2] PyTorch TensorBoard Profiler：支持 distributed view 与 step time breakdown
- [3] Nsight Systems：系统级 CPU/GPU 时间线与多节点分析
- [4] Nsight Systems User Guide：建议聚焦关键区间而非全程采集
