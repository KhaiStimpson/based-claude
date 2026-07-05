---
name: plan
description: Bounded planning workflow for ambiguous, broad, risky, or architecture-heavy changes, with opt-in persistent plan bundles.
when_to_use: Use when the user asks to plan first, requirements are ambiguous, or implementation would be brittle without an executable plan. Add "plan files" or "save the plan" for a .claudius/plans bundle.
---

# Claudius Plan

## Read First

- `../../references/planning.md` — intake protocol, plan acceptance criteria, artifact contract.

## Load On Trigger

- `../../references/validation-ladder.md` when defining the plan's validation gates.
- `../../references/safety-policy.md` when the planned work crosses trust boundaries.
- `../../references/loop-readiness.md` when planning recurring or autonomous work.
- `../../references/model-contract.md` when model or effort assumptions shape the plan.

## Workflow

1. Lock objective, user-visible outcome, and explicit constraints. Ask at most three structured questions, only for decisions that change implementation, validation, risk, or approval boundaries.
2. Inspect instructions, manifests, tests, schemas, and likely surfaces before asking about anything discoverable.
3. Produce the plan: scope, sequence, likely files, validation, risks, stop conditions, assumptions, human gates, and whether work stays direct or delegates.
4. Write a `.claudius/plans/<slug>/` bundle only when explicitly requested — `node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-plan.js" --write` scaffolds it; otherwise deliver the plan in chat.
5. Hand off to implementation unless only a plan was requested.

## Completion Bar

A complete plan can be executed by an implementer who never saw this conversation.
