# 04 Run Scorecard

## 目标

给 Coordinator 和 Optimizer 一个统一的 run 对比模板，用来判断性能是否真的提升。

## 必填项

| 字段 | 说明 |
| --- | --- |
| run_id | 本轮实验唯一标识 |
| stage | launch / profiling / optimization / eval |
| config_delta | 与上一轮相比只改了什么 |
| nodes | 节点数 |
| gpus | 总卡数 |
| max_length | 序列长度 |
| batch_shape | micro batch 与 grad accumulation |
| tokens_per_sec | 吞吐 |
| step_time_ms | 平均 step 时间 |
| p95_step_time_ms | 抖动 |
| gpu_util | GPU 利用率 |
| memory_headroom | 显存余量 |
| scaling_efficiency | 多节点扩展效率 |
| loss_trend | loss 变化趋势 |
| stability | 是否稳定 |
| notes | 关键观察 |

## 最小模板

```text
run_id: run_20260326_01
stage: optimization
config_delta: 开启 packing
nodes: 4
gpus: 32
max_length: 8192
batch_shape: mbs=1 ga=8
tokens_per_sec: 312
step_time_ms: 1840
p95_step_time_ms: 2015
gpu_util: 71%
memory_headroom: 8GB
scaling_efficiency: 0.78
loss_trend: stable_down
stability: pass
notes: throughput 上升，step jitter 可接受
```

## 决策规则

- 吞吐升但稳定性降：不自动判赢
- 扩展效率升但 loss 变差：不自动判赢
- 指标持平但风险更低：可以保留
- 只有主观感觉更快：不算通过

## Coordinator 使用方式

- 每轮执行前保存旧 scorecard
- 每轮执行后补新 scorecard
- 只允许用相邻两轮做主要结论
