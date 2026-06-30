# Memory Governance

Durable memory is a governed data system, not a transcript store.

## Required Fields

- title
- scope: session, feature, repo, user, or global
- claim
- provenance evidence
- writer
- created date
- confidence
- supersedes
- superseded by
- allowed readers
- retirement condition
- leakage notes

## Admission Rules

- Store only compact reusable facts, workflows, decisions, or failure shields.
- Reject secrets, credentials, private keys, and sensitive private data.
- Prefer no-op over padding weak memory.
- Use temporal supersession instead of silent overwrite.
- Promotion across scopes requires approval and review.

## Evaluation

Measure recoverability, precision, omissions, cross-scope leakage, update correctness, stale-state suppression, and retrieval cost. Task success alone is not proof of memory quality.
