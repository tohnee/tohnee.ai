# 02 模型检查

适用信号：`模型加载失败`、`权重格式`、`FP8 转换`、`safetensors 报错`

## 目标

确认模型目录完整、配置与权重索引一致、dtype 正确，再判断是框架兼容问题还是模型文件损坏。

## 目录与文件完整性

```bash
export MODEL_DIR=/nas_train/app.e0016372/models/DeepSeek-V3-BF16
set -euxo pipefail
ls -lah "${MODEL_DIR}"
find "${MODEL_DIR}" -maxdepth 1 -type f | sort
test -f "${MODEL_DIR}/config.json"
test -f "${MODEL_DIR}/tokenizer_config.json" || true
test -f "${MODEL_DIR}/tokenizer.json" || true
test -f "${MODEL_DIR}/generation_config.json" || true
test -f "${MODEL_DIR}/model.safetensors.index.json" || ls "${MODEL_DIR}"/model-*.safetensors
```

## 读取 config 与索引

```bash
python - <<'PY'
import json, os
model_dir = '/nas_train/app.e0016372/models/DeepSeek-V3-BF16'
with open(os.path.join(model_dir, 'config.json')) as f:
    cfg = json.load(f)
print('architectures =', cfg.get('architectures'))
print('model_type =', cfg.get('model_type'))
print('torch_dtype =', cfg.get('torch_dtype'))
print('hidden_size =', cfg.get('hidden_size'))
print('num_hidden_layers =', cfg.get('num_hidden_layers'))
print('n_routed_experts =', cfg.get('n_routed_experts'))
index_path = os.path.join(model_dir, 'model.safetensors.index.json')
if os.path.exists(index_path):
    with open(index_path) as f:
        idx = json.load(f)
    print('weight_map_entries =', len(idx.get('weight_map', {})))
    print('metadata =', idx.get('metadata', {}))
PY
```

## 检查 safetensors 可读性

```bash
source /nas_train/tc/ms-swift/.py310_ds/bin/activate
python - <<'PY'
import glob, os
from safetensors import safe_open
model_dir = '/nas_train/app.e0016372/models/DeepSeek-V3-BF16'
files = sorted(glob.glob(os.path.join(model_dir, '*.safetensors')))[:3]
for path in files:
    print('checking', path)
    with safe_open(path, framework='pt', device='cpu') as f:
        keys = f.keys()
        print('tensor_count', len(list(keys)))
PY
```

## 最小加载测试

```bash
source /nas_train/tc/ms-swift/.py310_ds/bin/activate
python - <<'PY'
from transformers import AutoConfig, AutoTokenizer
model_dir = '/nas_train/app.e0016372/models/DeepSeek-V3-BF16'
cfg = AutoConfig.from_pretrained(model_dir, trust_remote_code=True)
tok = AutoTokenizer.from_pretrained(model_dir, trust_remote_code=True)
print(type(cfg).__name__)
print(type(tok).__name__)
print('vocab_size', getattr(tok, 'vocab_size', None))
PY
```

如果这里只能读 config 和 tokenizer，不能完整拉起模型，优先去看框架兼容性而不是立刻判定权重损坏。

## FP8 / 格式转换前的原则

- 先保留 BF16 原始权重只读副本
- 先验证 BF16 能正常加载，再做 FP8 转换
- 转换后先跑单卡前向，再跑多卡训练

## 常见症状与判断

- `KeyError` 或缺 tensor：通常是权重索引与实际分片不一致
- `unexpected key`：通常是 transformers 或模型代码版本不匹配
- `safetensors_rust.SafetensorError`：优先检查文件损坏、拷贝不完整、磁盘问题
- `dtype` 不符合预期：优先检查 `config.json` 的 `torch_dtype` 与加载参数是否冲突

## 下一步

- 模型文件没问题但加载失败：转到 `03_framework_check.md`
- 模型能加载但训练起不来：转到 `04_training_launch.md`
