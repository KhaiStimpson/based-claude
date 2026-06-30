# State Contract

Based Claudista stores action state, not raw conversation.

## Runtime Paths

```text
.based-claudista/runs/
.based-claudista/traces/actions.jsonl
.based-claudista/memory/cards/
.based-claudista/improvements/
.based-claudista/handoffs/
.based-claudista/plans/
```

## Action State Fields

- objective
- status
- workflow mode
- actor and authority
- files read
- files changed
- commands
- decisions
- evidence
- validation
- risks
- blockers
- next action

## Rules

- Preserve paths, commands, invariant names, and artifact IDs.
- Avoid secrets, credentials, private keys, customer data, and raw transcripts.
- Use traces as evidence for drafts, not automatic promotion.
- Prune stale run state and keep history separate from current state.
