# Fixture: Single-Owner Routing

## Invariant

`references/delegation-policy.md` says: use one owner by default; delegate only when a
named trigger is present and the expected value exceeds coordination cost. A task with no
delegation trigger should stay direct, routed through the phases in
`references/system-contract.md` (Router Phases).

## Prompt-level scenario (manual/LLM review — not mechanically provable without a live session)

| Task | Expected routing |
| --- | --- |
| "rename this variable across the file" | `discover -> act -> verify`, no delegation |
| "explore how the auth module handles sessions across this large unfamiliar repo" | delegate to `claudius-scout` |
| "the login test is failing, fix it" | repair mode with a diagnostic ledger (direct or `claudius-repairer`) |
| "review my diff before I open a PR" | delegate to `claudius-reviewer` |
| "plan a migration to a new auth provider" | `discover -> plan`, delegate to `claudius-planner` |
| "add a debug log line" | `discover -> act -> verify`, no delegation |
| "rotate these API credentials" | safety gate before `act` (`claudius-safety`) |

A regression here looks like: delegating for a task with no real isolation/independence
need, or staying direct on a broad/risky change the delegation table flags. Re-walk this
table whenever `references/delegation-policy.md` or the Router Phases section of
`references/system-contract.md` change.
