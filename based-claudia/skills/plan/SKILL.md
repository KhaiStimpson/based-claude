---
name: plan
description: Create a progressive plan artifact for broad, risky, ambiguous, or long-running work.
when_to_use: Use when the user asks for a plan, when scope is broad, or before changes involving architecture, migration, safety, memory, validation, or workflow policy.
---

# Plan

## Read First

- `../../references/system-contract.md`
- `../../references/artifact-spine.md`

## Load On Trigger

- `../../references/research-basis.md` when architecture, validation, memory, safety, or workflow choices matter.
- `../../references/validation-ladder.md` before defining validation gates.
- `../../references/safety-policy.md` when trust boundaries or external systems are involved.

## Workflow

1. Restate objective, outcome, scope, constraints, assumptions, and approval boundary.
2. Inspect enough repository context to make the plan executable.
3. Ask at most one blocking question if the answer changes implementation, validation, risk, or approval boundaries.
4. Use `based-claudia plan write --title "<short title>" --objective "<objective>"` when a durable plan is useful.
5. Keep `plan.md` compact and put detail in linked files.
6. End with the `plan.md` path and the first implementation action.

Do not edit project source files during planning unless the user explicitly asks for planning plus implementation.
