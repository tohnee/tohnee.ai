---
name: "deepseek-distributed-training"
description: "Use when training or debugging DeepSeek, Qwen, LLaMA, or similar large models with ms-swift, DeepSpeed, Megatron, NCCL, ZeRO, FP8, LoRA, or multi-node GPU clusters."
---

# DeepSeek Distributed Training

## Overview

Use this skill for the full training lifecycle of large models on multi-GPU or multi-node clusters, especially ms-swift + DeepSeek-V3 on H100 or A100.

Always identify the user's current stage first, then read the matching reference file before answering. Do not rely on memory for training flags or environment details when a reference file exists.

## Known Environment

- Cluster: 32 × H100-SXM5-80GB, 4 nodes × 8 GPUs
- Master node: 10.239.2.10
- Interconnect: InfiniBand, mlx5_0~3 and mlx5_8~11
- Model: DeepSeek-V3-BF16
- Model path: `/nas_train/app.e0016372/models/DeepSeek-V3-BF16`
- ms-swift path: `/nas_train/tc/ms-swift`
- Python env: `/nas_train/tc/ms-swift/.py310_ds`
- Output root: `/nas_train/tc/output`

## Routing

| Stage | User signals | Read first |
| --- | --- | --- |
| 环境检查 | 跑不起来、NCCL 报错、GPU 看不到 | `references/01_env_check.md` |
| 模型检查 | 模型加载失败、FP8 转换、权重格式 | `references/02_model_check.md` |
| 框架检查 | 包版本、ms-swift 安装、deepspeed 版本 | `references/03_framework_check.md` |
| 训练启动 | 怎么启动、写脚本、ZeRO、Megatron | `references/04_training_launch.md` |
| 状态监控 | 训练中、看日志、Loss 不降、卡住了 | `references/05_training_status.md` |
| 性能分析 | 太慢、MFU、吞吐量、FP8 加速 | `references/06_performance_analysis.md` |
| 结果评估 | 训练完了、效果怎样、merge lora、推理测试 | `references/07_result_evaluation.md` |
| Megatron 扩展 | TP、PP、SP、CP、Megatron 并行策略 | `references/08_megatron_playbook.md` |
| 日志排障 | 日志分析、故障模式、首个报错怎么读 | `references/09_log_failure_cheatsheet.md` |
| Profiling 基础 | profiling、trace、step time、热点分析 | `references/10_profiling_basics.md` |
| 多节点 Profiling | 多节点变慢、rank 不均衡、扩展效率、通信热点 | `references/11_multi_node_profiling.md` |
| 通信 Profiling | NCCL 性能、all_reduce 慢、IB 带宽、busbw | `references/12_comm_network_profiling.md` |

## Companion Skills

- `deepseek-training-swarm`：适合用户要搭建训练 agent swarms 与统一编排层
- `deepseek-training-execution`：适合用户已经进入启动、扩缩容、恢复训练、性能调优阶段
- `deepseek-training-troubleshooting`：适合用户已有报错、卡住、loss 异常、NCCL 或 checkpoint 故障阶段
- `deepseek-training-profiling`：适合用户需要做 trace、profiling、扩展效率分析、通信归因阶段
- `deepseek-training-optimizer`：适合用户已有多轮 run 数据，需要排序下一步实验阶段

## Working Rules

- 先诊断根因，再给修复或优化动作
- 所有建议都给可复制的 bash 或 python 命令
- 任何覆盖权重、删除 checkpoint、merge adapter 的操作都先提示风险
- 先跑通 BF16 基线，再叠加 FP8、Megatron、Sequence Parallel 等优化
- 所有训练启动命令必须保留日志：`2>&1 | tee <logfile>`

## Response Pattern

1. 识别当前阶段与最可能根因
2. 读取对应 reference，再补充必要的相邻 reference
3. 给最小可执行检查命令
4. 给修复或启动命令
5. 给继续验证的观察点
