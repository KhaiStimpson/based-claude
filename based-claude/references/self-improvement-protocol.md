# Self-Improvement Protocol

Self-improvement turns validated traces into proposed changes to skills, memory cards, scripts, references, validation checks, or workflow rules.

## Evidence Rules

- Promote changes only from reproduced failures, validated successes, repeated user corrections, or explicit user requests.
- Keep before/after evidence.
- Preserve rollback and retirement conditions.
- Separate proposal, evaluation, review, and promotion.
- Never let an artifact approve changes to its own evaluator without independent review.
- Before drafting a new proposal, check whether an existing skill, reference, or accepted proposal already covers the same problem; extend or supersede it rather than adding a near-duplicate.
- Accept an edit only if its evaluation shows an improvement over the pre-change baseline on a held-out check or fixture, not merely that the check ran. `based-improve evaluate` records pass/fail for exactly this purpose — do not promote on a proposal's own narrative alone.
- Rejected proposals stay in `reviews.jsonl`/`evaluations.jsonl` rather than being deleted; a rejected-but-still-valid idea can be revisited if new evidence appears, without re-deriving it from scratch.

## Artifact States

```text
trace -> proposal -> evaluated -> accepted -> implemented separately -> validated -> retained or retired
```

`node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" promote` records an accepted proposal. It does not silently patch skills, prompts, scripts, validators, or safety policy. The implementation step remains a normal code change with validation and review.

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
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" suggest --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" propose --title "..." --problem "..." --change "..." --evidence "..." --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" evaluate proposal-slug --command "npm run check" --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" review proposal-slug --verdict approve --evidence "..." --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" promote proposal-slug --approved
```

## Rejection Modes

- Proposal is based on a one-off unvalidated trace.
- Validation only checks formatting, not behavior.
- Evaluator, rubric, or safety policy is weakened.
- The change creates hidden automatic execution.
- The proposal stores sensitive data or crosses memory scope boundaries.
- No rollback or retirement condition exists.
