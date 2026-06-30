# Loop Readiness

Use this reference when a plan, validation, review, or safety pass involves recurring, scheduled, autonomous, or long-running agent work.

## Required Contract

A loop is not ready just because an agent can repeat a prompt. Record:

- Purpose: one recurring goal and explicit non-goals.
- Scope: repositories, branches, files, tickets, or services watched.
- Cadence: schedule, trigger, first-run behavior, off-hours behavior.
- State: durable state file, board, database row, or run ledger.
- Owner: one mutating owner for each branch or global state surface.
- Verification: maker/checker split and evidence the checker must inspect.
- Budget: token, time, retry, and subagent-spawn limits.
- Human gates: security, credentials, deployment, billing, PII, broad diffs, and third failed attempt.
- Kill criteria: repeated failures, state rot, notification fatigue, cost overrun, or human comprehension loss.

## Validation Gates

Before recommending autonomous operation, prove:

- State is read at run start and pruned for closed, merged, stale, or ignored items.
- Attempts are capped and repeated error fingerprints escalate instead of looping.
- Work happens in isolated branches or worktrees when code can change.
- Run logs include inputs, actions, validation, handoff, and residual risk.
- The verifier cannot approve its own output and cannot weaken the evaluator.
- Human handoff has a concrete inbox, owner, and stop condition.

## Rollout Ladder

- L1: report-only. No code writes or external mutation.
- L2: assisted fixes. Small scoped changes with review and human gates.
- L3: unattended execution only after L1/L2 evidence, budgets, logs, rollback, and kill criteria exist.

Prefer L1 until repeated runs show useful signal and low operational noise.
