# Trace Schema

Based Claude uses compact action-state traces so memory and self-improvement can inspect validated work without replaying full transcripts.

Default path:

```text
.based/traces/actions.jsonl
```

Each line is JSON:

```json
{
  "id": "trace-...",
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "taskId": "",
  "event": "note | workflow | plan | edit | validation | repair | review | safety | handoff",
  "objective": "",
  "summary": "",
  "actor": "based-claude",
  "authority": "allow | warn | escalate | block",
  "files": [],
  "commands": [],
  "validation": "pass | fail | skipped |",
  "decisions": [],
  "evidence": [],
  "risks": [],
  "risk_class": "",
  "permission_basis": "",
  "tool_or_adapter": "",
  "preconditions": [],
  "postconditions": [],
  "sandbox": "",
  "sanitized_inputs": false,
  "rollback": "",
  "external_output_policy": "",
  "model_assumption": "",
  "effort": "",
  "token_headroom": "",
  "tool_trigger": "",
  "review_stage": "",
  "memoryCandidate": false,
  "improvementCandidate": false
}
```

## Rules

- Capture action state, not raw conversation.
- Preserve file paths, command names, validation results, and evidence IDs.
- Use `workflow` only for delegation decisions or broad/risky direct decisions.
- Mark memory and improvement candidates explicitly.
- Use optional risk, permission, adapter, model, effort, and review-stage fields when they explain a workflow decision or validation boundary.
- Do not place secrets, credentials, private keys, or sensitive private data in traces.
- Treat traces as evidence with limits. A trace can justify a draft, not automatic promotion.

## Helper

```bash
based-trace append --objective "..." --event validation --summary "..." --validation pass --commands "npm run check"
based-trace append --objective "..." --event workflow --summary "mode=plan-scout-implement delegates=based-scout" --decisions "context isolation before edits"
based-trace append --objective "..." --event review --summary "broad discovery complete" --review-stage discovery --effort high
based-trace summarize
based-trace list --limit 10
```
