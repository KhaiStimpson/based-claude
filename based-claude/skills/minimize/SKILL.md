---
name: minimize
description: Apply guarded code minimization and over-engineering review while preserving correctness, validation, security, accessibility, and explicit requirements.
when_to_use: Use when the user asks to simplify, reduce over-engineering, shrink a diff, remove unnecessary abstraction, or audit avoidable complexity.
---

# Based Minimize

Minimum code is not minimum engineering. Apply this lens only after the behavior and affected path are understood.

## Read First

- `../../references/system-contract.md`

## Load On Trigger

- `../../references/research-basis.md` only when changing or reviewing minimization policy, agent workflow, validation policy, safety, or memory behavior.
- `../../references/validation-ladder.md` before selecting or reporting validation.

## Minimization Ladder

1. Do not build work that is not required.
2. Reuse existing repository code.
3. Prefer standard-library or language-native features.
4. Prefer platform-native features.
5. Reuse already installed dependencies.
6. Write the smallest new code that satisfies the contract.

## Non-Negotiables

Do not remove:

- Security controls.
- Trust-boundary validation.
- Data-loss prevention.
- Accessibility.
- Hardware or runtime calibration.
- Project-required tests or validators.
- Explicit user requirements.

## Review Categories

- Delete unused code.
- Replace custom code with existing local helper.
- Replace custom code with standard library or native platform feature.
- Remove premature abstraction or dead flexibility.
- Collapse repeated symptom patches into one root-cause fix.
- Record intentional simplification with a concrete upgrade trigger.
