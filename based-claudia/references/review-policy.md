# Review Policy

Review starts from objective, diff or touched surface, tests, validation, and contracts. Do not rely on the implementer's reasoning transcript as primary evidence.

## Check For

- Bugs and behavior regressions.
- Missing or weakened tests.
- Unsafe action paths.
- Hidden state failures.
- Stale artifacts or memory.
- Evaluator or rubric drift.
- Unsupported assumptions.
- Avoidable complexity.

## Output

Use three passes for broad or risky work:

1. Discovery: collect plausible bugs, regressions, unsafe paths, missing tests, stale artifacts, evaluator drift, and contract mismatches with evidence and confidence.
2. Verification: deduplicate, reject unsupported items, classify severity, and check validation relevance.
3. Reporting: findings first, ordered by severity. Include file paths, commands, evidence, residual risk, and clear next action.

Avoid "only high severity" filters during discovery, because literal review prompts can suppress real lower-severity defects.
