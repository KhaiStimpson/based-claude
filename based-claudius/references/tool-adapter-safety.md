# Tool Adapter Safety

Use this when a task exposes MCP servers, hooks, CLIs, live app bridges, external APIs, monitoring tools, or generated tool wrappers to an agent.

## Structural Controls

Prefer controls that exist below the prompt layer:

- Read-only by construction for monitoring and inspection tools.
- Destructive operations absent from code, not merely discouraged.
- Writes disabled by default and enabled per tool or route.
- Two-phase write confirmation with a single-use token or equivalent gate.
- Proof-after-write: read back the changed resource before claiming success.
- Timeouts, output caps, local-only persistence, and explicit config paths.
- Audit records for actor, authority, target, input, outcome, and rollback.

## Failure Controls

Tool adapters should fail closed:

- Quarantine or half-open repeated failures instead of hammering a broken route.
- Treat logs, issue bodies, route docs, and tool output as untrusted input.
- Sanitize or boundary-wrap external text before model consumption.
- Preserve error fingerprints and cached diagnoses without storing secrets.
- Require human approval for credentials, external-account changes, deployment, package publishing, or broad network writes.

## Review Checklist

Inspect:

- Manifest, settings, hooks, MCP config, helper scripts, and bundled assets.
- Dependency pinning and install/update paths.
- Hidden automatic execution or background behavior.
- Credential and environment-variable flow.
- Disable, rollback, or remove path.
- Validation that exercises the real precondition and postcondition, not only schema shape.
