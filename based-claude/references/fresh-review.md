# Fresh Review

Use this when reviewing broad, risky, security-sensitive, autonomous, or evaluator-changing work.

## Review Boundary

A fresh reviewer should start from:

- User objective and explicit constraints.
- Diff or touched files.
- Tests, validation output, and logs.
- Relevant contracts, schemas, policies, and public behavior.

Do not rely on the implementer's reasoning transcript as the primary evidence. It can explain intent after findings, but the review should be able to reject the change from artifacts alone.

## Independence Rules

- The implementer does not approve their own work.
- The reviewer does not run repair edits during review mode.
- For generated tests, inspect whether they would fail on the pre-change bug.
- For validators or rubrics, require independent review before weakening or replacing them.
- For autonomous loops, verify attempt caps, state pruning, maker/checker split, human gates, and kill criteria.
- For tool adapters, verify action boundaries, write gates, proof-after-write, quarantine, and log/output sanitation.

## Output Discipline

For broad reviews, preserve recall before filtering:

1. Discovery: collect every plausible issue with evidence, confidence, and affected surface.
2. Verification: deduplicate, reject unsupported items, classify severity, and check validation relevance.
3. Reporting: findings come first, ordered by severity. If there are no findings, name residual risk and the strongest evidence inspected.

Do not use "only high severity" wording until after discovery, because literal review prompts can hide real lower-severity defects.
