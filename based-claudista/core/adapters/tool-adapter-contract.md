# Tool Adapter Contract

Adapters should expose typed inputs, preconditions, execution mode, structured output, post-action checks, version, and replayable failure evidence.

Prefer read-only or dry-run defaults. Writes need proof-after-write, protected path checks, and clear rollback or remediation notes.
