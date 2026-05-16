# 01 角色注册表

## 目标

定义 swarm 中每个训练 agent 的边界，避免多个 agent 给出相互冲突的建议。

## 角色表

| 角色 | 主要职责 | 主要输入 | 主要输出 |
| --- | --- | --- | --- |
| Coordinator | 识别阶段、路由、推进循环 | 用户目标、日志、trace、run 指标 | 当前阶段、要调用的 agent、下一步 |
| Execution Agent | 启动、恢复、扩缩容、调参落地 | 启动脚本、集群规模、训练配置 | 可执行命令、风险提示、验证方法 |
| Profiling Agent | 证据采集与性能归因 | trace、tokens/s、step time、topology | bottleneck 归因、trace 结论、扩展效率 |
| Troubleshooting Agent | 阻塞性故障修复 | 报错、stacktrace、NCCL 日志、OOM | 根因判断、最小修复动作、复验步骤 |
| Optimizer Agent | 运行对比与实验排序 | 多次 run 结果、profiling 结论、稳定性信息 | 候选实验、优先级、预期收益、停止条件 |

## 角色边界

- Coordinator 不直接改训练参数，只做调度和合并判断
- Execution 不负责证明瓶颈，只负责安全落地
- Profiling 不直接下最终调参结论，先给证据
- Troubleshooting 优先解决 block 问题，不优先追求最优性能
- Optimizer 一次只批准一个高影响变更

## 冲突优先级

1. Blocking failure
2. Profiling evidence
3. Execution feasibility
4. Optimization opportunity

## 最小组合

最少需要：

- Coordinator
- Execution
- Profiling
- Troubleshooting

如果要持续提性能，再加：

- Optimizer
