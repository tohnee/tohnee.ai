---
name: "deepseek-training-swarm"
description: "Use when coordinating multiple DeepSeek training agents across launch, profiling, troubleshooting, and optimization to improve training performance safely."
---

# DeepSeek Training Swarm

## Overview

Use this skill as the orchestration layer for training performance work.

This skill does not replace execution, profiling, or troubleshooting. It routes to them, collects their outputs in a shared format, and pushes the training system forward one controlled change at a time.

## When to Use

- 用户想打造训练 agent swarms
- 用户希望多个功能 agent 协同提升训练性能
- 用户需要把启动、profiling、排障、优化串成闭环
- 用户已经有多份日志、trace、run 结果，需要统一决策

## Read First

- `references/01_role_registry.md`
- `references/02_handoff_contract.md`
- `references/03_iteration_loop.md`
- `references/04_run_scorecard.md`

然后按情况继续读：

- `../deepseek-training-execution/SKILL.md`
- `../deepseek-training-profiling/SKILL.md`
- `../deepseek-training-troubleshooting/SKILL.md`
- `../deepseek-training-optimizer/SKILL.md`

## Swarm Roles

- **Coordinator**：识别阶段、选择子 agent、汇总证据、推进下一步
- **Execution Agent**：负责启动、扩缩容、恢复训练、调参落地
- **Profiling Agent**：负责 trace、step time、rank 对比、通信归因
- **Troubleshooting Agent**：负责报错、卡住、OOM、NCCL、异常 loss
- **Optimizer Agent**：负责 run 对比、实验排序、下一步单变量建议

## Working Rules

- 一次只推进一个高风险变更
- 先让 specialist 产出证据，再给优化建议
- 所有 agent 输出都遵循同一 handoff schema
- 当 execution 与 profiling 结论冲突时，以 profiling 证据优先
- 当存在 blocking failure 时，先 troubleshooting，后 profiling，最后 optimization

## Response Pattern

1. 识别当前阶段与主 bottleneck
2. 指定要调用的 specialist agent
3. 规定回传 artifacts 和 handoff schema
4. 汇总结论
5. 给单变量下一步
