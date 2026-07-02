---
name: plan-file
description: Create a progressive markdown plan bundle for developer implementation handoff.
when_to_use: Use when the user invokes /based-claude:plan-file or explicitly asks to save a plan, write markdown plan files, create a plan bundle, or feed a plan to developers.
---

# Based Plan File

File-writing variant of `/based-claude:plan`: same planning contract, intake policy, and Load On Trigger references as that skill — only the output mode changes.

## Read First

- `../../references/plan-artifact.md`

## Workflow

1. Treat `/based-claude:plan-file <goal>` as explicit permission to write only the plan artifact bundle.
2. Plan per the `/based-claude:plan` contract (intake, repository inspection, at most one blocking question).
3. Create `.based/plans/<slug>/` with a compact `plan.md` index and linked detail files. `based-plan --write --title "<short title>"` can scaffold; then fill with task-specific content.
4. End with the generated `plan.md` path and the next developer action.

## Bundle Contract

`plan.md` (short entrypoint) plus `context.md`, `tasks.md`, `validation.md`, `risks.md`, `handoff.md`. Keep `plan.md` readable first; put detail in linked files; no raw transcript replay.

## Boundaries

- Do not edit project source files in plan-file mode.
- Do not write outside `.based/plans/**` unless the user names a different destination.
- Do not create plan files for small tasks unless requested.
- If writing is unavailable, print the intended file tree and markdown content.
