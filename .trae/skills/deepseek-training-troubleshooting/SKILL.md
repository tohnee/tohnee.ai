---
name: "deepseek-training-troubleshooting"
description: "Use when DeepSeek or similar large-model training fails, hangs, OOMs, shows NCCL errors, unstable loss, checkpoint issues, or confusing multi-rank logs."
---

# DeepSeek Training Troubleshooting

## Overview

Use this skill when the user already has a failure signal:报错、卡住、OOM、loss 异常、日志难读、checkpoint 问题。

先定位阶段和第一处有效信号，再给最小修复动作。

## When to Use

- 用户贴训练日志求定位
- 用户遇到 NCCL、OOM、NaN、Inf、卡住
- 用户说训练没开始、没保存、没真正更新参数
- 用户说 Megatron 切分后起不来
- 用户说没报错但多节点明显变慢、step time 抖动、rank 不均衡

## Read First

- `../deepseek-distributed-training/references/01_env_check.md`
- `../deepseek-distributed-training/references/05_training_status.md`
- `../deepseek-distributed-training/references/09_log_failure_cheatsheet.md`

必要时继续读：

- `../deepseek-distributed-training/references/02_model_check.md`
- `../deepseek-distributed-training/references/03_framework_check.md`
- `../deepseek-distributed-training/references/08_megatron_playbook.md`
- `../deepseek-distributed-training/references/11_multi_node_profiling.md`

## Working Rules

- 先找第一处有效报错，不先看最后一行
- 先诊断，再建议
- 所有修复建议都给最小复现实验
- 多变量同时改动时，优先回退到最近稳定点

## Response Pattern

1. 判断故障阶段
2. 提取第一处有效信号
3. 给最可能根因列表
4. 给最小修复命令
5. 给复验观察点
