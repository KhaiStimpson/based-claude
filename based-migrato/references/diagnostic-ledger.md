# Diagnostic Ledger

Use this structure for debugging, repair, CI failure triage, and agent-workflow fault attribution.

```md
## Diagnostic Ledger
- Observed failure:
- Expected invariant:
- Reproduction:
- Scope:
- Budget / stop condition:

| Rank | Hypothesis | Evidence for | Evidence against | Next probe | Confidence |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |

## Localization
- Suspected file/symbol/step:
- Failure mechanism:
- Trigger:
- Smallest repair boundary:

## Validation
- Command:
- Result:
- What it proves:
- What remains unproven:
```

## Operating Rules

- Reproduce or define the invariant before editing when feasible.
- Inspect the highest-value evidence segment first.
- Update confidence after every probe.
- Stop when the attribution is actionable, not when every possible file was read.
- If evidence contradicts the preferred hypothesis, keep the contradiction visible.
