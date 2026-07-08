---
name: plan
description: Migration-first planning workflow. Decomposes a legacy page into horizontal, individually testable slices with feature-parity tracking; also handles ambiguous, broad, or architecture-heavy changes. Opt-in persistent plan bundles.
when_to_use: Use to plan a page migration, when the user asks to plan first, requirements are ambiguous, or implementation would be brittle without an executable plan. Add "plan files" or "save the plan" for a .migrato/plans bundle.
---

# Migrato Plan

## Read First

- `../../references/planning.md` — intake protocol, plan acceptance criteria, artifact contract.
- `../../references/migration.md` — slice bar, feature-parity ledger, component-map schema. Read before planning a migration (the default task shape).

## Load On Trigger

- `../../references/validation-ladder.md` when defining the plan's validation gates.
- `../../references/safety-policy.md` when the planned work crosses trust boundaries.
- `../../references/loop-readiness.md` when planning recurring or autonomous work.
- `../../references/model-contract.md` when model or effort assumptions shape the plan.

## Workflow

1. Lock objective, user-visible outcome, and explicit constraints. Ask at most three structured questions, only for decisions that change implementation, validation, risk, or approval boundaries.
2. Inspect instructions, manifests, tests, schemas, and likely surfaces before asking about anything discoverable.
3. For a migration, follow `migration.md`: enumerate the legacy page's full feature set, reconcile against `.migrato/migration/component-map.md`, and emit horizontal slices — each independently shippable, independently testable, parity-bearing, and reversible — seeding or updating `.migrato/migration/parity.md`. For non-migration work, produce the plan: scope, sequence, likely files, validation, risks, stop conditions, assumptions, human gates, and whether work stays direct or delegates.
4. Write a `.migrato/plans/<slug>/` bundle only when explicitly requested — `node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-plan.js" --write` scaffolds it; otherwise deliver the plan in chat.
5. Hand off to implementation unless only a plan was requested.

## Completion Bar

A complete plan can be executed by an implementer who never saw this conversation. A complete migration plan additionally leaves the parity ledger seeded, every legacy feature mapped or flagged as a gap, and each slice carrying an explicit parity assertion.
