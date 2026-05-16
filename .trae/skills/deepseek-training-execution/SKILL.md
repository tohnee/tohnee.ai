---
name: "deepseek-training-execution"
description: "Use when launching, scaling, resuming, or tuning DeepSeek or similar large-model training jobs with ms-swift, DeepSpeed, ZeRO, Megatron, packing, or multi-node clusters."
---

# DeepSeek Training Execution

## Overview

Use this skill when the user is already in the execution path: launch scripts, scaling strategy, resume plan, throughput tuning, or Megatron rollout.

Read the referenced files first, then answer with executable commands.

如果问题核心变成 trace、profiling、step time breakdown、rank 对比或多节点扩展效率，切到 `deepseek-training-profiling`。

## When to Use

- 用户在问怎么启动训练
- 用户要写多节点脚本
- 用户在调 LoRA rank、packing、ZeRO、Megatron
- 用户要恢复训练或提升吞吐

## Read First

- `../deepseek-distributed-training/references/04_training_launch.md`
- `../deepseek-distributed-training/references/06_performance_analysis.md`
- `../deepseek-distributed-training/references/08_megatron_playbook.md`

## Working Rules

- 先给 BF16 基线，再给增强版
- 一次只增加一个复杂度维度
- 所有启动命令都保留 `2>&1 | tee <logfile>`
- 恢复训练、覆盖输出目录、merge 权重前先提示风险

## Response Pattern

1. 说明当前属于执行阶段
2. 给最小可运行启动或调优命令
3. 给验证指标
4. 给下一步单变量优化建议
