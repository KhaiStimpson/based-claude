# Fixture: Single-Owner Routing

## Invariant

`references/delegation-policy.md` says: use one owner by default; delegate only when a
named trigger is present and the expected value exceeds coordination cost. A task with no
delegation trigger should stay `direct`.

## Prompt-level scenario (manual/LLM review — not mechanically provable without a live session)

| Task | Expected routing |
| --- | --- |
| "rename this variable across the file" | `direct`, no delegation |
| "explore how the auth module handles sessions across this large unfamiliar repo" | delegate to `based-scout` |
| "the login test is failing, fix it" | `diagnostic-repair` (direct or `based-repairer`), hypothesis ledger before edit |
| "review my diff before I open a PR" | delegate to `based-reviewer` |
| "plan a migration to a new auth provider" | delegate to `based-planner` |
| "add a debug log line" | `direct`, no delegation |

A regression here looks like: delegating for a task with no real isolation/independence
need, or staying direct on a broad/risky change the delegation table flags. Re-walk this
table whenever `references/delegation-policy.md` or `references/system-contract.md`'s
Dynamic Workflow Selection section change.
