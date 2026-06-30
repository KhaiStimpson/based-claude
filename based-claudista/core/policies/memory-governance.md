# Memory Governance Policy

Memory reads and writes are scoped by session, feature, repo, user, or global.

Durable writes require provenance, confidence, allowed readers, supersession status, and retirement conditions. Global promotion requires explicit approval.

Run leakage and stale-state checks when memory behavior changes.
