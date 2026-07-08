---
name: improve
description: Gated self-improvement workflow that turns validated traces, repeated failures, and skill-radar signals into reviewed proposals.
when_to_use: Use when the user asks the plugin to learn from validated work, act on a skill-radar signal, or improve its own workflow, skills, or scripts.
---

# Migrato Improve

## Read First

- `../../references/self-improvement.md` — protocol, skill radar, proposal fields, rejection modes.

## Load On Trigger

- `../../references/trace-schema.md` when mining traces for evidence.
- `../../references/validation-ladder.md` when designing a proposal's evaluation.
- `../../references/loop-readiness.md` before recommending the optional scheduled radar.

## Workflow

1. Gather evidence: validated traces, repeated failures, explicit corrections, or a named skill-radar signal. `node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-improve.js" suggest` lists candidates from local records.
2. Check for an existing skill, reference, or accepted proposal covering the same problem; extend or supersede instead of duplicating.
3. Draft the proposal with problem, evidence, target artifact, change, validation plan, rollback, and retirement condition: `... propose ... --write`.
4. Evaluate against a held-out check or fixture and record pass/fail: `... evaluate <slug> --command "..." --write`.
5. Obtain review — independent for evaluator, rubric, or safety changes: `... review <slug> --verdict ... --write`.
6. Promotion records acceptance only: `... promote <slug> --approved`. Implementation remains a separate, normal code change with validation and review.

## Rules

- No silent creation of skills, hooks, memory, or automation.
- Rejected proposals stay on record for future evidence; do not delete them.
- A proposal that weakens any evaluator or safety surface is rejected regardless of benefit.
