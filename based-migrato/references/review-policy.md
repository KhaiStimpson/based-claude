# Review Policy

Use this when reviewing diffs, touched surfaces, or broad/risky/evaluator-changing work. For a quick correctness pass on a small diff, Claude Code's native `/code-review` suffices; use this policy when contracts, workflow files, evaluators, safety surfaces, or delivered-code quality are in scope — or as the verification layer on top of a native discovery pass.

## Review Boundary

A fresh reviewer starts from:

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

## Finding Categories

Correctness and safety first:

- Bugs, regressions, broken invariants, hidden state failures.
- Missing or weakened tests; oracles that cannot fail.
- Unsafe action paths, trust-boundary violations, evaluator drift.
- Contract mismatches with schemas, instructions, or public behavior.

Then delivered-code quality per `code-style.md`:

- Style mismatch: the change ignores local naming, error posture, or module conventions.
- Comment noise: narration, restated signatures, section banners, TODO/placeholder debris.
- Speculative abstraction: single-implementation interfaces, unused flexibility, one-caller helpers without a domain name.
- Defensive noise: guards for impossible states, catch-and-rethrow wrappers, redundant validation of trusted internals.
- Diff pollution: formatting churn, unrequested doc edits, scaffold remnants, debug output.

Quality findings are real findings — report them with the same evidence discipline, ranked below correctness and safety.

## Output Discipline

For broad reviews, preserve recall before filtering:

1. Discovery: collect every plausible issue with evidence, confidence, and affected surface.
2. Verification: deduplicate, reject unsupported items, classify severity, and check validation relevance.
3. Reporting: findings come first, ordered by severity. If there are no findings, name residual risk and the strongest evidence inspected.

Do not use "only high severity" wording until after discovery, because literal review prompts can hide real lower-severity defects. Reviewers over-report on quality categories more than correctness ones; verification must reject quality findings that are actually local convention.
