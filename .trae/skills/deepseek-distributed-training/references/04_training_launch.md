# 04 训练启动

适用信号：`怎么启动`、`写个脚本`、`ZeRO`、`Megatron`、`LoRA rank`

## 目标

先给可跑通的 BF16 基线，再逐步叠加 ZeRO、packing、Sequence Parallel、Megatron。

## 启动前固定环境

```bash
export MASTER_ADDR=10.239.2.10
export MASTER_PORT=29500
export NNODES=4
export NPROC_PER_NODE=8
export MODEL_DIR=/nas_train/app.e0016372/models/DeepSeek-V3-BF16
export SWIFT_HOME=/nas_train/tc/ms-swift
export SWIFT_ENV=/nas_train/tc/ms-swift/.py310_ds
export OUTPUT_ROOT=/nas_train/tc/output
export DATASET=/path/to/train.jsonl
export VAL_DATASET=/path/to/val.jsonl
export NODE_RANK=${NODE_RANK:?set NODE_RANK on each node}
source "${SWIFT_ENV}/bin/activate"
cd "${SWIFT_HOME}"
mkdir -p "${OUTPUT_ROOT}"
```

## 启动前参数探测

```bash
source /nas_train/tc/ms-swift/.py310_ds/bin/activate
swift sft --help | grep -E 'train_type|deepspeed|packing|target_modules|target_parameters|sequence_parallel|gradient_checkpointing' || true
```

## LoRA BF16 基线

优先用于先跑通数据、模板、loss、checkpoint。

```bash
export RUN_NAME=dsv3_lora_bf16_$(date +%Y%m%d_%H%M%S)
export LOG_FILE="${OUTPUT_ROOT}/${RUN_NAME}.log"
NPROC_PER_NODE=${NPROC_PER_NODE} \
NNODES=${NNODES} \
NODE_RANK=${NODE_RANK} \
MASTER_ADDR=${MASTER_ADDR} \
MASTER_PORT=${MASTER_PORT} \
swift sft \
  --model "${MODEL_DIR}" \
  --check_model false \
  --dataset "${DATASET}" \
  --val_dataset "${VAL_DATASET}" \
  --train_type lora \
  --torch_dtype bfloat16 \
  --attn_impl flash_attention_2 \
  --deepspeed zero2 \
  --target_modules all-linear \
  --lora_rank 32 \
  --lora_alpha 64 \
  --gradient_checkpointing true \
  --per_device_train_batch_size 1 \
  --gradient_accumulation_steps 16 \
  --learning_rate 1e-4 \
  --max_length 4096 \
  --num_train_epochs 1 \
  --save_steps 100 \
  --eval_steps 100 \
  --logging_steps 5 \
  --output_dir "${OUTPUT_ROOT}/${RUN_NAME}" \
  2>&1 | tee "${LOG_FILE}"
```

## 全参 BF16 基线

671B 全参不要直接把普通 ZeRO 当生产方案。先用最小步数冒烟，确认数据、通信、优化器和保存逻辑都正常，再转 Megatron 或更强并行方案。

```bash
export RUN_NAME=dsv3_full_bf16_smoke_$(date +%Y%m%d_%H%M%S)
export LOG_FILE="${OUTPUT_ROOT}/${RUN_NAME}.log"
NPROC_PER_NODE=${NPROC_PER_NODE} \
NNODES=${NNODES} \
NODE_RANK=${NODE_RANK} \
MASTER_ADDR=${MASTER_ADDR} \
MASTER_PORT=${MASTER_PORT} \
swift sft \
  --model "${MODEL_DIR}" \
  --check_model false \
  --dataset "${DATASET}" \
  --train_type full \
  --torch_dtype bfloat16 \
  --attn_impl flash_attention_2 \
  --deepspeed zero3 \
  --gradient_checkpointing true \
  --per_device_train_batch_size 1 \
  --gradient_accumulation_steps 16 \
  --learning_rate 5e-6 \
  --max_length 4096 \
  --max_steps 2 \
  --save_steps 1000 \
  --logging_steps 1 \
  --output_dir "${OUTPUT_ROOT}/${RUN_NAME}" \
  2>&1 | tee "${LOG_FILE}"
```

## 参数建议

- LoRA rank：先从 `16` 或 `32` 起步，只有容量明显不足再升到 `64`
- `target_modules`：先用 `all-linear`；如果某些 router / gate 不是 `nn.Linear`，再考虑 `target_parameters`
- packing：只在 BF16 基线稳定后再开，并确认 `transformers>=4.44`
- Sequence Parallel：先确认当前 swift 版本支持的参数名，再逐步增加并行度
- ZeRO 选择：LoRA 先 `zero2`，全参冒烟先 `zero3`

## packing 版本

```bash
export RUN_NAME=dsv3_lora_pack_$(date +%Y%m%d_%H%M%S)
export LOG_FILE="${OUTPUT_ROOT}/${RUN_NAME}.log"
NPROC_PER_NODE=${NPROC_PER_NODE} \
NNODES=${NNODES} \
NODE_RANK=${NODE_RANK} \
MASTER_ADDR=${MASTER_ADDR} \
MASTER_PORT=${MASTER_PORT} \
swift sft \
  --model "${MODEL_DIR}" \
  --check_model false \
  --dataset "${DATASET}" \
  --train_type lora \
  --torch_dtype bfloat16 \
  --attn_impl flash_attention_2 \
  --deepspeed zero2 \
  --target_modules all-linear \
  --lora_rank 32 \
  --packing true \
  --max_length 8192 \
  --per_device_train_batch_size 1 \
  --gradient_accumulation_steps 8 \
  --output_dir "${OUTPUT_ROOT}/${RUN_NAME}" \
  2>&1 | tee "${LOG_FILE}"
```

## Megatron 原则

- 671B 全参正式训练优先评估 Megatron-SWIFT
- 先在当前环境确认普通 BF16 基线、数据和日志无误，再切到 Megatron
- 切 Megatron 时一次只增加一种并行维度，避免同时改 tensor、pipeline、sequence 导致定位困难

## 风险提醒

- 覆盖已有 `output_dir` 前先确认是否包含有效 checkpoint
- 恢复训练前先检查 `args.json` 与当前启动参数是否一致
- adapter merge、权重覆盖、checkpoint 清理都属于破坏性操作
