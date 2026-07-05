---
name: safety
description: Review action boundaries, tool use, scripts, plugins, hooks, MCP servers, credentials, memory, privacy, and external integrations.
when_to_use: Use when a task involves privileged actions, shell automation, plugins, hooks, MCP servers, package publishing, credentials, external accounts, data movement, or durable memory.
---

# Based Safety

Use this as a trust-boundary review. Do not treat prompt instructions as hard isolation.

## Read First

- `../../references/safety-policy.md`
- `../../references/memory-card-schema.md` for durable memory work.
- `../../references/research-basis.md` when reviewing agent systems, skills, scripts, or memory.

## Load On Trigger

- `../../references/tool-adapter-safety.md` when reviewing MCP servers, hooks, CLIs, live app bridges, external APIs, monitoring tools, or generated tool wrappers.
- `../../references/loop-readiness.md` when reviewing recurring, scheduled, autonomous, or long-running agent work.
- `../../references/phase-gates.md` when a user asks for a deterministic hook, or when a review finds a critical rule that a prompt instruction cannot reliably enforce.

## Workflow

1. Inventory the action surfaces: files, commands, plugins, hooks, tools, accounts, network, memory, logs. For a third-party skill or plugin under intake (not this plugin's own surfaces), enumerate every bundled resource and its capability surface per `safety-policy.md`'s Skill And Plugin Intake section, not just the entrypoint description.
2. Classify each consequential action as allow, warn, escalate, or block pending clarification.
3. Check for hidden execution, credential paths, broad filesystem/network access, and destructive operations.
4. For live tool adapters, check the structural controls in `tool-adapter-safety.md`; for recurring or autonomous work, the loop-readiness contract.
5. Check whether validation or reviewers are independent from the generator.
6. Check durable memory for scope, provenance, supersession, privacy, and retirement.
7. Recommend the smallest control that preserves the user's goal.

## Output

```md
## Boundary

## Classification
- Allow:
- Warn:
- Escalate:
- Block:

## Required Controls

## Residual Risk
```
