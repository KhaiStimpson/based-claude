---
name: handoff
description: Compact continuation-state workflow for long tasks, interruptions, delegation, compaction survival, and cross-session resumes.
when_to_use: Use when work pauses, context is about to compact, another agent or session must continue, or the user asks to save progress state.
---

# Migrato Handoff

## Read First

- `../../references/handoff-template.md` — the action-state shape and rules.

## Load On Trigger

- `../../references/trace-schema.md` when the handoff should be accompanied by a trace entry.
- `../../references/system-contract.md` (Context Survival section) when compaction risk motivated the handoff.

## Workflow

1. Capture action state, not conversation: objective, owner/mode, scope, exclusions, files read/changed, decisions, evidence, validation, risks, next action.
2. Preserve exact paths, commands, outputs, and uncertainty. Mark inferred facts as inferred.
3. Print the handoff in chat; write it to `.migrato/handoffs/<slug>.md` only on request or when continuation crosses sessions: `node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-handoff.js" --write`.
4. Update `.migrato/state/current.md` when it exists, so the resume point is one file.
5. On resume, read the handoff before re-deriving anything from the repository.

## Rules

- Short enough for the next worker to act immediately.
- Blockers, replanning triggers, and skipped checks survive the handoff.
- No secrets, credentials, or raw transcript content.
