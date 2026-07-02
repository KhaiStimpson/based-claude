---
name: code
description: End-to-end production coding workflow for scoped implementation, docs, tooling, plugin, and workflow changes.
when_to_use: Use when the user asks Claude to implement, modify, scaffold, automate, apply a known fix, or deliver a concrete change rather than only discuss options.
---

# Based Code

Default implementation workflow. The operating contract is the `based-developer` agent prompt; if running as a different agent, read `../../references/system-contract.md` first.

## Load On Trigger

- `../../references/validation-ladder.md` before selecting or reporting validation.
- `../../references/model-migration.md` when effort, token headroom, literal scope, progress updates, or tool-use behavior may affect the task.
- `../../references/delegation-policy.md` when task shape is broad, ambiguous, risky, failing, memory-related, self-improving, or likely to need context isolation.
- `../../references/research-basis.md` when changing workflow, memory, safety, validation, or self-improvement policy.
- `../../references/handoff-template.md` for long tasks, delegation, or continuation.

## Workflow

1. Establish the task contract: objective, user-visible outcome, scope, exclusions, protected surfaces, approval boundary, smallest meaningful validation. Before broad edits, name likely rejection modes: incorrect implementation, failing tests, missing context, unsafe state, evaluator weakening, low-value complexity.
2. Retrieve context progressively. Plan entrypoint first if provided; instructions and manifests before search; open only files that affect the decision; preserve paths, commands, and artifact IDs for later retrieval.
3. Pick the smallest adequate topology. Default to direct single-owner work; delegate per `delegation-policy.md` when separation adds real value. Record a workflow trace only when delegating or when broad/risky work intentionally stays direct.
4. Implement scoped changes. Match local patterns, prefer existing helpers and platform features, keep edits reversible, no unrelated refactors. Never weaken tests, safety checks, validators, rubrics, or policies to make work pass.
5. Validate: syntax/schema first, focused behavior checks for changed logic, then build/typecheck/lint/smoke/plugin validation when the touched surface warrants it. Record skipped checks and why.
6. Review the diff for regressions, missing tests, unsafe action paths, stale memory, evaluator drift, and unsupported assumptions. Use `review`, `validate`, `safety`, or `minimize` when the lens deserves separation.
7. Report compactly: changed behavior/files, validation command and result, residual risk.

## Completion Bar

Do not stop at a plan when implementation is requested. Continue through edits, validation, and review unless a blocker requires user input or approval.

## Delegation Contract

When delegating, pass only: objective and local scope; exact files, symbols, commands, or search terms; expected output and stop condition; evidence already known; and the return contract (outcome, files/artifacts, evidence, validation, uncertainty, risks, next action). No raw transcript transfer; returns stay short unless evidence requires more.
