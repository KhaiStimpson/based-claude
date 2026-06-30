# Loop Modes

Loop engineering defines repeated agent work by state, verifier, budget, safety boundary, and human review point.

## Modes

- `manual`: human-triggered work, default mode.
- `L1 report-only`: recurring triage can inspect and write state or reports but cannot modify product files.
- `L2 assisted-fix`: small fixes are allowed with isolation, attempt caps, validation, independent review, protected paths, and human gates.
- `L3 unattended`: not a default. Requires explicit external approval, least-privilege connectors, kill switch, rollback, run logs, budgets, denied paths, and permanent human review for merge, deploy, delete, and irreversible data movement.

## Failure Modes

- State rot.
- Verifier theater.
- Infinite fix loops.
- Token burn.
- Parallel collision.
- Comprehension rot.
- Cognitive surrender.
- Escalation failure.
- Verification debt.

## First-Loop Checklist

Define objective, watched scope, trigger, state artifact, allowed actions, protected surfaces, budget, verifier, escalation path, run log, pause and kill criteria, rollback, and retirement condition.
