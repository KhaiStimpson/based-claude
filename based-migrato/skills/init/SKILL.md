---
name: init
description: Bootstrap the migration component map and parity ledger for a legacy page. Interviews for the page name, the before (legacy) and after (new) folders to search, and a few example mappings, then scans both surfaces and writes .migrato/migration/component-map.md and parity.md.
when_to_use: Use once per migration, before planning slices, to stand up the legacy-to-new component map and feature-parity ledger. Trigger on "init migration", "set up the component map", or starting a new page migration with no map yet.
---

# Migrato Init

Stand up the two human-maintained migration registries so `/based-migrato:plan` has something to reconcile against. This writes files under `.migrato/migration/` — an explicit, opt-in action.

## Read First

- `../../references/migration.md` — component-map and parity-ledger schemas, statuses, and the never-invent-a-mapping rule.

## Workflow

1. Interview for what only the user knows. Prefer `AskUserQuestion` with recommended defaults; ask only what you cannot discover:
   - **Page/area** being migrated (names the files).
   - **Before (legacy) folders** to search — one or more paths.
   - **After (new) folders** to search — where replacement components live.
   - **Example mappings** — a few known legacy-feature → new-component pairs to anchor the pattern. Optional but valuable.
2. Scan both surfaces with the repo tools (Glob/Grep), richer than a raw file list: in the legacy folders enumerate user-facing features, routes, handlers, and behaviors; in the new folders enumerate the reusable components available to map onto. Read the examples the user gave to calibrate what a "feature" and a "component" mean in this codebase.
3. Propose component-map rows: for each legacy feature, suggest a new component only when the after-surface plus the examples make the mapping clear; otherwise mark it `unmapped` and note the gap. Never invent a confident mapping, and never silently drop a feature. Surface the proposed rows to the user before writing.
4. Write the files:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-migrate.js" init --write \
     --page "<page>" --legacy "<before paths, comma-separated>" --new "<after paths>" \
     --rows "feature|legacy source|new component|status|notes ; ..."
   ```

   The helper is idempotent — it will not overwrite an existing non-empty map or ledger without `--force`. It also lists discovered candidate files under a "Discovered Candidates" section for triage. Drop `--write` to preview.
5. Seed `parity.md` from the same feature enumeration (the helper does this from `--rows`); the migration is complete only when every parity row is `verified` or `dropped`.
6. Report mapped vs. unmapped counts and hand off to `/based-migrato:plan` to slice the page.

## Completion Bar

`.migrato/migration/component-map.md` and `parity.md` exist, every enumerated legacy feature is either mapped or flagged as an `unmapped` gap, and the user has seen the proposed mappings. A human owns the gaps and any `dropped` decisions.
