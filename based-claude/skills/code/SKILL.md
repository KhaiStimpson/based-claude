---
name: code
description: End-to-end production coding workflow for scoped implementation, docs, tooling, plugin, and workflow changes.
when_to_use: Use when the user asks Claude to implement, modify, fix, scaffold, automate, or deliver a concrete change rather than only discuss options.
---

# Based Code

Use this as the default implementation workflow.

## Read First

- `../../references/system-contract.md`

## Load On Trigger

- `../../references/validation-ladder.md` before selecting or reporting validation.
- `../../references/role-map.md` only when choosing a subagent role.
- `../../references/delegation-policy.md` only when task shape is broad, ambiguous, risky, failing, memory-related, self-improving, or likely to need context isolation.
- `../../references/research-basis.md` only when changing or reviewing architecture, validation policy, memory, safety, self-improvement, or agent workflow rules.
- `../../references/handoff-template.md` only for long tasks, delegation, or continuation.

## Workflow

1. Establish the task contract.
   - Objective, user-visible outcome, instructions, scope, exclusions, protected surfaces, approval boundary, and smallest meaningful validation.
   - Name likely rejection modes before broad edits: incorrect implementation, failing tests, missing context, unsafe state, evaluator weakening, or low-value complexity.

2. Retrieve context progressively.
   - If the user provides a `.based/plans/.../plan.md` path, read that first and open linked detail files only when needed.
   - Read local instructions and manifests first.
   - Use fast search before broad file reads.
   - Open only implementation, test, schema, config, and reference files that affect the decision.
   - Preserve file paths, command names, and artifact IDs so detail can be reopened later.

3. Pick the smallest adequate topology.
   - Default to direct single-owner work.
   - Use `based-scout` for independent read-only context gathering.
   - Use `based-validator`, `based-reviewer`, or `based-safety` when separation adds real value.
   - Use `based-planner` only when ambiguity or scope would make direct editing brittle.
   - Use `based-repairer` for failures, regressions, and CI diagnosis.
   - Use `based-memory` or `based-improver` only when durable memory or self-improvement is explicitly in scope.
   - Keep route reasoning compact and internal unless the user asks for it.
   - Record a compact workflow trace only when delegation happens or a broad/risky task intentionally stays direct.

4. Implement scoped changes.
   - Match local patterns and ownership boundaries.
   - Prefer existing helpers and standard platform features.
   - Keep edits reversible and avoid unrelated refactors.
   - Do not weaken tests, safety checks, validators, rubrics, or policies to make work pass.

5. Validate.
   - Syntax/schema first.
   - Focused behavior checks for changed logic.
   - Broaden to build, typecheck, lint, smoke, or plugin validation when touched surface warrants it.
   - Record skipped checks and why.

6. Review.
   - Check the diff or touched surface for regressions, missing tests, unsafe action paths, stale memory, evaluator drift, and unsupported assumptions.
   - Use `review`, `validate`, `safety`, or `minimize` when the lens is large enough to deserve separation.

7. Report.
   - Keep it compact: changed behavior/files, validation command and result, residual risk.

## Completion Bar

Do not stop at a plan when implementation is requested. Continue through edits, validation, and review unless a blocker requires user input or approval.

## Delegation Contract

When delegating, pass only:

- Objective and local scope.
- Exact files, symbols, commands, or search terms.
- Expected output and stop condition.
- Evidence already known.
- Return contract: outcome, files/artifacts, evidence, validation, uncertainty, risks, next action.

Avoid raw transcript transfer. A subagent return should be short unless evidence requires more.
