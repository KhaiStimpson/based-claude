---
name: review
description: Review code, docs, scripts, plugins, or workflow changes for bugs, regressions, missing tests, safety risks, and unsupported assumptions.
when_to_use: Use when the user asks for review, pre-merge inspection, risk assessment, or a second pass over a diff or touched surface.
---

# Based Review

Default to a code-review stance. Findings lead the response.

## Read First

- `../../references/validation-ladder.md`
- `../../references/safety-policy.md` when scripts, tools, plugins, credentials, external systems, or durable state are involved.

## Load On Trigger

- `../../references/fresh-review.md` when reviewing broad, risky, autonomous, security-sensitive, or evaluator-changing work.
- `../../references/model-migration.md` when review recall, effort, token headroom, model upgrade behavior, or literal filtering language may affect findings.
- `../../references/loop-readiness.md` when reviewing recurring, scheduled, autonomous, or long-running agent work.
- `../../references/tool-adapter-safety.md` when reviewing MCP servers, hooks, CLIs, live app bridges, or external tool adapters.

## Review Priorities

1. Bugs, behavioral regressions, data loss, security flaws, unsafe tool paths.
2. Missing or weakened tests, validators, schemas, or rubrics.
3. Contract drift between docs, config, scripts, and implementation.
4. Hidden state failures: stale memory, implicit global state, partial migrations, non-idempotent scripts.
5. For broad or risky work, review from objective, diff, tests, validation, and contracts rather than the implementer's reasoning transcript.
6. Discover plausible findings before severity filtering, confidence ranking, deduplication, and final acceptance.
7. Low-value complexity only after correctness and safety are checked.

## Output

Use this order:

```md
## Findings
- Severity: file:line - issue, impact, suggested fix.

## Open Questions

## Validation Gaps

## Summary
```

If no issues are found, say so clearly and name residual risk.
