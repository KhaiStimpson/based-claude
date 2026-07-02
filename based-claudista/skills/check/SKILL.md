---
name: check
description: Validation and review workflow for current work, diffs, plugins, scripts, memory, and workflow artifacts.
when_to_use: Use when the user asks to validate, review, audit, run checks, inspect a diff, or decide if work is ready.
---

# Based Claudista Check

## Read First

- `../../references/validation-ladder.md`
- `../../references/system-contract.md` only when not already operating under the claudista-developer contract.

## Workflow

1. Identify the behavior, artifact, or diff under review.
2. Prefer deterministic syntax, schema, unit, build, test, and smoke checks before semantic judgment.
3. For reviews, inspect objective, diff, tests, validation output, and instruction contracts.
4. For plugins, scripts, hooks, tools, memory, and evaluators, include process and safety checks.
5. Report findings first. If no findings, state that clearly and name residual risk.

Use `node based-claudista/bin/claudista-quality-gate.js` to discover validation candidates when useful.
