# 11 多节点 Profiling

适用信号：`多节点变慢`、`扩展效率低`、`rank 不均衡`、`只有多节点慢`

## 目标

定位多节点训练慢在计算、通信、数据、straggler 还是并行切分，而不是直接盲调 NCCL 或 batch。

## 方法论

先固定模型、数据、batch、max_length，只改变节点数。

标准对比组：

1. 1 节点 × 8 卡
2. 2 节点 × 16 卡
3. 4 节点 × 32 卡

每组都只跑短窗口，记录：

- tokens/s
- samples/s
- 平均 step time
- p95 step time
- trace 文件
- 关键环境变量

## 扩展效率模板

```bash
export BASELINE_TOKENS_PER_SEC=<1node_tokens_per_sec>
export CURRENT_TOKENS_PER_SEC=<nnode_tokens_per_sec>
export CURRENT_NODES=<n>
python3 - <<'PY'
import os
base = float(os.environ['BASELINE_TOKENS_PER_SEC'])
cur = float(os.environ['CURRENT_TOKENS_PER_SEC'])
nodes = float(os.environ['CURRENT_NODES'])
eff = cur / (base * nodes)
print('scaling_efficiency', round(eff, 4))
PY
```

## 多节点 torch.profiler 采集

PyTorch profiler 生成的 trace 适合后续做 HTA 分析，HTA 面向分布式训练瓶颈归因。[5][6]

```bash
export PROFILE_ROOT=/nas_train/tc/output/profile_multinode_$(date +%Y%m%d_%H%M%S)
mkdir -p "${PROFILE_ROOT}"
export TORCH_PROFILER_DIR="${PROFILE_ROOT}/traces"
```

约定每个 rank 写独立目录：

```bash
export TRACE_DIR="${TORCH_PROFILER_DIR}/node${NODE_RANK}_rank${RANK}"
mkdir -p "${TRACE_DIR}"
```

## 多节点 Nsight Systems 采集

Nsight Systems 支持多节点 profiling，并能看 CPU/GPU/NIC 的统一时间线。[3]

GPU metrics 和 NIC metrics 是系统级采样，同一节点通常只让 local rank 0 采一次，避免冲突。[7]

```bash
cat > /tmp/profile-rank.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
NSYS_BASE="nsys profile --stats=true --sample=none --trace=cuda,nvtx,osrt,cublas,cudnn,mpi --force-overwrite=true --capture-range=cudaProfilerApi"
if [[ "${LOCAL_RANK:-0}" == "0" ]]; then
  EXTRA="--gpu-metrics-device=all --nic-metrics=true"
else
  EXTRA=""
fi
eval ${NSYS_BASE} ${EXTRA} -o /nas_train/tc/output/nsys_${NODE_RANK}_${RANK} "$@"
SH
chmod +x /tmp/profile-rank.sh
```

用启动器调用包装脚本，而不是让每个本地 rank 都采系统级指标。

## 首次归因顺序

1. 1 节点和 2 节点 step time 是否按比例变坏
2. 所有 rank 是否同时变慢
3. 只有少数 rank 慢，还是全局都慢
4. GPU 是否空等通信
5. DataLoader 时间是否随着节点数上升

## 常见多节点模式

### 所有 rank 一起变慢

优先怀疑：

- 通信体积大
- collective 频繁
- 网络链路或 HCA 绑定问题
- ZeRO3 / PP / SP 组合本身引入同步成本

### 只有少数 rank 更慢

优先怀疑：

- straggler 节点
- 该节点数据加载或 CPU 抢占
- 链路异常
- 某 stage 切分不均

### 单节点快，多节点 GPU 利用率掉下去

优先怀疑：

- all-reduce 或 all-gather 等待
- host 侧 launch 抖动
- dataloader 未按节点扩展

## HTA 分析入口

HTA 可对多 rank trace 做 temporal breakdown、idle time、kernel distribution、communication-computation overlap 分析。[5][6]

```bash
python3 -m pip install HolisticTraceAnalysis
```

第一次使用时，优先关注：

- temporal breakdown
- idle time breakdown
- communication-computation overlap
- kernel duration distribution

## 建议回传物

- 1/2/4 节点三组 tokens/s 与 step time
- 每组至少一个 trace 包
- rank 级日志
- `nvidia-smi topo -m`
- `env | grep -E 'NCCL|MASTER|WORLD|RANK'`

## 下一步

- 怀疑 collective 或网络链路：去 `12_comm_network_profiling.md`
- 怀疑 Megatron 并行切分：回读 `08_megatron_playbook.md`

## 参考

- [3] Nsight Systems：支持多节点 profiling
- [5] HTA 项目：面向分布式训练 trace 分析
- [6] PyTorch HTA 教程：分析 distributed training traces
- [7] NVIDIA 论坛建议：系统级 GPU/NIC metrics 只在每节点 local rank 0 采集
