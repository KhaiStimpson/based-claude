# Loop Readiness

Use this reference when a plan, validation, review, or safety pass involves recurring, scheduled, autonomous, or long-running agent work — including a user invoking Claude Code's native `/loop` command on mutating work, which is a loop-readiness trigger the same as a custom scheduled agent.

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

- L0: documented intent. The purpose, scope, and non-goals are written down before any run happens, even a report-only one.
- L1: report-only. No code writes or external mutation.
- L2: assisted fixes. Small scoped changes with review and human gates.
- L3: unattended execution only after L1/L2 evidence, budgets, logs, rollback, and kill criteria exist.

Prefer L1 until repeated runs show useful signal and low operational noise.

## Generator/Evaluator Separation

The generator produces the change; the evaluator checks it. They must be structurally
separate — the evaluator acts against the product with real tools (runs the test, reads
the diff, executes the check) rather than reasoning from the generator's own claims, and
it defaults to doubt: a plausible-looking result without executed evidence is not a pass.
The same rule applies inside the plugin's own review-migration guidance
(`model-migration.md`): discovery before filtering, and the reviewer does not approve its
own generation.

## Common Failure Modes

Recognize these before recommending L2/L3 rollout; several compound each other over time:

- **State rot.** The durable state file drifts from reality (closed items still tracked, stale watch lists) because nothing prunes it.
- **Verifier theater.** The "check" exists but doesn't actually exercise the change — it always passes regardless of correctness.
- **Comprehension rot.** Run logs accumulate without anyone reading them; a human could no longer reconstruct what the loop has been doing.
- **Cognitive surrender.** A human stops reviewing because the loop has run cleanly for a while, right up until it doesn't.
- **Escalation failure.** Repeated errors keep retrying with the same fingerprint instead of escalating to a human.
- **Token blowout.** Each run's context grows without bound instead of resetting or pruning between iterations.

The first three reinforce each other: stale state produces meaningless verification, which produces logs nobody reads, which produces surrendered oversight. Treat a fix to one as incomplete until the loop that caused it is closed.

## Artifact Shapes

For an L2+ loop, keep two small files rather than folding everything into the prompt:

- **`LOOP.md`** — cadence, budgets (token/time/retry/spawn caps), kill switch condition, connector/tool scope, and a denylist of actions the loop must never take unattended.
- **`STATE.md`** (or an equivalent durable record) — current watch list, explicitly ignored/noise items and why, and last-run metadata (timestamp, outcome, open follow-ups).

For more than one loop touching the same repository: one mutating owner per branch or
scope, separate state files per loop, an aggregate budget across loops (not just per
loop), and a single human inbox for cases that cross loop boundaries rather than each
loop escalating independently.
