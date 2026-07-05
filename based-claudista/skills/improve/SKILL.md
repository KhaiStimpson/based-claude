---
name: improve
description: Trace-derived self-improvement workflow for proposing reusable changes to skills, scripts, policies, memory, or validation.
when_to_use: Use when the user asks the plugin to learn from validated work or improve the workflow itself.
---

# Based Claudista Improve

## Read First

- `../../references/self-improvement.md`
- `../../references/state-contract.md`

## Workflow

1. Start from validated trace evidence, not impressions.
2. Draft a proposal with target surface, before evidence, expected benefit, validation plan, risk, rollback, and retirement condition.
3. Require independent review for evaluator, safety, memory-policy, executable script, hook, MCP, or trust-boundary changes.
4. Promote only after approval and validation.

Use `node "${CLAUDE_PLUGIN_ROOT}/bin/claudista-improve.js" suggest` to create a proposal artifact when useful.
