---
name: plan
description: Bounded planning workflow for ambiguous, broad, risky, or architecture-heavy changes.
when_to_use: Use when the user asks to plan first or when implementation would be brittle without an executable plan.
---

# Based Claudista Plan

## Read First

- `../../references/state-contract.md`
- `../../core/policies/workflow-router.md` when choosing the workflow mode or delegation shape.
- `../../references/system-contract.md` only when not already operating under the claudista-developer contract.

## Load On Trigger

- `../../references/research-basis.md` when architecture, validation, memory, safety, or agent workflow choices matter.
- `../../references/loop-modes.md` for recurring or autonomous workflows.

## Plan Shape

Return:

- Objective and user-visible outcome.
- Scope, exclusions, protected surfaces, and approval boundary.
- Current evidence and unknowns.
- Proposed workflow mode and delegation rationale.
- Files or module surfaces likely involved.
- Task sequence.
- Validation gates in order.
- Rejection modes and mitigations.
- First concrete action.

Ask at most one blocking product question when the wrong assumption would be costly and the answer cannot be discovered locally.
