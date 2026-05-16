# Training Swarm Design

## Goal

Build a reusable training-performance swarm on top of the existing DeepSeek training skills so multiple specialized agents can cooperate during launch, profiling, debugging, and optimization.

## Recommended Architecture

Use a hub-and-spoke model.

- **Coordinator agent** owns stage detection, routing, artifact collection, and next-step control
- **Execution agent** owns launch, scaling, resume, and safe rollout changes
- **Profiling agent** owns traces, step-time breakdown, multi-node scaling evidence, and communication analysis
- **Troubleshooting agent** owns blocking failures, hangs, OOM, NCCL, unstable loss, and bad logs
- **Optimizer agent** owns experiment prioritization, KPI comparison, and one-change-at-a-time recommendations

This is better than a flat swarm because training work needs a single controller to avoid conflicting advice.

## Workflow

1. Coordinator classifies the current training state
2. Coordinator asks the right specialist to produce artifacts or actions
3. Specialists return findings in a shared schema
4. Optimizer converts findings into a ranked experiment plan
5. Coordinator advances one change at a time and re-checks KPIs

## Shared Contracts

Every agent should speak through the same fields:

- current_stage
- evidence
- suspected_bottleneck
- recommended_action
- risk
- verification
- next_handoff

This prevents execution, profiling, and debugging from talking past each other.

## Deliverables

- Swarm coordinator skill
- Optimizer skill
- Swarm references for role registry, handoff contract, iteration loop, and run scorecard
- Main training skill updated to advertise the swarm entrypoint
