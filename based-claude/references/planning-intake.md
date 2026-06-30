# Planning Intake Protocol

Use this when planning work that is ambiguous, broad, risky, or likely to change after repo inspection.

## Purpose

Guided intake exists to improve plans, not to create a separate interview workflow. The planner should turn user intent into an executable plan with the fewest useful questions.

## Flow

1. Lock the visible objective, likely user-visible outcome, and any explicit constraints.
2. Ask up to three initial questions only when they materially clarify intent, success criteria, hard constraints, audience, or scope. Include recommended defaults when possible.
3. Inspect local instructions, manifests, docs, tests, schemas, and likely implementation surfaces before asking follow-up questions about discoverable facts.
4. Ask follow-ups only after exploration reveals a decision that changes implementation, validation, risk, or approval boundaries.
5. Stop asking when the remaining unknowns can be handled as explicit assumptions in the plan.

## Question Rules

- Do not ask for file locations, command names, framework choices, or existing behavior before searching the repo.
- Prefer one compact question at a time when the answer blocks planning.
- Group non-blocking choices into assumptions with defaults instead of pausing.
- Do not ask questions whose answers would only make the plan more verbose.
- If the user already gave enough detail for a conservative plan, proceed directly.

## Plan Acceptance Criteria

A complete plan states objective, scope, proposed changes, validation, risks, stop conditions, assumptions, and next actions. It identifies whether work should stay direct or use a subagent role, and why.

## Anti-Patterns

- Creating a new interview command or agent when the existing plan command can host the intake behavior.
- Treating guided intake as adversarial review.
- Loading broad research notes before local facts establish relevance.
- Delegating because a role exists rather than because it adds independent value.
