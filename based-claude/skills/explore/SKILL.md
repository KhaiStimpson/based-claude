---
name: explore
description: Read-only repository exploration for instructions, project shape, relevant files, tests, scripts, schemas, and evidence.
when_to_use: Use when a task needs repository discovery, unfamiliar code orientation, read-only evidence gathering, or context narrowing before implementation.
---

# Based Explore

Use this for read-only orientation. Do not edit files.

## Read First

- `../../references/project-scan-schema.md`

## Workflow

1. Read local instruction files first.
2. Inspect manifests, package files, build files, and config.
3. Use fast search for symbols, file names, route names, commands, errors, and tests.
4. Open only narrow files that affect the answer.
5. Return evidence with exact paths and why each path matters.

## Output

```md
## Findings
- Path: why it matters

## Likely Implementation Surface
- Path:

## Validation Candidates
- Command:

## Open Questions
```

The goal is enough context for the next action, not exhaustive reading.

