---
name: plan
description: Create executable implementation plans for ambiguous, broad, risky, or research-backed software changes.
when_to_use: Use when the user asks for a plan, when requirements are ambiguous, or before broad changes involving architecture, memory, safety, validation, migration, or agent workflow behavior.
---

# Based Plan

Chat-only planning. Do not edit files unless the user explicitly asks for planning plus implementation. If the user wants saved markdown plan files or a developer bundle, use `/based-claude:plan-file` instead.

## Read First

- `../../references/system-contract.md` if not already operating under it.

## Load On Trigger

- `../../references/planning-intake.md` when the request is ambiguous, broad, or needs user intent discovery — it defines the question policy.
- `../../references/validation-ladder.md` before defining validation gates.
- `../../references/model-migration.md` when planning model routing, effort/token budgets, long agentic work, tool-heavy workflows, or review harnesses.
- `../../references/delegation-policy.md` when the plan may split ownership or intentionally keep broad/risky work direct.
- `../../references/loop-readiness.md` for recurring, scheduled, autonomous, or long-running agent work.
- `../../references/tool-adapter-safety.md` for MCP servers, hooks, CLIs, live app bridges, or external tool adapters.
- `../../references/research-basis.md` when changing workflow, memory, safety, validation, or self-improvement policy.

## Intake

Follow `planning-intake.md`: up to three initial questions only when the request is underspecified, repository inspection before follow-ups, then at most one blocking question when the answer materially changes design. If the user gave enough for a conservative plan, skip questions and state assumptions.

## Planning Contract

1. Restate the objective and user-visible outcome.
2. Identify constraints, protected surfaces, assumptions, and approval boundaries.
3. Inspect just enough repository context to make the plan executable.
4. Split work into sequenced steps with concrete files, commands, and validation gates.
5. Include risks, stop conditions, and likely rejection modes.
6. Prefer the smallest adequate topology; state whether implementation should be direct or delegated, with compact rationale and return contracts for delegated work.
7. For recurring/autonomous workflows, apply the loop-readiness contract. For live tool adapters, apply the tool-adapter-safety controls.

## Output Shape

```md
## Objective

## Scope

## Proposed Changes

## Validation

## Risks / Stop Conditions

## Next Actions
```
