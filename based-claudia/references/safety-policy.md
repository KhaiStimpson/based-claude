# Safety And Trust Policy

Use this policy for shell commands, file edits, plugins, skills, memory, tool adapters, and external integrations.

## Action Risk Classes

- `allow`: local, reversible, expected action with a clear validation path.
- `warn`: safe enough to perform but worth noting due to cost, broad scope, or weak validation.
- `escalate`: requires user approval because it touches deployment, credentials, external accounts, destructive git, irreversible data movement, or protected resources.
- `block`: conflicts with policy, project instructions, safety, privacy, or law.

## Review Questions

- What actor, authority, target, and artifact does this action bind to?
- Is the action reversible?
- Does it cross a user, repo, agent, tenant, network, or durable-memory boundary?
- Is there a deterministic precondition or postcondition check?
- Are logs, handoffs, and memory drafts least-disclosing?
- Are skill resources, scripts, references, hooks, apps, MCP config, and assets reviewed?

## Tool Adapter Rules

- Prefer read-only construction.
- Disable writes by default.
- Use confirmation gates for irreversible actions.
- Capture proof after write.
- Quarantine repeated failures.
- Sanitize external logs and outputs before storing them.
