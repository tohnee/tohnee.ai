# 12 通信与网络 Profiling

适用信号：`all_reduce 慢`、`NCCL 性能差`、`busbw`、`IB 带宽`、`collective 热点`

## 目标

把“怀疑是通信慢”变成可测量的 collective 带宽、延迟和链路归因。

## 原则

- 先做独立通信基准，再看训练 trace
- 先看单节点，再看多节点
- 先测 all-reduce，再补 reduce-scatter 和 all-gather

## 环境快照

```bash
env | grep -E 'NCCL|CUDA|MASTER|WORLD|RANK' | sort
nvidia-smi topo -m
ibstat || true
ibv_devices || true
```

## NCCL tests 的定位

NCCL tests 用于测 collective 的带宽和延迟，尤其适合多节点 all-reduce、all-gather、reduce-scatter 对比。[8][9]

## 构建或确认 nccl-tests

```bash
cd /path/to/nccl-tests
make MPI=1 CUDA_HOME=/usr/local/cuda NCCL_HOME=/usr
```

## 单节点基线

```bash
./build/all_reduce_perf -b 8 -e 8G -f 2 -g 8 2>&1 | tee /nas_train/tc/output/nccl_single_node.log
```

## 多节点 all-reduce 基线

`nccl-tests` 文档给出了 MPI 多进程多节点用法。[8]

```bash
mpirun -np 32 -N 8 ./build/all_reduce_perf -b 8 -e 8G -f 2 -g 1 \
  2>&1 | tee /nas_train/tc/output/nccl_multinode_allreduce.log
```

如果你使用调度器，按集群启动器改写，但保留一进程一卡。

## 推荐 sweep

```bash
for test in all_reduce_perf reduce_scatter_perf all_gather_perf; do
  mpirun -np 32 -N 8 ./build/${test} -b 8 -e 8G -f 2 -g 1 \
    2>&1 | tee "/nas_train/tc/output/${test}_32gpus.log"
done
```

## 如何看结果

重点看：

- 大消息尺寸下的 `busbw`
- 小消息尺寸下的 `time`
- 多节点时不同 collective 之间的差异

`busbw` 是 nccl-tests 用来衡量硬件利用程度的重要列。[9]

## 与训练 trace 联动

如果 nccl-tests 已经慢：

- 优先查网络和 HCA 绑定
- 不要急着改训练参数

如果 nccl-tests 正常但训练慢：

- 更可能是训练图里的 collective 频率、bucket、ZeRO、PP、SP、host launch 或数据问题

## 训练时的通信侧观察

```bash
export NCCL_DEBUG=INFO
export NCCL_DEBUG_SUBSYS=COLL,GRAPH
```

只在短跑窗口里开，避免日志爆炸。

## 常见归因

### all-reduce 慢，但单节点正常

优先怀疑：

- IB 路径或 HCA 绑定
- `NCCL_SOCKET_IFNAME` 配错
- 跨节点链路退化

### reduce-scatter 与 all-gather 都慢

优先怀疑：

- ZeRO3 相关通信压力
- 多节点切分策略过重

### 只有训练慢，nccl-tests 正常

优先怀疑：

- 计算与通信重叠不足
- 每步 collective 次数过多
- 某些 rank 成为 straggler

## 交付模板

- 测试命令
- 节点数与 GPU 数
- all_reduce / reduce_scatter / all_gather 三份日志
- 大消息区间的 `busbw`
- 训练 tokens/s 与 step time

## 参考

- [8] NCCL tests 项目：多节点 MPI 用法与参数
- [9] NCCL tests PERFORMANCE：`busbw` 含义与解读
- [10] NVIDIA 多节点 tuning guide：NCCL tests 用于多节点测量
