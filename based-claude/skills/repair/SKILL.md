---
name: repair
description: Diagnose and fix bugs, failing tests, CI failures, regressions, and long-horizon agent failures using evidence-led fault attribution.
when_to_use: Use when something fails, behavior regressed, tests are red, CI is broken, or the user asks to debug, diagnose, repair, or triage.
---

# Based Repair

Repair starts with an actionable diagnosis, not a broad rewrite.

## Read First

- `../../references/diagnostic-ledger.md`
- `../../references/validation-ladder.md`

## Load On Trigger

- `../../references/system-contract.md` before editing after diagnosis.
- `../../references/research-basis.md` only when diagnosing agent workflow, memory, evaluator, or long-horizon failures.

## Workflow

1. Define the observed failure and expected invariant.
2. Reproduce the failure or explain why reproduction is unavailable.
3. Build a ranked hypothesis ledger.
4. Inspect the highest-value evidence segment first.
5. Localize the mechanism, not just the file.
6. Apply the smallest repair that addresses the root cause.
7. Validate the failing path, then broaden if the touched contract is shared.
8. Preserve contradictions and residual risk.

## Diagnostic Output

Include:

- Suspected file, symbol, trace segment, or state transition.
- Failure mechanism.
- Evidence for and against.
- Confidence and remaining alternatives.
- Repair boundary.
- Validation command and result.

Do not rewrite unrelated code while the fault mechanism remains uncertain.
