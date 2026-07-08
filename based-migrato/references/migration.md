# Migration Contract

Based Migrato exists to migrate legacy pages to a new implementation without silent feature loss. This reference is the canonical policy for how a migration is planned, sliced, mapped, and tracked. The planner reads it first; the developer, validator, and reviewer read it when a task touches migration state.

The prompt is usually "migrate page X." The workflow's job is to turn that into a small set of **horizontal, individually shippable, individually testable slices** and to **prove feature parity** against the legacy page as each slice lands.

## Core Objects

Two files hold migration state. They are **repo-local runtime state**, authored and maintained by the people doing the migration — not shipped by this plugin. The plugin ships only their schema and the example below. They live under the migration project's repository:

```text
.migrato/migration/component-map.md   legacy feature -> new component registry (human-maintained)
.migrato/migration/parity.md          living feature-parity ledger (enumerated once, updated per slice)
```

If neither file exists yet, the planner offers to scaffold them from the schema below and populates the parity ledger from its legacy feature enumeration. It never invents component mappings — unmapped features are surfaced as gaps for a human to fill.

## Horizontal Slicing

A **horizontal slice** is a coherent portion of the page that can be migrated end to end, shipped behind whatever isolation the project already uses (feature flag, route split, strangler proxy), and tested on its own — independent of the other slices.

The planner decides the decomposition; there is no fixed rule. Sound defaults, strongest first:

1. **By user-facing capability.** One coherent thing the user can do on the page (search, filter, edit a record, export) migrated UI → logic → data. This is the default unit.
2. **By independently renderable region** when capabilities are entangled but the layout has natural seams (header, results table, detail panel).
3. **By data dependency** when capabilities share state — slice so each slice owns a testable read/write path rather than half of one.

Every slice must satisfy the **slice bar**:

- **Independently shippable** — can go to production without the other slices being done, via the project's declared isolation mechanism.
- **Independently testable** — has its own validation path that passes without the rest of the migration.
- **Parity-bearing** — names exactly which legacy features (rows in the component map) it brings to parity, with an explicit assertion for each.
- **Reversible** — can be turned off (flag/route) without breaking the legacy path that still serves the un-migrated slices.

Reject a slice that only makes sense once another slice also ships — that is a vertical layer, not a horizontal slice. Split or resequence instead.

## Feature-Parity Ledger

Parity is tracked for the **whole migration**, not one planning pass. The planner enumerates the legacy page's full feature set once — every user-visible behavior, edge case, empty/error state, permission, and side effect — and records each as a ledger row. Slices update rows; the ledger is the source of truth for "are we done."

Each row carries a status:

- `unmapped` — legacy feature has no new component yet (a gap; blocks calling the migration complete).
- `mapped` — a new component is assigned in the component map, not yet built.
- `in-slice` — assigned to a slice currently in flight.
- `migrated` — built and passing the slice's own checks.
- `verified` — behavior confirmed equivalent to legacy (parity assertion checked, not just "code exists").
- `dropped` — intentionally not carried over; requires an explicit human-approved reason recorded in the row.

The migration is complete only when every row is `verified` or `dropped`. `migrated` is not `verified`: it means the code exists, not that it behaves like the legacy feature. Never advance a row to `verified` on the strength of the code compiling or a slice merging — advance it only against an observed parity check.

The planner proposes ledger and map updates; it does not silently rewrite either file. A human owns `dropped` decisions and unmapped-gap resolutions.

## File Schemas

### `component-map.md`

A human-editable markdown table. Anyone on the migration can add or correct a row.

```markdown
# Component Map — <page name>

| Legacy feature | Legacy source | New component | Status | Notes |
| --- | --- | --- | --- | --- |
| Results table sort | LegacyGrid.sortBy | <DataTable sortable> | mapped | server-side sort, keep default column |
| Inline row edit | legacy/edit.js | — | unmapped | no new component yet; gap |
| CSV export | ExportButton | <ExportMenu format="csv"> | migrated | slice 2 |
| Flash "saved" toast | jquery flashMsg | replaced by <Toast> | verified | slice 1 |
| Print stylesheet | print.css | — | dropped | product decided out of scope (approved: KS) |
```

### `parity.md`

The living ledger. One row per legacy feature; the planner seeds it, slices update it.

```markdown
# Feature Parity — <page name>

Legacy source of truth: <url or path>. Enumerated: <date>.

| # | Legacy feature | Slice | Status | Parity assertion | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Flash "saved" toast | 1 | verified | toast shows on save, same copy | manual + toast.test |
| 2 | CSV export | 2 | migrated | exported CSV byte-equal to legacy for fixture | export.test |
| 3 | Inline row edit | — | unmapped | — | gap: needs component decision |
| 4 | Keyboard nav (arrows) | 3 | in-slice | arrow keys move selection like legacy | pending |
```

## Planner Output For A Migration

On top of the normal plan sections, a migration plan includes:

- **Legacy feature enumeration** — the full list, marked complete vs. inferred; this becomes/updates the parity ledger.
- **Component-map reconciliation** — which features map cleanly, which are `unmapped` gaps needing a human decision before their slice can proceed.
- **Slice sequence** — ordered slices, each with its parity-bearing feature list, isolation mechanism, independent validation path, and rollback.
- **Parity gate per slice** — the assertion that moves each row toward `verified`, and what evidence proves it.

## Anti-Patterns

- Vertical slices dressed as horizontal (a slice that can't ship or be tested until a later slice lands).
- Advancing parity rows to `verified` without an observed equivalence check.
- Silently dropping a legacy feature — every `dropped` row needs a recorded, approved reason.
- The planner writing component mappings it inferred rather than surfacing them as gaps for a human.
- Treating the ledger as a one-shot plan checklist instead of living migration state.
