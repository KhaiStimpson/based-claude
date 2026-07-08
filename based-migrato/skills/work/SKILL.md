---
name: work
description: Main Based Migrato router for implementation, repair, validation, review, planning, safety, and everyday software work.
when_to_use: Use for ordinary software work when the user asks to implement, modify, fix, debug, scaffold, automate, or deliver a change and wants the smallest adequate workflow chosen automatically.
---

# Migrato Work

## Read First

- `../../references/system-contract.md` — router phases, standard routes, action boundary — only when not already operating under the migrato-developer contract.

## Load On Trigger

- `../../references/code-style.md` before writing or editing code in an unfamiliar codebase.
- `../../references/validation-ladder.md` before selecting or reporting validation.
- `../../references/delegation-policy.md` when task shape is broad, ambiguous, failing, or likely to need context isolation.
- `../../references/diagnostic-ledger.md` when the task is a failure, regression, or CI break.
- `../../references/safety-policy.md` when the task touches credentials, deletion, deployment, external systems, hooks, MCP, or durable memory.
- `../../references/model-contract.md` when effort, token headroom, literal scope, or tool-use behavior may affect the task.
- `../../references/loop-readiness.md` for recurring or autonomous work.
- `../../references/handoff-template.md` for long tasks, delegation, or continuation.

## Workflow

1. Establish objective, user-visible outcome, constraints, protected surfaces, approval boundary, and smallest meaningful validation.
2. Route through the phases: `discover -> [plan] -> act -> verify -> review`, adding the safety gate before `act` for trust-boundary work and repair mode with a ledger for failures.
3. Retrieve context progressively; open only files that change the decision.
4. Implement the smallest scoped change in the local idiom; no unrelated refactors, no AI-tell debris.
5. Validate deterministically, then review the touched surface — correctness and safety first, then code-style tells.
6. Record a compact trace when work is broad, delegated, risky, or a candidate for memory or improvement.
7. Report changed behavior, validation evidence, and residual risk. Name any skill-radar signal observed.

## Completion Bar

Finish through validation and review unless blocked by missing user intent, required approval, unavailable tools, or a protected boundary. Do not stop at a plan when implementation was requested.
