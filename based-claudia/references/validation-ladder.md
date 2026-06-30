# Validation Ladder

Use the smallest check that can genuinely falsify the changed behavior, then broaden when risk or surface area requires it.

1. Syntax and schema.
   - JSON parse, YAML/frontmatter shape, script syntax, config shape, import checks.

2. Focused behavior.
   - Unit tests, targeted smoke tests, CLI dry runs, migration dry runs, fixture checks.

3. Integration.
   - Build, typecheck, lint, package scripts, app smoke tests, plugin validator, workflow dry run.

4. Process checks.
   - Instruction-contract compliance, protected surfaces, no weakened tests or evaluators, auditability, artifact completeness.

5. Latent-failure checks.
   - State transitions, rollback, stale artifacts, isolation, downstream invariants, hidden coupling, idempotence.

6. Independent review.
   - Required for broad, risky, security-sensitive, evaluator-changing, or durable-memory-changing work.

Record command, working directory, result, important output, environment assumptions, attempts, what the check proves, and what remains unproven.
