# Delegation And Dynamic Workflow Policy

Use this inside the main agent's normal task setup. It is not a user-facing command. It is also the role map: one agent stays responsible for global state and completion criteria unless the user explicitly asks for an agent team.

Research evidence lives in `research-basis.md` (Delegation Evidence section); read it only when changing or reviewing workflow policy.

## Default Rule

Use one owner by default. Delegate only when a trigger is present and the expected value exceeds coordination cost.

## Delegate When

| Trigger | Role | Why |
| --- | --- | --- |
| Broad or unfamiliar search | `migrato-scout` | Read-only context gathering, isolated from the owner's context. |
| Ambiguous design or migration | `migrato-planner` | Executable plan before edits; `.migrato/plans/**` artifacts only when explicitly requested. |
| Failing tests, CI, regressions | `migrato-repairer` | Hypothesis-led diagnosis before the smallest repair. |
| Trust boundary | `migrato-safety` | Classify credentials, deletion, deployment, plugins, hooks, MCP, memory, external-account actions as allow/warn/escalate/block. |
| Independent evidence needed | `migrato-validator` | Run checks without implementation bias; report what remains unproven. |
| Risky or broad diff | `migrato-reviewer` | Review from objective, diff, tests, validation, and contracts — not the implementer transcript. |
| Durable memory work (explicit only) | `migrato-memory` | Enforce scope, provenance, privacy, supersession, retirement. |
| Workflow or prompt improvement | `migrato-improver` | Keep learning proposal-driven and reversible. |

## Do Not Delegate When

- The task is small and local.
- A role exists but adds no independence.
- One deterministic command can validate the answer.
- The delegated role would need the owner's full context.
- Delegation would mainly create a longer transcript.

Claude Code's built-in Explore agent overlaps `migrato-scout`; the scout pins haiku with a structured return contract, which is cheaper and contract-stable for routine orientation. Use either; do not use both for the same question.

## Token Discipline

- Start from task shape, not full research notes.
- Delegation requests include objective, scope, exact files or queries, budget, stop condition, and return contract.
- Subagent returns should fit in six bullets unless evidence requires more.
- Pass paths, commands, invariants, validation output, uncertainty, and risks. Never raw transcript.

## Route Trace

Record a compact `node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-trace.js" append --event workflow ...` entry only when delegation happens or a broad/risky task intentionally stays direct: mode, owner, delegates, reason, expected validation.

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
