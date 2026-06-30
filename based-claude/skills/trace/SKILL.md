---
name: trace
description: Capture compact action-state traces for validation, memory drafting, observability, and self-improvement without storing raw transcripts.
when_to_use: Use when work should leave structured evidence for later memory retrieval, improvement proposals, debugging, or handoff.
---

# Based Trace

Use traces as compact evidence records. Do not dump transcripts.

## Read First

- `../../references/trace-schema.md`

## Load On Trigger

- `../../references/safety-policy.md` when traces mention tools, credentials, external systems, durable memory, private data, or trust boundaries.

## Workflow

1. Record objective, event type, summary, actor, authority, files, commands, validation result, decisions, evidence, and risks.
2. Mark `memoryCandidate` only when the fact may be useful later and has provenance.
3. Mark `improvementCandidate` only when the trace suggests a reusable skill, rule, script, validation, or workflow change.
4. Keep secrets and sensitive private data out of traces.
5. Use traces to draft memory and improvement proposals, not to auto-promote them.

## Helper

```bash
based-trace append --objective "..." --event validation --summary "..." --validation pass --commands "npm run check"
based-trace append --objective "..." --event repair --summary "..." --improvement-candidate --evidence "..."
based-trace summarize
```
