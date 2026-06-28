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

## Workflow

1. Inventory the action surfaces: files, commands, plugins, hooks, tools, accounts, network, memory, logs.
2. Classify each consequential action as allow, warn, escalate, or block pending clarification.
3. Check for hidden execution, credential paths, broad filesystem/network access, and destructive operations.
4. Check whether validation or reviewers are independent from the generator.
5. Check durable memory for scope, provenance, supersession, privacy, and retirement.
6. Recommend the smallest control that preserves the user's goal.

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

