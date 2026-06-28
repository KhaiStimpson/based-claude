# Self-Improvement Protocol

Self-improvement turns validated traces into proposed changes to skills, memory cards, scripts, references, validation checks, or workflow rules.

## Evidence Rules

- Promote changes only from reproduced failures, validated successes, repeated user corrections, or explicit user requests.
- Keep before/after evidence.
- Preserve rollback and retirement conditions.
- Separate proposal, evaluation, review, and promotion.
- Never let an artifact approve changes to its own evaluator without independent review.

## Artifact States

```text
trace -> proposal -> evaluated -> accepted -> implemented separately -> validated -> retained or retired
```

`based-improve promote` records an accepted proposal. It does not silently patch skills, prompts, scripts, validators, or safety policy. The implementation step remains a normal code change with validation and review.

## Required Proposal Fields

- Problem or failure mode.
- Evidence and provenance.
- Target artifact.
- Proposed change.
- Validation plan.
- Before/after evidence.
- Rollback path.
- Retirement condition.
- Safety notes.

## Commands

```bash
based-improve suggest --write
based-improve propose --title "..." --problem "..." --change "..." --evidence "..." --write
based-improve evaluate proposal-slug --command "npm run check" --write
based-improve review proposal-slug --verdict approve --evidence "..." --write
based-improve promote proposal-slug --approved
```

## Rejection Modes

- Proposal is based on a one-off unvalidated trace.
- Validation only checks formatting, not behavior.
- Evaluator, rubric, or safety policy is weakened.
- The change creates hidden automatic execution.
- The proposal stores sensitive data or crosses memory scope boundaries.
- No rollback or retirement condition exists.
