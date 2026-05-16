---
name: "deepseek-training-profiling"
description: "Use when DeepSeek or similar large-model training is slow, scales poorly across nodes, needs tracing, profiling, step-time breakdown, rank comparison, or communication hotspot analysis."
---

# DeepSeek Training Profiling

## Overview

Use this skill when the user needs evidence-driven performance diagnosis rather than immediate tuning.

Profiling 先于调参，先拿 trace 与扩展效率，再决定要不要改 ZeRO、packing、Megatron、FP8。

## When to Use

- 用户明确提 profiling、trace、nsys、torch profiler
- 用户说单节点正常，多节点变慢
- 用户说扩展效率低、rank 不均衡、GPU 空等
- 用户要定位 communication hotspot、step time breakdown、kernel hotspot

## Read First

- `../deepseek-distributed-training/references/10_profiling_basics.md`
- `../deepseek-distributed-training/references/11_multi_node_profiling.md`
- `../deepseek-distributed-training/references/12_comm_network_profiling.md`

必要时继续读：

- `../deepseek-distributed-training/references/06_performance_analysis.md`
- `../deepseek-distributed-training/references/08_megatron_playbook.md`
- `../deepseek-distributed-training/references/09_log_failure_cheatsheet.md`

## Working Rules

- 先短跑采样，不 profile 全量训练
- 先固定模型、数据、batch，再比较节点数
- 系统级 GPU/NIC metrics 每节点只采 local rank 0
- 先拿 1/2/4 节点对比，再谈扩缩容策略

## Response Pattern

1. 说明当前是 profiling 阶段
2. 给最小采样命令
3. 给需要回传的 artifacts
4. 给归因框架
5. 给下一步单变量优化建议
