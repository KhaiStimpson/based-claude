---
name: implement
description: Implement scoped software, docs, tooling, plugin, or workflow changes from current state or a plan artifact.
when_to_use: Use when the user asks to implement, modify, fix, scaffold, automate, or deliver a concrete change.
---

# Implement

## Read First

- `../../references/system-contract.md` only when not already operating under the claudia-developer contract.

## Load On Trigger

- `../../references/validation-ladder.md` before selecting validation.
- `../../references/safety-policy.md` when tools, scripts, credentials, plugins, memory, or external systems are involved.
- `../../references/review-policy.md` before final review on broad or risky diffs.

## Workflow

1. Read `.based/state/current.md` if present.
2. If a `.based/plans/.../plan.md` path is provided, read it first and open linked detail files only as needed.
3. Inspect local instructions, manifests, likely implementation files, tests, and schemas.
4. Implement the smallest scoped change that satisfies the contract.
5. Validate with deterministic checks.
6. Review the touched surface.
7. Record validation or trace artifacts when the work is broad, risky, delegated, or likely to continue.

Do not weaken tests, validators, rubrics, safety checks, or policies to make work pass.
