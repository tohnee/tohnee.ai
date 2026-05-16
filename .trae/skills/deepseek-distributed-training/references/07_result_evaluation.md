# 07 结果评估

适用信号：`训练完了`、`效果怎样`、`merge lora`、`推理测试`

## 目标

确认 checkpoint 完整、adapter 可加载、基础推理可用，再判断是否值得继续训练或合并权重。

## 先看产物

```bash
export RUN_DIR=/nas_train/tc/output/<run_dir>
find "${RUN_DIR}" -maxdepth 2 -type f | sort | tail -n 100
```

LoRA 场景优先确认：

- `adapter_config.json`
- `adapter_model.safetensors` 或分片
- `args.json`

全参场景优先确认：

- `config.json`
- 权重分片
- tokenizer 相关文件

## LoRA 推理冒烟

```bash
source /nas_train/tc/ms-swift/.py310_ds/bin/activate
python - <<'PY'
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
base = '/nas_train/app.e0016372/models/DeepSeek-V3-BF16'
adapter = '/nas_train/tc/output/<run_dir>/checkpoint-<step>'
tok = AutoTokenizer.from_pretrained(base, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(base, trust_remote_code=True, torch_dtype='auto', device_map='cpu')
model = PeftModel.from_pretrained(model, adapter)
print('adapter_loaded', True)
print('vocab_size', getattr(tok, 'vocab_size', None))
PY
```

## merge 前风险提醒

merge adapter 或覆盖权重前必须先提示：

- merge 后目录可能被覆盖
- 若基座与 adapter 版本不一致，merge 结果可能不可用
- merge 前先保留原始 checkpoint 与基座只读副本

## 最小质量评估

```bash
grep -nE 'eval_loss|accuracy|rouge|bleu|f1|reward' /nas_train/tc/output/<run>.log | tail -n 50
```

如果没有自动评估指标，至少做三类人工抽样：

- 训练集同分布样本
- 边界长样本
- 明显未见过的新样本

## 是否继续训练的判断

- 训练 loss 下降但验证指标不升：优先停下来检查过拟合
- 指标升、人工抽样也变好：可以继续
- 指标好但推理行为异常：优先检查模板、tokenizer、merge 流程

## 交付前最小检查

```bash
python - <<'PY'
import json, os
run_dir = '/nas_train/tc/output/<run_dir>'
for name in ['args.json', 'trainer_state.json']:
    path = os.path.join(run_dir, name)
    if os.path.exists(path):
        print(name, 'exists')
PY
```

## 推荐输出格式

- 产物是否完整
- adapter 或权重能否加载
- 自动指标结论
- 人工样例结论
- 是否建议继续训练 / merge / 回滚
