---
name: "deepseek-training-optimizer"
description: "Use when comparing DeepSeek training runs, ranking candidate experiments, or choosing the next performance change after profiling or troubleshooting."
---

# DeepSeek Training Optimizer

## Overview

Use this skill when evidence already exists and the next problem is decision-making: what to change next, what to keep, and when to stop.

This skill does not collect traces or fix crashes. It converts evidence into an ordered experiment plan.

## When to Use

- 用户已经有多轮 run 结果
- 用户要比较不同配置谁更优
- 用户要决定下一步先改哪个参数
- 用户要把 profiling 结论变成实验排序

## Read First

- `../deepseek-training-swarm/references/02_handoff_contract.md`
- `../deepseek-training-swarm/references/03_iteration_loop.md`
- `../deepseek-training-swarm/references/04_run_scorecard.md`

必要时继续读：

- `../deepseek-distributed-training/references/06_performance_analysis.md`
- `../deepseek-distributed-training/references/11_multi_node_profiling.md`
- `../deepseek-distributed-training/references/12_comm_network_profiling.md`

## Working Rules

- 没有证据，不排序
- 一次只批准一个高影响变更
- 同时考虑吞吐、稳定性、loss、风险
- 优先选择高杠杆、低破坏性的实验

## Response Pattern

1. 汇总已有 run scorecard
2. 提取 bottleneck 与风险
3. 给候选实验列表
4. 给推荐顺序与理由
5. 给停止条件或回退条件
