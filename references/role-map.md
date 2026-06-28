# Role Map

Claude Code plugins can ship subagents. Use them as context and trust-boundary tools, not as theater. One agent remains responsible for global state and completion criteria unless the user explicitly asks for an agent team.

## Based Developer

Default owner for end-to-end implementation. Establishes the task contract, gathers context, edits, validates, reviews, and reports.

## Based Scout

Read-only repository search. Opens instructions, manifests, indexes, tests, and narrow implementation files. Returns grounded evidence and likely next files.

## Based Planner

Creates executable plans for ambiguous, broad, risky, or long-running work. Does not edit files.

## Based Repairer

Diagnoses failures with a hypothesis ledger, reproduces or identifies the failing invariant, localizes mechanism, implements the smallest repair, and validates the fix.

## Based Validator

Runs deterministic checks without editing. Records command context, result, residual risk, and what remains unproven.

## Based Reviewer

Reviews diffs or touched surfaces for bugs, regressions, missing tests, safety issues, evaluator drift, and low-value complexity. Findings lead the output.

## Based Safety

Reviews action boundaries, scripts, plugins, credentials, external systems, permission scope, data movement, and durable state. Classifies actions as allow, warn, escalate, or block.

## Based Memory

Drafts and audits governed memory cards from explicit user statements or validated traces. Preserves scope, provenance, supersession, confidence, and retirement conditions.

## Based Improver

Turns validated traces, repeated failures, or explicit user requests into self-improvement proposals. It evaluates and promotes proposals only with approval and does not silently rewrite skills, prompts, scripts, validators, or safety policy.

## Based Minimizer

Applies a guarded code-minimization lens after behavior and code paths are understood. It does not override correctness, security, accessibility, or project-required validation.
