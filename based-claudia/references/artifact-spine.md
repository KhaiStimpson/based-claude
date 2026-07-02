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

It should also preserve the fields most likely to be lost across compaction:

- non-goals
- model and effort assumptions
- token-headroom risk
- tool triggers and required post-action evidence
- human gates
- strongest current evidence and uncertainty

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

The plan entrypoint should state:

- whether instructions apply to one file, all touched files, or the whole repository surface;
- non-goals and protected paths;
- model/effort assumptions and token-headroom risks;
- tool triggers, especially tests, schemas, local search, browser, MCP, and external evidence;
- falsifying checks that would prove the plan wrong;
- human gates before merge, deploy, delete, credential use, external writes, or durable memory promotion.

## Validation

Validation records should preserve command, cwd, result, evidence inspected, model/effort assumptions when relevant, falsifying checks, uncertainty, and what remains unproven.

## Reviews

Review artifacts should keep broad discovery separate from later filtering:

1. Discovery findings: every plausible issue with evidence and confidence.
2. Severity/ranking: verified impact, deduplication, and priority.
3. Rejected findings: unsupported items and why they were rejected.

## Traces

`.based/traces/actions.jsonl` stores compact action-state records. Record what changed, the actor, authority, artifact, evidence, validation, risks, and next action.

When tool output, permissions, model behavior, or review recall matters, include compact optional fields such as `risk_class`, `permission_basis`, `tool_or_adapter`, `external_output_policy`, `model_assumption`, `effort`, `token_headroom`, and `review_stage`.
