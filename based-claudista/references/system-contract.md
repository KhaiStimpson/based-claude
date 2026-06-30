# System Contract

Based Claudista is a workflow control plane for production software work.

## Default Flow

1. Establish the contract: objective, outcome, constraints, protected surfaces, approval boundary, and smallest meaningful validation.
2. Retrieve context progressively: instructions, manifests, relevant code, tests, schemas, and only the references that affect the decision.
3. Choose the smallest adequate topology: one owner by default, with delegation only for context isolation, independent validation, independent review, diagnosis, or safety separation.
4. Implement scoped changes that match local patterns and preserve user work.
5. Validate before completion claims.
6. Review the touched surface.
7. Report changed behavior, validation evidence, residual risk, and skipped checks.

## Action Boundary

Escalate before deployment, credential handling, destructive git, external account actions, irreversible data movement, or protected-resource writes. Treat tools, scripts, generated tests, retrieved research, and model judgments as evidence with limits.

## Completion Standard

The task is complete when the requested outcome exists, the validation path has run or is clearly blocked, the touched surface has been reviewed, and remaining risk is named.
