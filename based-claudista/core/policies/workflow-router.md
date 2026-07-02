# Workflow Router Policy

Use `/based-claudista:work` as the normal entrypoint.

## Phases

Treat routing as a compact state machine:

1. `discover`: load instructions, manifests, current state, and the smallest evidence set that can classify the task.
2. `plan`: create an executable plan when scope, risk, ambiguity, migration, or loop mode makes direct action brittle.
3. `act`: implement or execute the smallest scoped change with one owner.
4. `verify`: run deterministic checks, schema checks, fixture checks, or dry runs before semantic judgment.
5. `review`: discover plausible issues first, then verify, dedupe, rank, and filter.
6. `handoff`: record objective, state, evidence, validation, risks, and next action.
7. `improve`: propose reusable learning only from validated traces.

## Routing Rules

- Small scoped change: `discover -> act -> verify -> review`.
- Broad or ambiguous change: `discover -> plan -> act -> verify -> review`.
- Failure or regression: `discover -> plan -> act` through repair mode with a diagnostic ledger.
- Current work needs confidence: `discover -> verify` or `discover -> review`.
- Credentials, deletion, deployment, external systems, hooks, MCP, or durable memory: safety gate before `act`.
- Reusable learning: `verify -> review -> improve` from traces.
- Durable fact or failure shield: governed memory after validation and approval.

## Effort And Tool Triggers

- Use lower effort only for narrow lookup, formatting, and known-pattern L1 report-only work.
- Use high effort for implementation, repair, planning, review, safety, and L2 assisted fixes.
- Use xhigh effort for hard debugging, evaluator changes, broad reviews, trust-boundary work, or long-horizon failures.
- Tool-heavy workflows must state the trigger: local search, tests, schemas, browser/computer use, MCP, external source, or deployment tooling.
- Record required post-action evidence before moving from `act` to `verify` or `handoff`.

## Contribution Roles

Use role-typed trace labels for long-horizon or loop work:

- `decisive_progress`: action directly advanced the objective.
- `useful_exploration`: action narrowed uncertainty or found important evidence.
- `no_progress_infrastructure`: action maintained state or setup but did not advance the objective.
- `regression`: action made the state worse, invalidated evidence, or violated a boundary.

Record a workflow trace when delegation happens, work is broad or risky, loop mode is used, effort/tool routing matters, or the outcome may become memory or an improvement.
