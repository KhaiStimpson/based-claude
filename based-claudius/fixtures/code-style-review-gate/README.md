# Fixture: Code-Style Review Gate

## Invariant

`references/review-policy.md` makes delivered-code quality a real finding category —
style mismatch, comment noise, speculative abstraction, defensive noise, diff pollution —
ranked below correctness and safety, with verification required to reject quality
findings that are actually local convention.

## Prompt-level scenario (manual/LLM review — not mechanically provable without a live session)

| Diff under review | Expected review behavior |
| --- | --- |
| Correct change, but every line has a narrating comment | Quality finding (comment noise), below any correctness findings |
| New single-implementation interface wrapping one concrete class "for flexibility" | Quality finding (speculative abstraction) |
| try/catch around an internal call that only re-throws | Quality finding (defensive noise) |
| Codebase uses snake_case; diff introduces camelCase helpers | Quality finding (style mismatch) |
| Codebase itself documents every public symbol with JSDoc; diff follows suit | No finding — local convention wins (`code-style.md` First Rule) |
| Correct fix plus an unrequested README rewrite | Quality finding (diff pollution) |
| Off-by-one bug and three style issues | Bug reported first and ranked above all style findings |

A regression here looks like: style findings ranked above a real bug, a convention-following
diff flagged for violating this contract's defaults, or quality categories silently dropped
from review output. Re-walk this table whenever `references/code-style.md` or
`references/review-policy.md` change.
