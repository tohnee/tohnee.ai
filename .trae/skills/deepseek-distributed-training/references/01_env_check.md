# 01 环境检查

适用信号：`跑不起来`、`NCCL 报错`、`GPU 看不到`、`卡在 init_process_group`

## 目标

先确认驱动、CUDA、PyTorch、网卡、NCCL 基础环境，再进入模型或框架层排查。

## 会话基线

```bash
export MASTER_ADDR=10.239.2.10
export MODEL_DIR=/nas_train/app.e0016372/models/DeepSeek-V3-BF16
export SWIFT_HOME=/nas_train/tc/ms-swift
export SWIFT_ENV=/nas_train/tc/ms-swift/.py310_ds
export OUTPUT_ROOT=/nas_train/tc/output
source "${SWIFT_ENV}/bin/activate"
cd "${SWIFT_HOME}"
```

## 单机基础检查

```bash
set -euxo pipefail
nvidia-smi
nvidia-smi topo -m
nvcc --version || true
python - <<'PY'
import os, torch
print('torch', torch.__version__)
print('cuda', torch.version.cuda)
print('cuda_available', torch.cuda.is_available())
print('gpu_count', torch.cuda.device_count())
print('bf16_supported', torch.cuda.is_bf16_supported() if torch.cuda.is_available() else False)
for i in range(torch.cuda.device_count()):
    print(i, torch.cuda.get_device_name(i))
PY
ibstat || true
ibv_devices || true
env | grep -E 'CUDA|NCCL|TORCH|MASTER|WORLD|RANK' | sort || true
```

## 常见根因定位

```bash
python - <<'PY'
import ctypes.util
print('libnccl', ctypes.util.find_library('nccl'))
print('libcuda', ctypes.util.find_library('cuda'))
PY
which python
which swift || true
which deepspeed || true
ulimit -n
df -h
free -h || true
```

## NCCL 快速排查

```bash
export NCCL_DEBUG=INFO
export NCCL_DEBUG_SUBSYS=INIT,ENV,GRAPH,COLL
export NCCL_IB_HCA=mlx5_0,mlx5_1,mlx5_2,mlx5_3,mlx5_8,mlx5_9,mlx5_10,mlx5_11
export NCCL_SOCKET_IFNAME=ib0,ib1,ib2,ib3
export TORCH_NCCL_ASYNC_ERROR_HANDLING=1
export CUDA_DEVICE_MAX_CONNECTIONS=1
```

如果训练在初始化阶段卡住，优先检查：

- `MASTER_ADDR`、`MASTER_PORT`、`NODE_RANK` 是否一致
- 所有节点 Python 环境、驱动、CUDA、torch、deepspeed 是否一致
- IB 网卡名是否与机器实际一致
- 防火墙或安全组是否拦截 rendezvous 端口

## 最小分布式冒烟

先在单节点执行：

```bash
CUDA_VISIBLE_DEVICES=0,1 torchrun \
  --nproc_per_node 2 \
  --master_addr 127.0.0.1 \
  --master_port 29501 \
  -m torch.distributed.run --help >/dev/null
```

再做 PyTorch 通信冒烟：

```bash
CUDA_VISIBLE_DEVICES=0,1 torchrun \
  --nproc_per_node 2 \
  --master_addr 127.0.0.1 \
  --master_port 29501 \
  - <<'PY'
import os, torch, torch.distributed as dist
dist.init_process_group('nccl')
rank = dist.get_rank()
torch.cuda.set_device(rank)
x = torch.tensor([rank + 1.0], device='cuda')
dist.all_reduce(x)
print('rank', rank, 'sum', x.item())
dist.destroy_process_group()
PY
```

## 建议输出格式

先回传以下四类信息，再继续深挖：

- `nvidia-smi`
- `python` 中 torch / cuda / bf16 检查结果
- `ibstat` 与 `ibv_devices`
- 首个 NCCL 报错堆栈与前后 50 行日志
