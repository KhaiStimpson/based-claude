# Research Basis

This portable synthesis is derived from the local MAS Research Wiki and should be verified against the target repository before project-specific claims.

## Design Rules

1. The scaffold is part of the model. Planning, execution, validation, review, memory, safety, and tool adapters need explicit contracts.
2. More agents are not automatically better. Delegate only when task structure, context isolation, parallel search, trust boundaries, or independent review justify the coordination cost.
3. Context is an engineering surface. Load high-signal detail just in time and preserve file paths, commands, identifiers, and artifact IDs for retrieval.
4. Long trajectories should become compact action state, not raw transcript piles.
5. Diagnosis should be hypothesis-led and evidence-bearing before repair.
6. Validation starts with executable evidence. Semantic judgment is second-line and should be evidence-conditioned.
7. Memory is governed data. Scope, provenance, supersession, confidence, allowed readers, retirement, leakage tests, and recovery tests matter.
8. Safety belongs at the action boundary. Prompt instructions are not hard isolation.
9. Self-improvement must be trace-derived, validated, reversible, and independently reviewed for evaluator, memory, safety, script, hook, or trust-boundary changes.
10. Minimum code is not minimum engineering. Do not remove security, data-loss protection, accessibility, calibration, explicit requirements, or required validation.

## Evidence Boundary

The wiki mixes papers, repository ingests, and practitioner guidance. Use stable cross-source patterns as stronger evidence than single-source quantitative claims.
