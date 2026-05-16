# 02 Handoff Contract

## 目标

让所有训练 agent 用统一格式交接，避免 execution、profiling、troubleshooting、optimizer 输出无法对齐。

## 标准字段

每个 agent 回传都尽量包含：

- `current_stage`
- `summary`
- `evidence`
- `suspected_bottleneck`
- `recommended_action`
- `risk`
- `verification`
- `next_handoff`

## 字段要求

### current_stage

可选值：

- env
- model
- framework
- launch
- runtime
- profiling
- troubleshooting
- optimization
- evaluation

### evidence

必须尽量引用可复查证据：

- 日志片段
- tokens/s
- step time
- scaling efficiency
- trace 文件名
- rank 级异常

### recommended_action

必须是最小可执行动作：

- 一个命令
- 一个配置修改
- 一个回退动作

### risk

至少说明：

- 是否破坏性
- 是否影响 checkpoint
- 是否影响稳定性

### verification

必须说明验证方式：

- 需要看什么指标
- 需要跑多少步
- 成功与失败标准

## 示例模板

```text
current_stage: profiling
summary: 4 节点扩展效率显著下降
evidence: 1 节点 100 tok/s，4 节点 250 tok/s，效率 0.625
suspected_bottleneck: communication hotspot
recommended_action: 先做 nccl-tests all_reduce sweep
risk: 低，不改训练权重
verification: 比较 busbw 与训练 step time
next_handoff: optimizer
```

## 原则

- 没有证据，不进入 optimizer
- 没有 verification，不算完整 handoff
- 没有 next_handoff，Coordinator 不应结束循环
