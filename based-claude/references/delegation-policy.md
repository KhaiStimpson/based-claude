# Delegation And Dynamic Workflow Policy

Use this inside the main agent's normal task setup. This is not a user-facing command.

Research evidence lives in `delegation-evidence.md`; read it only when changing or reviewing workflow policy.

## Default Rule

Use one owner by default. Delegate only when a trigger is present and the expected value exceeds coordination cost.

## Delegate When

| Trigger | Use | Why |
| --- | --- | --- |
| Broad or unfamiliar search | `based-scout` | Isolate read-only context gathering. |
| Ambiguous design or migration | `based-planner` | Produce compact executable state before edits, or `.based/plans/**` artifacts when explicitly requested. |
| Failing tests, CI, regressions | `based-repairer` | Keep diagnosis hypothesis-led. |
| Trust boundary | `based-safety` | Separate credentials, deletion, deployment, plugins, hooks, MCP, memory, and external-account risk. |
| Independent evidence needed | `based-validator` | Verify behavior without sharing implementation bias. |
| Risky or broad diff | `based-reviewer` | Inspect from objective, diff, tests, validation, and contracts rather than implementer transcript. |
| Durable memory work | `based-memory` | Enforce scope, provenance, privacy, and supersession. |
| Workflow or prompt improvement | `based-improver` | Keep learning proposal-driven and reversible. |
| Avoidable complexity review | `based-minimizer` | Simplify only after behavior is understood. |

## Do Not Delegate When

- The task is small and local.
- A role exists but adds no independence.
- One deterministic command can validate the answer.
- The delegated role would need the same full context as the owner.
- Delegation would mainly create a longer transcript.

## Workflow Modes

- `direct`: one owner implements, validates, and reviews locally.
- `review-only`: reviewer inspects the diff or surface, no edits.
- `validate-only`: validator runs checks and reports evidence, no edits.
- `diagnostic-repair`: repairer keeps a hypothesis ledger before editing.
- `safety-gated-direct`: safety classification precedes scoped direct work.
- `plan-scout-implement`: planner and optional scout return compact state, owner implements.
- `plan-safety-implement`: planning plus safety when broad work crosses a trust boundary.

## Token Discipline

- Start from task shape, not full research notes.
- Delegation requests include objective, scope, exact files or queries, budget, stop condition, and return contract.
- Subagent returns should fit in six bullets unless evidence requires more.
- Pass paths, commands, invariants, validation output, uncertainty, and risks. Do not pass raw transcript.

## Route Trace

Record a compact `based-trace append --event workflow ...` entry only when delegation happens or when a broad/risky task intentionally stays `direct`. Keep it to mode, owner, delegates, reason, and expected validation.

## Return Contract

```md
## Delegate Return
- Outcome:
- Files / artifacts:
- Evidence:
- Decisions:
- Validation:
- Uncertainty:
- Risks:
- Next action:
```
