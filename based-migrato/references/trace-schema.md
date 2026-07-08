# Trace Schema

Based Migrato uses compact action-state traces so memory and self-improvement can inspect validated work without replaying full transcripts.

Default path:

```text
.migrato/traces/actions.jsonl
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
  "actor": "based-migrato",
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
  "contribution": "",
  "judge_independent": null,
  "escalation_path": "",
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
- Set `judge_independent` and `escalation_path` when the trace records a semantic or judge-based evaluation (see `validation-ladder.md` Evaluation Record); leave them unset for deterministic checks.
- Do not place secrets, credentials, private keys, or sensitive private data in traces.
- Treat traces as evidence with limits. A trace can justify a draft, not automatic promotion.

## Contribution Labels

For long-horizon or loop work, `contribution` classifies what an action did for the objective:

- `decisive_progress`: directly advanced the objective.
- `useful_exploration`: narrowed uncertainty or found important evidence.
- `no_progress_infrastructure`: maintained state or setup without advancing the objective.
- `regression`: made the state worse, invalidated evidence, or violated a boundary.

These labels make loop reviews and improvement mining cheap: a run dominated by `no_progress_infrastructure` is a routing problem even when every step "succeeded".

## Helper

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-trace.js" append --objective "..." --event validation --summary "..." --validation pass --commands "npm run check"
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-trace.js" append --objective "..." --event workflow --summary "mode=direct owner=migrato-developer delegates=none" --decisions "broad but single context"
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-trace.js" append --objective "..." --event review --summary "broad discovery complete" --review-stage discovery --effort high
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-trace.js" summarize
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-trace.js" list --limit 10
```
