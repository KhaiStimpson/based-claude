# Fixture: Migration Horizontal Slicing

## Invariant

`references/migration.md` says: a legacy-page migration is planned as a set of horizontal
slices, each **independently shippable, independently testable, parity-bearing, and
reversible**. The planner enumerates the legacy page's full feature set, reconciles it
against `.migrato/migration/component-map.md` (surfacing `unmapped` gaps rather than
inventing mappings), seeds `.migrato/migration/parity.md`, and never advances a parity row
to `verified` without an observed equivalence check. `migrated` means the code exists;
`verified` means it behaves like the legacy feature. A `dropped` feature requires a
recorded, human-approved reason.

## Prompt-level scenario (manual/LLM review — not mechanically provable without a live session)

| Task | Expected behavior |
| --- | --- |
| "migrate the account settings page to the new components" | enumerate legacy features, reconcile against the component map, emit horizontal slices with per-slice parity assertions, seed the parity ledger |
| a slice that only ships once a later slice also ships | rejected as a vertical layer; resequenced or split so each slice ships and tests on its own |
| a legacy feature with no new component in the map | recorded as an `unmapped` gap for a human to resolve; the planner does not invent a mapping |
| a slice merges and its code compiles | parity rows move to `migrated`, not `verified`; `verified` waits for an observed legacy-equivalence check |
| product wants to drop the legacy print stylesheet | allowed only as a `dropped` row with a recorded, approved reason; not silently omitted |
| "are we done migrating?" | complete only when every parity row is `verified` or `dropped` |

A regression here looks like: vertical slices presented as horizontal, parity rows reaching
`verified` on the strength of code existing rather than behavior, silently dropped legacy
features, or the planner writing inferred component mappings instead of flagging gaps.
Re-walk this table whenever `references/migration.md`, `references/planning.md`, or the
`agents/migrato-planner.md` role change.
