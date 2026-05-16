# 09 日志分析与故障模式速查表

适用信号：`日志分析`、`报错怎么看`、`首个报错`、`快速定位`

## 目标

先从长日志里找到第一处有效信号，再按故障模式归类，避免被级联报错带偏。

## 第一原则

- 先找第一次报错，不先看最后一行
- 先看 Python traceback 前后的 50 行
- 先看 rank0 和首个失败 rank
- 先判断是环境、模型、框架、启动、训练中还是保存阶段

## 最小日志提取

```bash
export LOG_FILE=/nas_train/tc/output/<run>.log
grep -nE 'Traceback|Error|Exception|RuntimeError|ValueError|AssertionError|OOM|NCCL|nan|inf|killed' "${LOG_FILE}" | head -n 50
tail -n 200 "${LOG_FILE}"
```

如果日志太大，优先抽首个报错上下文：

```bash
LINE=$(grep -nE 'Traceback|Error|Exception|RuntimeError|ValueError|AssertionError|OOM|NCCL' "${LOG_FILE}" | head -n 1 | cut -d: -f1)
sed -n "$((LINE-50)),$((LINE+80))p" "${LOG_FILE}"
```

## 快速归类表

| 现象 | 优先怀疑 | 先看哪份 reference |
| --- | --- | --- |
| `NCCL`、`connection reset`、`timeout` | 网卡、端口、节点不一致 | `01_env_check.md` |
| `unexpected key`、`missing key` | 权重与代码版本不匹配 | `02_model_check.md` |
| `No module named`、导入失败 | 环境或包版本问题 | `03_framework_check.md` |
| 启动后立刻退出 | 参数名、数据路径、分布式变量 | `04_training_launch.md` |
| `loss=nan`、`overflow` | 数据、学习率、FP8、kernel | `05_training_status.md` |
| `tokens/s` 很低 | 网络、packing、并行策略 | `06_performance_analysis.md` |
| merge / 推理异常 | adapter、tokenizer、模板 | `07_result_evaluation.md` |
| TP/PP/SP 相关报错 | Megatron 组合或版本支持 | `08_megatron_playbook.md` |

## 常见模式

### 1. NCCL 初始化失败

常见关键词：

- `NCCL WARN`
- `socket`
- `timeout`
- `unhandled system error`

优先动作：

```bash
env | grep -E 'MASTER|RANK|WORLD|NCCL|CUDA' | sort
nvidia-smi topo -m
ibstat || true
```

### 2. OOM

常见关键词：

- `CUDA out of memory`
- `Tried to allocate`

优先动作：

```bash
grep -nE 'max_length|packing|per_device_train_batch_size|gradient_accumulation_steps|deepspeed' "${LOG_FILE}" | tail -n 50
nvidia-smi --query-gpu=index,memory.used,memory.total --format=csv
```

### 3. Loss 为 NaN / Inf

常见关键词：

- `nan`
- `inf`
- `overflow`

优先动作：

```bash
grep -nE 'nan|inf|overflow|grad_norm|learning_rate' "${LOG_FILE}" | tail -n 100
```

优先怀疑：

- 数据里 assistant 为空
- 学习率过高
- FP8 初次引入过早
- packing 后有效 token 分布突变

### 4. 参数没真正训练

常见关键词：

- `trainable params`
- `target_modules`
- `target_parameters`

优先动作：

```bash
grep -nE 'trainable params|frozen params|target_modules|target_parameters|lora' "${LOG_FILE}" | tail -n 100
```

### 5. Checkpoint 异常

常见关键词：

- `save`
- `checkpoint`
- `No space left on device`
- `safetensors`

优先动作：

```bash
df -h
grep -nE 'checkpoint|save|safetensors|No space left' "${LOG_FILE}" | tail -n 100
```

### 6. Megatron 切并行后失败

常见关键词：

- `tensor parallel`
- `pipeline parallel`
- `sequence parallel`
- `world size`

优先动作：

```bash
grep -nEi 'megatron|tensor_parallel|pipeline_parallel|sequence_parallel|context_parallel|world size|rank' "${LOG_FILE}" | tail -n 100
```

## 排障顺序

1. 找第一处有效报错
2. 判断阶段
3. 归类到故障模式
4. 只做最小回退或最小改动
5. 再复现 2 到 5 个 step 验证

## 建议回传格式

- 第一处报错原文
- 报错前后 50 行
- 当前阶段
- 你已经改过哪些参数
- 改动前后是否都能复现
