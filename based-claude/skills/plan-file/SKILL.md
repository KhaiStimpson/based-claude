---
name: plan-file
description: Create a progressive markdown plan bundle for developer implementation handoff.
when_to_use: Use when the user invokes /based-claude:plan-file or explicitly asks to save a plan, write markdown plan files, create a plan bundle, or feed a plan to developers.
---

# Based Plan File

Use this as the opt-in file-writing version of `/based-claude:plan`. The planning contract is the same; only the output mode changes.

## Read First

- `../../references/system-contract.md`
- `../../references/plan-artifact.md`

## Load On Trigger

- `../../references/planning-intake.md` when the request is ambiguous, broad, or likely to need user intent discovery.
- `../../references/research-basis.md` only when changing or reviewing agent workflow, memory, validation, safety, self-improvement, or orchestration policy.
- `../../references/role-map.md` only when the plan needs subagent roles.
- `../../references/delegation-policy.md` only when the plan may split ownership or intentionally keep broad/risky work direct.
- `../../references/validation-ladder.md` before defining validation gates.
- `../../references/loop-readiness.md` when planning recurring, scheduled, autonomous, or long-running agent work.
- `../../references/tool-adapter-safety.md` when planning MCP servers, hooks, CLIs, live app bridges, or external tool adapters.

## Workflow

1. Treat `/based-claude:plan-file <goal>` as explicit permission to write only the plan artifact bundle.
2. Restate the objective, scope, constraints, protected surfaces, assumptions, and approval boundary.
3. Inspect just enough repository context to make the plan executable.
4. Ask at most one blocking question if the answer changes implementation, validation, risk, or approval boundaries.
5. Create `.based/plans/<slug>/` with a compact `plan.md` index and linked detail files.
6. Use `based-plan --write --title "<short title>"` as the scaffold helper when available, then fill or revise the files with task-specific content.
7. End with the generated `plan.md` path and the next developer action.

## Bundle Contract

The bundle must include:

- `plan.md`
- `context.md`
- `tasks.md`
- `validation.md`
- `risks.md`
- `handoff.md`

Keep `plan.md` short enough for the developer to read first. Put supporting detail in the linked files and avoid raw transcript replay.

## Boundaries

- Do not edit project source files during plan-file mode.
- Do not write outside `.based/plans/**` unless the user explicitly names a different destination.
- Do not create plan files for small tasks unless the user requested them.
- If writing is unavailable, print the intended file tree and markdown content.
