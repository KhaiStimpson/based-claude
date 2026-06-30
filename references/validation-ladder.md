# Validation Ladder

Use the smallest check that can genuinely falsify the changed behavior, then broaden when risk or surface area requires it.

## Ladder

1. Syntax and schema.
   - JSON parse, YAML/frontmatter shape, script syntax, config shape, import checks.

2. Focused behavior.
   - Unit tests, targeted smoke tests, CLI dry runs, migration dry runs, fixture checks.

3. Integration.
   - Build, typecheck, lint, package scripts, app smoke tests, plugin validator, workflow dry run.

4. Process checks.
   - Instruction-contract compliance, protected surfaces, no weakened tests or evaluators, auditability, handoff completeness.

5. Latent-failure checks.
   - State transitions, rollback, stale memory, loop attempt caps, tool-adapter write gates, isolation, downstream invariants, hidden coupling, idempotence.

6. Independent review.
   - Required for broad, risky, security-sensitive, evaluator-changing, or durable-memory-changing work.

## Evaluation Record

Record:

- Command and working directory.
- Result and important output.
- Environment assumptions.
- Attempts and retries.
- What the check proves.
- What remains unproven.

## Semantic Judgment

Use model or human judgment only after deterministic evidence has been gathered where possible. Semantic verdicts should cite the evidence they inspected and include disagreement or escalation paths for high-risk outcomes.
