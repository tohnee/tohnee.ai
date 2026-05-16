# 06 性能分析

适用信号：`太慢`、`MFU`、`吞吐量`、`FP8 加速`

## 目标

先区分瓶颈在数据、通信、显存还是算子，再决定是否上 packing、FP8、Megatron 或更激进的并行配置。

如果用户明确要做 trace、torch profiler、nsys、rank 对比、多节点扩展效率分析，优先继续读：

- `10_profiling_basics.md`
- `11_multi_node_profiling.md`
- `12_comm_network_profiling.md`

## 先拿基础指标

```bash
export LOG_FILE=/nas_train/tc/output/<run>.log
grep -nE 'samples/s|tokens/s|tok/s|throughput|mfu|step_time|eval_runtime' "${LOG_FILE}" | tail -n 100
```

```bash
nvidia-smi --query-gpu=index,utilization.gpu,utilization.memory,memory.used,memory.total,power.draw --format=csv
```

## 快速判断

- GPU 利用率低、显存不高：更像数据或通信瓶颈
- GPU 利用率高、显存接近满：更像计算或 batch / sequence 受限
- ZeRO3 明显慢于 ZeRO2：先接受它换显存的代价，不要直接误判为异常
- 单节点快、多节点慢：优先查网络与分布式切分策略

## 提升顺序

1. 先稳定 BF16 基线
2. 尝试 `flash_attention_2`
3. 再尝试 `packing true`
4. 再评估 Sequence Parallel
5. 最后再评估 FP8 或 Megatron

## packing 观察点

- 看 tokens/s 是否提升
- 看 loss 曲线是否仍稳定
- 看梯度累积是否需要重调
- 看每步耗时波动是否下降

## FP8 观察点

- 只在 BF16 已稳定时引入
- 先做单节点短跑
- 观察 loss 是否比 BF16 更抖
- 观察是否出现 TransformerEngine 导入或 kernel 兼容报错

## 多节点慢的最小排查

```bash
env | grep -E 'NCCL|CUDA_DEVICE_MAX_CONNECTIONS|MASTER|WORLD|RANK' | sort
nvidia-smi topo -m
ibstat || true
```

优先检查：

- IB HCA 是否配置正确
- `NCCL_SOCKET_IFNAME` 是否指向真实网卡
- 是否错误退回以太网
- 是否一开始就上了 ZeRO3 + packing + 多维并行，导致定位困难

如果这里仍无法归因，不要直接调参，转入 profiling：

1. 用 `10_profiling_basics.md` 做单节点 step time 拆分
2. 用 `11_multi_node_profiling.md` 比较 1/2/4 节点扩展效率
3. 用 `12_comm_network_profiling.md` 判断是否是 collective 或链路问题

## 结果表达模板

给用户的分析建议尽量按以下顺序：

- 当前瓶颈判断
- 支撑该判断的日志或 GPU 指标
- 最小改动优化项
- 预期收益与风险
