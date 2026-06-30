---
name: handoff
description: Create compact action-state handoffs for continuation, delegation, interruption, or context compaction.
when_to_use: Use when work is paused, long-running, delegated, or another worker needs to continue from current state.
---

# Handoff

## Read First

- `../../references/handoff-template.md`
- `../../references/artifact-spine.md`

## Workflow

1. State objective and current owner or mode.
2. List instruction contracts and approval boundaries.
3. Record active artifacts, files read, files changed, decisions, and evidence.
4. Record validation run and skipped checks.
5. Preserve risks, privacy notes, tool-trust notes, and state invariants.
6. Write with `based-claudia handoff write --title "<title>"` when durable continuation state is useful.
7. End with the exact next action.

Keep the handoff short enough for the next worker to act immediately.
