# Governed Memory Card Schema

Use this schema for durable cards under `.based/memory/cards/` or another explicitly approved project memory store.

Default layout:

```text
.based/memory/cards/drafts/
.based/memory/cards/active/
.based/memory/cards/retired/
.based/memory/promotions.jsonl
.based/memory/retirements.jsonl
```

```yaml
---
type: memory-card
title: "Short name"
scope: session | feature | repo | user | global
status: active | draft | superseded | retired
created: YYYY-MM-DD
updated: YYYY-MM-DD
source:
  kind: user-statement | validated-trace | repository-evidence | external-reference
  path_or_id: ""
  captured_by: ""
provenance:
  evidence: []
  derivation: ""
confidence: high | medium | low
applies_when: []
does_not_apply_when: []
supersedes: []
superseded_by: []
retirement_condition: ""
privacy:
  contains_sensitive_data: false
  allowed_readers: []
---
```

## Body

Use this structure:

```md
# Title

## Claim

One compact statement of the reusable fact, preference, pattern, or failure shield.

## Evidence

Paths, commands, outputs, user statements, issue IDs, or trace IDs.

## How To Use

Concrete activation cues and actions.

## Failure Modes

How this card can become stale, leak, or mislead.

## Validation

Checks that proved it, plus what remains unproven.
```

## Admission Rules

- Prefer no memory over weak memory.
- Do not use task success alone as memory-quality evidence.
- Do not promote raw transcript dumps.
- Do not write secrets or personal data.
- Preserve explicit contradictions instead of overwriting.
- Record supersession and retirement, not only creation.

## Workflow

1. Draft from explicit user statements, validated traces, repository evidence, or external references.
2. Audit schema, scope, sensitivity, confidence, provenance, and duplicate active titles.
3. Retrieve by scope before applying the card to a task.
4. Promote only with approval.
5. Retire or supersede cards when evidence changes.

## Commands

```bash
based-memory suggest --write
based-memory promote card-slug --approved --supersession-reviewed
based-memory retrieve --query "test command" --scope repo,user
based-memory retire card-slug --approved
based-memory audit --strict
```
