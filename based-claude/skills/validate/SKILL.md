---
name: validate
description: Select and run deterministic validation for code, docs, plugins, scripts, memory cards, and agent workflows.
when_to_use: Use when the user asks to validate, test, verify, run checks, inspect plugin structure, or provide evidence that a change works.
---

# Based Validate

Use the smallest check that can falsify the changed behavior, then broaden when warranted.

## Read First

- `../../references/validation-ladder.md`

## Load On Trigger

- `../../references/project-scan-schema.md` when discovering project shape or validation candidates.
- `../../references/system-contract.md` when validation covers implementation, plugins, memory, safety, or workflow behavior.
- `../../references/loop-readiness.md` when validating recurring, scheduled, autonomous, or long-running agent work.
- `../../references/tool-adapter-safety.md` when validating MCP servers, hooks, CLIs, live app bridges, or external tool adapters.

## Workflow

1. Identify the changed behavior and the expected invariant.
2. Discover local validation commands from manifests and scripts.
3. Prefer repository-defined checks over generic commands.
4. Run syntax/schema checks first.
5. Run focused behavior checks.
6. Broaden to build, typecheck, lint, smoke, plugin validator, or integration checks when risk requires it.
7. For loops, validate against the loop-readiness contract; for tool adapters, against the tool-adapter-safety controls.
8. Record command, cwd, result, important output, and what remains unproven.

## Useful Helpers

- `based-doctor` for project shape and validation candidates.
- `based-quality-gate` for suggested commands.
- `based-quality-gate --run` to run conservative candidates.
- `based-quality-gate --run --allow-shell` only after reviewing commands that need shell syntax.
- `based-plugin-check` inside a Based Claude plugin folder.

Do not edit files in validation mode unless the user explicitly asks for repair.
