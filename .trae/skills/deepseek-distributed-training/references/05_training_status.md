# 05 训练状态监控

适用信号：`训练中`、`看日志`、`Loss 不降`、`卡住了`

## 目标

从日志、GPU、网络、checkpoint 四个维度判断训练是否正常推进。

## 日志观察

```bash
export LOG_FILE=/nas_train/tc/output/<run>.log
tail -n 200 "${LOG_FILE}"
grep -nE 'loss|lr|grad_norm|overflow|nan|inf|OOM|NCCL|checkpoint|save' "${LOG_FILE}" | tail -n 100
```

## GPU 与显存观察

```bash
watch -n 5 nvidia-smi
```

如果不方便用交互方式：

```bash
while true; do
  date
  nvidia-smi --query-gpu=index,name,utilization.gpu,utilization.memory,memory.used,memory.total,temperature.gpu --format=csv
  sleep 10
done
```

## 判断标准

- loss 持续下降或至少稳定波动：通常正常
- loss 一直不变：优先检查数据、学习率、是否实际在更新参数
- 首步后显存持续上涨直到 OOM：优先检查梯度累积、长序列、packing、保存逻辑
- GPU 利用率长期接近 0：优先检查数据加载、通信等待、死锁

## 参数是否真的在训练

```bash
grep -nE 'trainable params|frozen params|lora|target_modules|target_parameters' "${LOG_FILE}" | tail -n 50
```

LoRA 场景里如果 trainable params 明显异常偏低，优先检查 `target_modules` 或 `target_parameters` 是否命中。

## Loss 异常排查

```bash
grep -nE 'nan|inf|overflow|diverge|grad_norm' "${LOG_FILE}" | tail -n 100
```

优先排查：

- 数据里 assistant 为空或格式错误
- 学习率过高
- packing 后有效 token 分布变化太大
- FP8 或自定义 kernel 引入数值不稳定

## 卡住时的最小切分法

1. 只保留单节点 2 卡复现
2. 只跑 2 个 step
3. 关闭 packing
4. 退回 BF16
5. 退回 LoRA 基线

## checkpoint 进度确认

```bash
export RUN_DIR=/nas_train/tc/output/<run_dir>
find "${RUN_DIR}" -maxdepth 2 -type f | sort | tail -n 50
du -sh "${RUN_DIR}"
```

## 建议回传信息

- 最近 200 行训练日志
- 当前 `nvidia-smi` 快照
- 最近一次保存 checkpoint 的时间点
- 是否只在主节点有日志输出
