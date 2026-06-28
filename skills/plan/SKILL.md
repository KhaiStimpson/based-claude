---
name: plan
description: Create executable implementation plans for ambiguous, broad, risky, or research-backed software changes.
when_to_use: Use when the user asks for a plan, when requirements are ambiguous, or before broad changes involving architecture, memory, safety, validation, migration, or agent workflow behavior.
---

# Based Plan

Use this for planning without editing unless the user explicitly asks planning plus implementation.

## Read First

- `../../references/system-contract.md`

## Load On Trigger

- `../../references/planning-intake.md` when the request is ambiguous, broad, or likely to need user intent discovery.
- `../../references/research-basis.md` only when changing or reviewing agent workflow, memory, validation, safety, self-improvement, or orchestration policy.
- `../../references/role-map.md` only when the plan needs subagent roles.
- `../../references/delegation-policy.md` only when the plan may split ownership or intentionally keep broad/risky work direct.
- `../../references/validation-ladder.md` before defining validation gates.

## Guided Intake

Use `/based-claude:plan <goal>` as the easy entrypoint. Do not create or route to a separate grill-me command.

For underspecified work, ask up to three initial questions only when they clarify intent, success criteria, hard constraints, audience, or scope. Then inspect local instructions, manifests, docs, tests, schemas, and likely implementation surfaces before asking follow-up questions. Ask follow-ups only when exploration reveals a decision that changes implementation, validation, risk, or approval boundaries.

If the user gave enough detail for a conservative plan, skip intake questions and proceed. Do not ask for facts that can be discovered from the repository.

## Planning Contract

1. Restate the objective and user-visible outcome.
2. Identify constraints, protected surfaces, assumptions, and approval boundaries.
3. Inspect just enough repository context to make the plan executable.
4. Split work into sequenced steps with concrete files, commands, and validation gates.
5. Include risks, stop conditions, and likely rejection modes.
6. Prefer the smallest adequate topology and implementation surface.
7. State whether implementation should be direct or delegated, with compact rationale and return contracts for any delegated work.
8. Include a workflow trace step only when delegation is planned or broad/risky work stays direct.

## Output Shape

Use this structure:

```md
## Objective

## Scope

## Proposed Changes

## Validation

## Risks / Stop Conditions

## Next Actions
```

Ask at most one blocking question when the answer materially changes the design. Otherwise state assumptions and proceed with the most conservative plan.
