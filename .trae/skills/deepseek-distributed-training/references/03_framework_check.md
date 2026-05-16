# 03 框架检查

适用信号：`包版本`、`ms-swift 安装`、`deepspeed 版本`、`TransformerEngine`

## 目标

确认 Python 环境、ms-swift 源码、torch、transformers、deepspeed、flash-attn、TransformerEngine 是否兼容。

## 基础版本快照

```bash
export SWIFT_HOME=/nas_train/tc/ms-swift
export SWIFT_ENV=/nas_train/tc/ms-swift/.py310_ds
source "${SWIFT_ENV}/bin/activate"
cd "${SWIFT_HOME}"
python -V
pip -V
which python
which pip
git rev-parse --short HEAD
git status --short
```

## 关键包版本

```bash
source /nas_train/tc/ms-swift/.py310_ds/bin/activate
python - <<'PY'
mods = [
    'swift', 'torch', 'transformers', 'deepspeed',
    'accelerate', 'datasets', 'peft', 'trl',
    'flash_attn', 'transformer_engine'
]
for name in mods:
    try:
        mod = __import__(name)
        print(f'{name}={getattr(mod, "__version__", "unknown")}')
    except Exception as e:
        print(f'{name}=IMPORT_FAIL:{e}')
PY
```

## DeepSpeed 自检

```bash
source /nas_train/tc/ms-swift/.py310_ds/bin/activate
ds_report || true
deepspeed --help >/dev/null
swift --help >/dev/null
swift sft --help | grep -E 'train_type|deepspeed|packing|max_length|gradient_checkpointing' || true
```

## 本地源码优先级

```bash
source /nas_train/tc/ms-swift/.py310_ds/bin/activate
python - <<'PY'
import os, swift
print('swift_import_path =', swift.__file__)
print('cwd =', os.getcwd())
PY
```

如果 `swift_import_path` 不在 `/nas_train/tc/ms-swift` 附近，说明当前环境可能没有优先使用本地源码。

## 常见兼容性判断

- `Expected to mark a variable ready only once`：优先使用 DeepSpeed，或加 `--gradient_checkpointing_kwargs '{"use_reentrant": false}'`
- `device_map` 与 DeepSpeed 同时出现：这是冲突配置，二选一
- `packing` 开启时报错：先检查 `transformers>=4.44` 与 `attn_impl` 是否为 flash attention
- `flash_attn` 导入失败：先确认 CUDA、torch、wheel 版本配套
- `transformer_engine` 导入失败：先退回 BF16 基线，不要直接卡在 FP8

## 推荐检查顺序

1. `python` / `pip` / `swift_import_path`
2. torch 与 CUDA 能否正常导入
3. deepspeed 是否可执行
4. flash-attn / TransformerEngine 是否只是可选增强而非硬依赖
5. 命令行参数名是否与当前 swift 版本一致

## 下一步

- 包或导入异常：先修环境
- 环境正常但启动失败：转到 `04_training_launch.md`
