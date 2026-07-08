# Based Migrato Fixtures

Scenario fixtures for the guarantees this plugin claims. Two kinds of guarantee live here:

- **Deterministic (bin behavior).** Provable with code and covered by `bin/*.test.js`
  (`npm test`). Each case names the exact test file that proves it.
- **Prompt-level (workflow routing).** Not mechanically provable without a live model
  session. Each case documents the scenario, the expected behavior, and the contract file
  it traces back to, for a human or an LLM-driven review pass to walk through when
  agent/skill prompts change.

| Case | Kind | Proof |
| --- | --- | --- |
| [migration-horizontal-slicing](migration-horizontal-slicing/README.md) | prompt-level | manual/LLM review against `references/migration.md` |
| [no-unsolicited-writes](no-unsolicited-writes/README.md) | mixed | `bin/migrato-plan.test.js`, `bin/migrato-memory.test.js` (write gates) + prompt review |
| [memory-governance-gates](memory-governance-gates/README.md) | deterministic | `bin/migrato-memory.test.js` |
| [improvement-review-gate](improvement-review-gate/README.md) | deterministic | `bin/migrato-improve.test.js` |
| [slop-lint-behavior](slop-lint-behavior/README.md) | deterministic | `bin/migrato-slop-check.test.js` |
| [code-style-review-gate](code-style-review-gate/README.md) | prompt-level | manual/LLM review against `references/code-style.md` |
| [single-owner-routing](single-owner-routing/README.md) | prompt-level | manual/LLM review against `references/delegation-policy.md` |
| [skill-radar-gating](skill-radar-gating/README.md) | prompt-level | manual/LLM review against `references/self-improvement.md` |
