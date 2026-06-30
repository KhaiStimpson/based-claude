# Progressive Plan Artifact

Use this only when the user explicitly asks for `/based-claude:plan-file`, saved plan files, markdown plan artifacts, or a developer handoff plan.

## Purpose

A plan artifact turns a completed plan into compact, navigable state for implementation. It should help the next developer act without replaying the planning transcript.

## Location

Write plan bundles under:

```text
.based/plans/<slug>/
```

`.based/` is local runtime state. Do not use plan artifacts for source documentation unless the user explicitly asks for project docs.

## Bundle Shape

```text
plan.md
context.md
tasks.md
validation.md
risks.md
handoff.md
```

- `plan.md`: short index with objective, scope, sequence, linked detail files, validation summary, risks, and next action.
- `context.md`: instruction contracts, repo facts, files inspected, constraints, assumptions, and decisions.
- `tasks.md`: sequenced implementation stages, likely files, acceptance checks, and dependencies.
- `validation.md`: smallest meaningful checks, broader gates, commands, expected evidence, and skipped checks.
- `risks.md`: rejection modes, stop conditions, approval boundaries, rollback notes, and open questions.
- `handoff.md`: action-state handoff for the developer.

## Progressive Disclosure Rules

- Keep `plan.md` compact; put detail behind links.
- Preserve exact paths, commands, identifiers, and assumptions.
- State what matters for execution, not every planning exchange.
- Do not duplicate the same detail across every file.
- Mark inferred facts as inferred.
- Ask at most one blocking question before writing when a decision changes implementation, validation, risk, or approval boundaries.
- If the host cannot write files, output the intended paths and markdown content instead.

## Developer Consumption

The developer should read `plan.md` first, then open linked detail files only when needed for the current implementation step. If the plan conflicts with live repository evidence, the live repository wins and the developer should update or supersede the plan artifact.
