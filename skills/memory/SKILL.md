---
name: memory
description: Draft, validate, audit, or retire governed memory cards from explicit user statements or validated traces.
when_to_use: Use only when the user explicitly asks to create, inspect, update, audit, or use durable memory, or when a validated trace clearly needs a governed memory artifact and the user approves.
disable-model-invocation: true
---

# Based Memory

Durable memory is governed data, not a transcript drawer. Prefer no memory over weak memory.

## Read First

- `../../references/memory-card-schema.md`

## Load On Trigger

- `../../references/safety-policy.md` when memory may contain sensitive data, cross a scope boundary, affect tool use, or be promoted durably.
- `../../references/trace-schema.md` when drafting from trace evidence.
- `../../references/research-basis.md` only when changing or reviewing memory architecture, retrieval policy, privacy policy, or self-improvement behavior.

## Rules

1. Do not silently write durable memory.
2. Store scoped, compact records with provenance and retirement conditions.
3. Separate session, feature, repo, user, and global scopes.
4. Preserve supersession instead of silent overwrite.
5. Do not store secrets, credentials, private keys, regulated data, or private user state unless explicitly requested and appropriate.
6. Validate recovery and leakage boundaries where memory affects behavior.

## Workflow

1. Identify the source: explicit user statement, validated trace, repository evidence, or external reference.
2. Pick scope and allowed readers.
3. Draft the memory card using the schema.
4. Audit the draft for schema, scope, provenance, confidence, sensitivity, and duplicate active claims.
5. Retrieve active memory by query and scope before using it.
6. Promote only with explicit approval.
7. Retire or supersede stale cards instead of silently overwriting.

## Helper

Use `based-memory`:

```bash
based-memory audit --strict
based-memory new --title "..." --scope repo --summary "..." --evidence "..."
based-memory suggest --write
based-memory promote card-slug --approved --supersession-reviewed
based-memory retrieve --query "..." --scope repo,user
based-memory retire card-slug --approved
```
