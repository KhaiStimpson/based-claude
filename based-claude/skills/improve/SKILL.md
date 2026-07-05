---
name: improve
description: Generate, evaluate, and promote approved self-improvement proposals from validated traces, repeated failures, or explicit user requests.
when_to_use: Use when the user asks to improve the agent system, automate learning, revise skills, add memory-driven behavior, or turn validated traces into reusable workflow changes.
---

# Based Improve

Self-improvement is proposal-driven and reversible.

## Read First

- `../../references/self-improvement-protocol.md`

## Load On Trigger

- `../../references/trace-schema.md` when mining or writing trace evidence.
- `../../references/validation-ladder.md` before evaluating an improvement.
- `../../references/safety-policy.md` when the target affects executable scripts, tool permissions, memory, evaluators, or trust boundaries.
- `../../references/research-basis.md` only when changing or reviewing workflow, memory, safety, validation, or self-improvement architecture.

## Workflow

1. Gather evidence from traces, validation results, repeated user corrections, or explicit user requests.
2. Draft a proposal with problem, evidence, target, proposed change, validation plan, rollback, and retirement condition.
3. Evaluate with deterministic checks where possible.
4. Require independent review for evaluator, safety, memory policy, or executable-script changes.
5. Promote only with approval.
6. Implement accepted proposals as ordinary scoped code changes, then validate again.

## Helpers

Invoke as `node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" <action> [args]` so the command resolves regardless of install location.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" suggest --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" propose --title "..." --problem "..." --change "..." --evidence "..." --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" evaluate proposal-slug --command "npm run check" --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" review proposal-slug --verdict approve --evidence "..." --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" promote proposal-slug --approved
```

Do not silently edit skills, prompts, scripts, validators, or safety policy from a trace alone.
