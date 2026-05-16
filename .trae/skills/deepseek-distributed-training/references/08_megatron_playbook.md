# 08 Megatron 专项

适用信号：`Megatron`、`TP/PP/SP/CP`、`全参 671B`、`想提吞吐`

## 目标

把 Megatron 当作在 BF16 基线稳定之后的扩展方案，而不是第一次启动就一起改完的黑盒配置。

## 引入顺序

1. 先单节点或多节点跑通普通 BF16 基线
2. 再引入 Tensor Parallel
3. 再引入 Pipeline Parallel
4. 再引入 Sequence Parallel
5. 最后再评估 Context Parallel 或 FP8

一次只增加一个并行维度，并保留同一数据集、同一 step 数的短跑日志用于对比。

## 短跑基线要求

```bash
export MODEL_DIR=/nas_train/app.e0016372/models/DeepSeek-V3-BF16
export SWIFT_HOME=/nas_train/tc/ms-swift
export SWIFT_ENV=/nas_train/tc/ms-swift/.py310_ds
export OUTPUT_ROOT=/nas_train/tc/output
source "${SWIFT_ENV}/bin/activate"
cd "${SWIFT_HOME}"
```

先探测当前版本是否暴露了 Megatron 相关参数：

```bash
swift sft --help | grep -Ei 'megatron|tensor_parallel|pipeline_parallel|sequence_parallel|context_parallel|tp|pp|sp|cp' || true
```

## 并行维度理解

- TP：切单层矩阵计算，优先解决单卡算力和单层权重过大问题
- PP：切层，优先解决整网层数深、单卡装不下的问题
- SP：配合 TP 降低长序列激活与通信开销
- CP：超长上下文时再考虑，不作为第一步

## 推荐推进方式

### 第一步：只上 TP

- 适合先验证模型切分是否正确
- 先用 `TP=2` 或 `TP=4`
- 观察 loss 是否与普通 BF16 基线同趋势

### 第二步：TP 稳定后再上 PP

- 先从 `PP=2` 开始
- 看 pipeline bubble 是否让吞吐恶化
- 看日志是否只在最后一个 PP rank 输出

### 第三步：长序列再上 SP

- 先确保当前版本真的支持 `sequence_parallel`
- SP 的收益通常要在长序列、较大 TP 下更明显
- SP 改完要重新看 tokens/s、显存、loss 抖动

## 32 卡建议矩阵

这不是唯一答案，但可作为最小起点：

| 目标 | 建议起点 |
| --- | --- |
| 先验证 Megatron 是否通 | `TP=2, PP=1, SP=1` |
| 全参切分保守起步 | `TP=4, PP=2, SP=1` |
| 长序列吞吐优化 | `TP=4, PP=2, SP=2` |

最终组合要满足：`TP × PP × DP = 32`，如果再引入 CP，需要一起重算世界规模切分。

## 启动前一致性检查

```bash
env | grep -E 'MASTER|RANK|WORLD|CUDA|NCCL' | sort
python3 - <<'PY'
import torch
print('cuda_available', torch.cuda.is_available())
print('gpu_count', torch.cuda.device_count())
print('bf16_supported', torch.cuda.is_bf16_supported() if torch.cuda.is_available() else False)
PY
```

## 常见症状与判断

- 一加 TP 就起不来：优先查参数名、版本支持、world size 切分关系
- 一加 PP 就吞吐暴跌：优先查 micro-batch 太小、stage 划分不均
- 一加 SP 就报错：优先查当前 swift 版本是否支持该模型和注意力实现
- 多维并行一起开后 loss 异常：先回退到只改一个维度的上一个版本

## FP8 与 Megatron 的关系

- 不要把 FP8 和 Megatron 首次引入绑在一起
- 先验证 Megatron BF16 稳定
- 再做单节点短跑 FP8
- 最后再做多节点 FP8

## 回退原则

如果结果异常，按以下顺序回退：

1. 先关 FP8
2. 再关 SP
3. 再降 PP
4. 最后退回普通 BF16 基线

## 交付建议

给用户汇报时优先提供：

- 当前并行组合
- 与上一个组合相比的 tokens/s 和显存变化
- 是否保持 loss 趋势一致
- 下一步只改哪一个维度
