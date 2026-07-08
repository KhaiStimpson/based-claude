---
name: memory
description: Governed memory workflow for drafting, auditing, retrieving, promoting, and retiring scoped memory cards.
when_to_use: Use when the user explicitly asks to remember something durably, audit memory quality, or promote validated traces into memory.
disable-model-invocation: true
---

# Migrato Memory

## Read First

- `../../references/memory-card-schema.md` — schema, lifecycle, admission rules.

## Load On Trigger

- `../../references/safety-policy.md` (Durable Memory section) before any promotion.
- `../../references/trace-schema.md` when drafting from validated traces.

## Workflow

1. Draft only from explicit user statements, validated traces, repository evidence, or external references: `node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-memory.js" suggest --write`.
2. Audit drafts for schema, scope, sensitivity, confidence, provenance, and duplicate active claims: `... audit --strict`.
3. Promote only with explicit user approval and supersession review: `... promote <slug> --approved --supersession-reviewed`.
4. Retrieve by scope before applying cards to a task: `... retrieve --query "..." --scope repo,user`.
5. Retire or supersede when evidence changes: `... retire <slug> --approved`; run `... audit --recovery` afterward.
6. Never store secrets, credentials, private keys, or raw transcripts.

## Rules

- Prefer no memory over weak memory.
- Task success alone is not memory-quality evidence.
- Promotion and retirement move the source file — no stale copy may keep matching retrieval.
- All writes happen through the helper so ledgers stay consistent; report every write in chat.
