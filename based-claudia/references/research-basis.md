# Research Basis

Based Claudia is grounded in a portable synthesis of the local MAS Research Wiki, not a live dependency on it.

## Design Rules

1. Scaffold choice matters.
   - Planner, implementer, checker, reviewer, memory, and safety behavior should have explicit contracts.
   - Do not maximize role count. Split only when context isolation, trust boundaries, parallel search, or independent review justify the cost.

2. Context is an engineering surface.
   - Load the smallest high-signal context first.
   - Preserve paths and identifiers so detail can be retrieved later.
   - Long trajectories should become compact action-state records, not raw transcript piles.

3. Delegation is state movement.
   - Handoffs should preserve objective, authority, files, decisions, evidence, validation, risks, and next action.
   - One owner remains responsible for global state and completion.

4. Validation starts with executable evidence.
   - Run deterministic checks before semantic review where possible.
   - Record what a check proves and what remains unproven.

5. Memory is governed data.
   - Durable learning needs scope, provenance, supersession, confidence, retirement conditions, and privacy review.

6. Safety belongs at the action boundary.
   - Review actor, authority, target, reversibility, and postcondition checks.
   - Skills and scripts are supply-chain artifacts.

7. Self-improvement must be reversible.
   - Promote only trace-derived, validated, reviewed improvements with rollback notes.

## Evidence Boundary

Treat this reference as design guidance. Verify project-specific facts in the target repository before acting.
