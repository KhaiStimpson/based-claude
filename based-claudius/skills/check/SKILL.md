---
name: check
description: Validation and review workflow for current work, diffs, plugins, scripts, and workflow artifacts, including the mechanical code-style pass.
when_to_use: Use when the user asks to validate, review, audit, run checks, inspect a diff, check for AI slop, or decide whether work is ready.
---

# Claudius Check

## Read First

- `../../references/validation-ladder.md` — check selection and evaluation records.

## Load On Trigger

- `../../references/review-policy.md` when the pass includes review judgment, not just deterministic checks.
- `../../references/code-style.md` when delivered-code quality is in scope.
- `../../references/safety-policy.md` when the checked surface includes scripts, hooks, plugins, or action boundaries.
- `../../references/tool-adapter-safety.md` when checking MCP servers, hooks, or live adapters.

## Workflow

1. Establish what changed and what claim needs proving.
2. Run the smallest falsifying check first; broaden per the ladder as risk requires. `node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-quality-gate.js"` lists local candidates.
3. For nontrivial diffs, run the mechanical style pass: `node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-slop-check.js" --diff` (or explicit paths).
4. When review judgment is requested: discovery first (every plausible issue with evidence), then verification, then ranked reporting — correctness and safety above code-style findings.
5. Record commands, results, what they prove, what remains unproven, and skipped checks.
6. For broad, risky, evaluator-changing, or memory-changing work, recommend independent review rather than self-approval.

## Completion Bar

A check is complete when the evidence would convince a skeptical maintainer, not when commands merely ran.
