# Validation Ladder

Use the smallest check that can falsify the changed behavior, then broaden as risk grows.

1. Syntax and schema: JSON parse, YAML/frontmatter shape, script syntax, config shape, import checks.
2. Focused behavior: unit tests, targeted smoke tests, CLI dry runs, fixture checks.
3. Integration: build, typecheck, lint, package scripts, plugin validation, workflow dry run.
4. Process checks: instruction contracts, protected surfaces, no weakened tests or evaluators, auditability, handoff completeness.
5. Latent-failure checks: state transitions, rollback, stale memory, isolation, downstream invariants, idempotence.
6. Independent review: required for broad, risky, security-sensitive, evaluator-changing, or durable-memory-changing work.

Record command, working directory, result, important output, environment assumptions, attempts, what the check proves, and what remains unproven.
