---
name: start
description: Orient a repository and initialize Based Claudia workflow state.
when_to_use: Use when starting work, onboarding Based Claudia, or asking what to do next.
---

# Start

## Read First

- `../../references/workflow-kernel.md`
- `../../references/artifact-spine.md`
- `../../references/system-contract.md` only when not already operating under the claudia-developer contract.

## Workflow

1. Read local instructions and manifest files.
2. Run or ask to run `based-claudia init --objective "<goal>"` when durable workflow state is useful.
3. Identify likely validation commands.
4. Choose the next command:
   - `plan` for broad, risky, or ambiguous work.
   - `implement` for scoped edits.
   - `check` for validation.
   - `review` for independent review.
   - `handoff` for continuation.
   - `learn` for governed memory drafts.
5. State the next concrete action.

Do not front-load all references. Load detail only when it changes the next decision.
