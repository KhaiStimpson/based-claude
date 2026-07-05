---
name: memory
description: Governed memory workflow for drafting, auditing, retrieving, and promoting scoped memory cards.
when_to_use: Use when durable memory is explicitly requested or when the user asks to inspect memory quality.
---

# Based Claudista Memory

## Read First

- `../../references/memory-governance.md`
- `../../references/state-contract.md`

## Rules

- Do not store raw transcripts.
- Do not store secrets, credentials, private keys, or sensitive private data.
- Use scoped cards with provenance, confidence, supersession, allowed readers, and retirement conditions.
- Promotion across scopes requires review and explicit approval.
- Task success is not proof that memory is recoverable.

Use `node "${CLAUDE_PLUGIN_ROOT}/bin/claudista-memory.js" audit` to inspect local cards when useful.
