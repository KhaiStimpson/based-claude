# Artifact Spine

The artifact spine is the durable state layer for Based Claudia. It turns long agent work into compact files that can be reopened without replaying the full conversation.

## Paths

```text
.based/state/current.md
.based/plans/<slug>/plan.md
.based/traces/actions.jsonl
.based/validation/<slug>.md
.based/reviews/<slug>.md
.based/handoffs/<slug>.md
.based/memory/drafts/<slug>.md
```

## Rules

- Keep entry files short.
- Link detail files instead of duplicating content.
- Preserve exact paths, commands, decisions, assumptions, validation output, and residual risk.
- Mark inferred facts as inferred.
- Do not store secrets, credentials, private keys, regulated data, or unnecessary private user state.
- Live repository evidence wins over stale artifacts.
- Supersede outdated artifacts rather than silently relying on them.

## Current State

`.based/state/current.md` is the top-level status surface. It should contain objective, mode, owner, scope, constraints, next action, blockers, latest validation, and active artifact links.

## Plans

Plan bundles use progressive disclosure:

```text
plan.md
context.md
tasks.md
validation.md
risks.md
handoff.md
```

The developer reads `plan.md` first and opens linked files only when needed.

## Traces

`.based/traces/actions.jsonl` stores compact action-state records. Record what changed, the actor, authority, artifact, evidence, validation, risks, and next action.
