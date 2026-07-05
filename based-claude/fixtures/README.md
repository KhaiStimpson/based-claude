# Based Claude Fixtures

Scenario fixtures for the guarantees this plugin claims, per the prior harness-engineering
recommendation (`wiki/plans/claude-plugin-harness-engineering-recommendations.md`, rec #4)
and the current improvement plan (`wiki/plans/based-claude-plugin-improvement-plan.md`, P4).

Two kinds of guarantee live here:

- **Deterministic (bin behavior).** Provable with code and covered by `bin/*.test.js`
  (`npm test`). Each case below names the exact test file/case that proves it.
- **Prompt-level (workflow routing).** Not mechanically provable without a live model
  session. Each case documents the scenario, the expected routing decision, and the
  contract file it should trace back to, for a human or an LLM-driven review pass to
  walk through when agent/skill prompts change.

| Case | Kind | Proof |
| --- | --- | --- |
| [no-unsolicited-writes](no-unsolicited-writes/README.md) | mixed | `bin/based-plan.test.js`, `bin/based-memory.test.js` (write gates) + prompt review |
| [memory-governance-gates](memory-governance-gates/README.md) | deterministic | `bin/based-memory.test.js` |
| [improvement-review-gate](improvement-review-gate/README.md) | deterministic | `bin/based-improve.test.js` |
| [safety-trigger-coverage](safety-trigger-coverage/README.md) | prompt-level | manual/LLM review against `references/safety-policy.md` |
| [single-owner-routing](single-owner-routing/README.md) | prompt-level | manual/LLM review against `references/delegation-policy.md` |
