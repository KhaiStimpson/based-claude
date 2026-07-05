# Delegation And Dynamic Workflow Policy

Use this inside the main agent's normal task setup. It is not a user-facing command. It is also the role map: one agent stays responsible for global state and completion criteria unless the user explicitly asks for an agent team.

Research evidence lives in `research-basis.md` (Delegation Evidence section); read it only when changing or reviewing workflow policy.

## Default Rule

Use one owner by default. Delegate only when a trigger is present and the expected value exceeds coordination cost.

## Delegate When

| Trigger | Role | Why |
| --- | --- | --- |
| Broad or unfamiliar search | `based-scout` | Read-only context gathering, isolated from the owner's context. |
| Ambiguous design or migration | `based-planner` | Executable plan before edits; `.based/plans/**` artifacts only when explicitly requested. |
| Failing tests, CI, regressions | `based-repairer` | Hypothesis-led diagnosis before the smallest repair. |
| Trust boundary | `based-safety` | Classify credentials, deletion, deployment, plugins, hooks, MCP, memory, external-account actions as allow/warn/escalate/block. |
| Independent evidence needed | `based-validator` | Run checks without implementation bias; report what remains unproven. |
| Risky or broad diff | `based-reviewer` | Review from objective, diff, tests, validation, and contracts — not the implementer transcript. |
| Durable memory work (explicit only) | `based-memory` | Enforce scope, provenance, privacy, supersession, retirement. |
| Workflow or prompt improvement | `based-improver` | Keep learning proposal-driven and reversible. |
| Avoidable complexity review | `based-minimizer` | Guarded simplification after behavior is understood; never removes safeguards. |

## Do Not Delegate When

- The task is small and local.
- A role exists but adds no independence.
- One deterministic command can validate the answer.
- The delegated role would need the owner's full context.
- Delegation would mainly create a longer transcript.

## Workflow Modes

`direct`, `review-only`, `validate-only`, `diagnostic-repair`, `safety-gated-direct`, `plan-scout-implement`, `plan-safety-implement` — defined in `system-contract.md` (Dynamic Workflow Selection).

## Token Discipline

- Start from task shape, not full research notes.
- Delegation requests include objective, scope, exact files or queries, budget, stop condition, and return contract.
- Subagent returns should fit in six bullets unless evidence requires more.
- Pass paths, commands, invariants, validation output, uncertainty, and risks. Never raw transcript.

## Route Trace

Record a compact `node "${CLAUDE_PLUGIN_ROOT}/bin/based-trace.js" append --event workflow ...` entry only when delegation happens or a broad/risky task intentionally stays `direct`: mode, owner, delegates, reason, expected validation.

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
