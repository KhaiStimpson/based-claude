---
name: start
description: Orient a project with Based Claude, discover validation commands, and choose the right production coding workflow.
when_to_use: Use when starting work in a repository, onboarding Based Claude, or asking what workflow/agent/command to use next.
---

# Based Start

Use this as a lightweight project orientation.

## Workflow

1. Read local instructions.
2. Run or ask to run `based-doctor`.
3. Identify package managers, scripts, tests, and protected surfaces.
4. Pick the next mode:
   - `code` for implementation.
   - `plan` for broad or ambiguous work.
   - `plan-file` for opt-in markdown plan bundles under `.based/plans/**`.
   - `repair` for failures.
   - `validate` for checks.
   - `review` for diff inspection.
   - `safety` for trust-boundary review.
   - `trace` for compact action-state evidence.
   - `memory` for governed durable memory.
   - `improve` for validated self-improvement proposals.
   - `minimize` for avoidable complexity.
5. State the smallest meaningful validation path before editing.

Do not front-load the full plugin documentation. Load references only when they affect the next decision.
