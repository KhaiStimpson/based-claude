---
name: start
description: Orient a repository with Based Claudius, discover validation commands, and choose the right workflow for the task at hand.
when_to_use: Use when starting work in a repository, onboarding the plugin, or asking what workflow or command to use next.
---

# Claudius Start

## Read First

- `../../references/system-contract.md` — router phases and standard routes.

## Load On Trigger

- `../../references/delegation-policy.md` when the first task is broad enough to consider delegation.
- `../../references/memory-card-schema.md` if `.claudius/memory/` already exists in the repository.

## Workflow

1. Read local instruction files (CLAUDE.md, AGENTS.md, contributing docs) and the top-level manifest(s).
2. Scan project shape: language, package manager, test runner, lint/build commands, CI config. `node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-doctor.js"` prints a compact scan when useful.
3. If `.claudius/` exists, read `state/current.md` and the latest handoff before anything else — prior action state outranks re-derivation.
4. Report: project shape, validation commands found, active instruction contracts, and the recommended route for the user's stated task (usually `/based-claudius:work`).
5. Do not edit files during orientation.

## Output

```md
## Project
- shape, entry points, instruction files

## Validation Commands
- command: what it checks

## Recommended Route
- skill or agent, and why
```
