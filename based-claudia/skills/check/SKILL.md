---
name: check
description: Select, run, and record deterministic validation for the current work.
when_to_use: Use when validating implementation, plugin structure, scripts, docs, memory drafts, or workflow artifacts.
---

# Check

## Read First

- `../../references/validation-ladder.md`
- `../../references/artifact-spine.md`

## Workflow

1. Identify the smallest check that can falsify the changed behavior.
2. Run syntax/schema checks first.
3. Run focused behavior checks next.
4. Broaden to integration, process, latent-failure, or independent review checks when warranted.
5. Record evidence with `based-claudia check record --title "<title>" --command "<command>" --result pass|fail|skipped`.
6. Report what passed, what failed, and what remains unproven.

Do not claim completion from semantic judgment alone when executable checks are available.
