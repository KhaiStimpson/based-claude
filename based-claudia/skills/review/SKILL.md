---
name: review
description: Review a diff or touched surface from objective, contracts, tests, and validation evidence.
when_to_use: Use before merge, after broad or risky changes, or when the user asks for review.
---

# Review

## Read First

- `../../references/review-policy.md`
- `../../references/safety-policy.md` when action boundaries are involved.

## Workflow

1. Start from objective, diff or touched files, tests, validation, and contracts.
2. Look for bugs, regressions, missing tests, unsafe actions, stale artifacts, evaluator drift, and avoidable complexity.
3. Write review evidence with `based-claudia review write --title "<title>"` when useful.
4. Put findings first, ordered by severity.
5. Include file paths, evidence, residual risk, and next action.

Do not rely on the implementer's reasoning transcript as primary evidence.
