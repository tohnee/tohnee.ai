# 03 迭代闭环

## 目标

把“训练性能优化”变成稳定可重复的 swarm 循环，而不是一次性调参。

## 标准循环

1. Coordinator 识别当前阶段
2. 如果训练起不来，交给 Troubleshooting Agent
3. 如果训练能跑但慢，交给 Profiling Agent
4. 如果已经确认瓶颈，交给 Optimizer Agent
5. Execution Agent 落地单变量变更
6. Coordinator 对比前后 run scorecard
7. 决定继续、回退或结束

## 单变量原则

每轮只允许一个主要变化，例如：

- 只改 ZeRO 层级
- 只开 packing
- 只调整 LoRA rank
- 只改变 TP / PP / SP 其中一个维度

不要一轮同时改：

- ZeRO
- packing
- FP8
- Megatron 并行策略

## 停止条件

满足任一项即可考虑停止：

- 性能提升小于预设阈值
- 稳定性变差
- loss 明显恶化
- 多节点扩展效率达到目标
- 下一轮风险高于预期收益

## 回退条件

满足任一项应优先回退：

- loss 异常
- 训练不稳定
- checkpoint 保存异常
- 只能在某些节点复现的问题变多

## 推荐循环输出

每轮都应产出：

- 变更前 run
- 变更后 run
- 关键 KPI
- 风险判断
- 下一轮建议
