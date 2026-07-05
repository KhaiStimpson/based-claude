# Planning Contract

Use this when planning work that is ambiguous, broad, risky, or likely to change after repo inspection. It covers both intake (getting to a plan) and the optional plan artifact (persisting one).

## Intake Flow

Guided intake exists to improve plans, not to create a separate interview workflow. Turn user intent into an executable plan with the fewest useful questions.

1. Lock the visible objective, likely user-visible outcome, and any explicit constraints.
2. Ask up to three initial questions only when they materially clarify intent, success criteria, hard constraints, audience, or scope. Include recommended defaults. Prefer the `AskUserQuestion` tool with structured options over free-text questions when the choice set is small and known.
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

A complete plan states objective, scope, proposed changes, validation, risks, stop conditions, assumptions, and next actions. It identifies whether work should stay direct or use a subagent role, and why. It states:

- whether instructions apply to one file, all touched files, or the whole repository surface;
- non-goals and protected paths;
- model/effort assumptions and token-headroom risks;
- tool triggers — tests, schemas, local search, browser, MCP, external evidence;
- falsifying checks that would prove the plan wrong;
- human gates before merge, deploy, delete, credential use, external writes, or durable memory promotion.

## Plan Artifact (opt-in)

Write plan bundles only when the user explicitly asks for saved plan files or a developer handoff plan. Location:

```text
.claudius/plans/<slug>/
```

Bundle shape, progressively disclosed — `plan.md` is a short index read first; detail sits behind links:

```text
plan.md          objective, scope, sequence, linked details, validation summary, risks, next action
context.md       instruction contracts, repo facts, files inspected, constraints, assumptions, decisions
tasks.md         sequenced stages, likely files, acceptance checks, dependencies
validation.md    smallest meaningful checks, broader gates, commands, expected evidence, skipped checks
risks.md         rejection modes, stop conditions, approval boundaries, rollback notes, open questions
handoff.md       action-state handoff for the implementer
```

Rules: preserve exact paths, commands, identifiers, and assumptions; state what matters for execution, not every planning exchange; do not duplicate detail across files; mark inferred facts as inferred. If the host cannot write files, output the intended paths and markdown content instead.

## Consumption

The implementer reads `plan.md` first and opens linked detail files only when needed for the current step. If the plan conflicts with live repository evidence, the live repository wins; update or supersede the plan artifact.

## Anti-Patterns

- Creating a new interview command or agent when the existing plan command can host the intake behavior.
- Treating guided intake as adversarial review.
- Loading broad research notes before local facts establish relevance.
- Delegating because a role exists rather than because it adds independent value.
