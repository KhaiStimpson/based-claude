# Self-Improvement Protocol

Self-improvement turns validated traces into proposed changes to skills, memory cards, scripts, references, validation checks, or workflow rules.

## Evidence Rules

- Promote changes only from reproduced failures, validated successes, repeated user corrections, or explicit user requests.
- Keep before/after evidence.
- Preserve rollback and retirement conditions.
- Separate proposal, evaluation, review, and promotion.
- Never let an artifact approve changes to its own evaluator without independent review.
- Before drafting a new proposal, check whether an existing skill, reference, or accepted proposal already covers the same problem; extend or supersede it rather than adding a near-duplicate.
- Accept an edit only if its evaluation shows an improvement over the pre-change baseline on a held-out check or fixture, not merely that the check ran. `claudius-improve evaluate` records pass/fail for exactly this purpose — do not promote on a proposal's own narrative alone.
- Rejected proposals stay in `reviews.jsonl`/`evaluations.jsonl` rather than being deleted; a rejected-but-still-valid idea can be revisited if new evidence appears, without re-deriving it from scratch.

## Skill Radar

The owner agent watches for skill-shaped repetition while working — this is the proposal trigger, not a creation path:

- The same multi-step procedure executed three or more times across tasks.
- A recurring failure with a known, validated fix.
- A validated trace whose structure would transfer to future tasks with only parameter changes.
- The user pasting the same instructions or checklist more than once.

When a signal fires, name it in the task report and draft a proposal (`claudius-improve propose`). The proposal states what the skill would do, the evidence of repetition, and what existing skill or reference it would extend or supersede. Skills are never created as a silent side effect — the ecosystem's documented failure mode is exactly the ungated trace-to-skill pipeline.

### Optional Scheduled Radar (not installed by default)

Users who want unattended radar can create a Claude Code scheduled task that runs at their chosen cadence with a prompt like:

```text
Read .claudius/traces/actions.jsonl and .claudius/improvements/.
List repetition signals per the Skill Radar section of
references/self-improvement.md, draft proposals with
`node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" propose ... --write`
for any signal with three or more supporting traces, and report what
was drafted. Do not modify skills, agents, or references.
```

This stays report-and-propose only: drafted proposals still require evaluation, review, and explicit promotion. Treat enabling it as an L1 report-only loop per `loop-readiness.md` — documented intent first, and retire it if runs stop producing signal.

## Artifact States

```text
trace -> proposal -> evaluated -> accepted -> implemented separately -> validated -> retained or retired
```

`node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" promote` records an accepted proposal. It does not silently patch skills, prompts, scripts, validators, or safety policy. The implementation step remains a normal code change with validation and review.

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
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" suggest --write
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" propose --title "..." --problem "..." --change "..." --evidence "..." --write
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" evaluate proposal-slug --command "npm run check" --write
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" review proposal-slug --verdict approve --evidence "..." --write
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" promote proposal-slug --approved
```

## Rejection Modes

- Proposal is based on a one-off unvalidated trace.
- Validation only checks formatting, not behavior.
- Evaluator, rubric, or safety policy is weakened.
- The change creates hidden automatic execution.
- The proposal stores sensitive data or crosses memory scope boundaries.
- No rollback or retirement condition exists.
