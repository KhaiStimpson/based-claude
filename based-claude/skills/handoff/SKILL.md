---
name: handoff
description: Create compact action-state handoffs for long tasks, delegation, interruptions, or continuation across sessions.
when_to_use: Use when work is long-running, paused, delegated, context is being compacted, or another agent/user needs to continue from current state.
---

# Based Handoff

Use structured action state instead of raw transcript replay.

## Read First

- `../../references/handoff-template.md`

## Workflow

1. State objective and current owner/mode.
2. List instruction contracts and approval boundaries.
3. Record current state, files read, files changed, decisions, and evidence.
4. Record validation run and skipped checks.
5. Preserve risks, privacy notes, tool-trust notes, and state invariants.
6. End with the exact next action.

## Helper

Use:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/based-handoff.js"
node "${CLAUDE_PLUGIN_ROOT}/bin/based-handoff.js" --write
```

Keep the handoff short enough for the next worker to act immediately.

