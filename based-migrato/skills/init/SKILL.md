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
   - **After (new) folders** to search — where the replacement lives.
   - **Stacks** — the before and after tech (e.g. WebForms + jQuery → .NET 8 + Razor). This tells you what a "feature" and a "component" mean here and which file extensions matter; a "new component" may be a Razor partial, a view component, an API endpoint, or a JS module, not just a SPA component.
   - **Example mappings** — a few known legacy-feature → new pairs to anchor the pattern. Optional but valuable.
2. Scan both surfaces with the repo tools (Glob/Grep), richer than a raw file list: in the legacy folders enumerate user-facing features, postbacks, event handlers, and behaviors; in the new folders enumerate what is available to map onto. For a .NET target the reusable "new component" units are usually **partial views** (`_*.cshtml`, often under `Shared/` or `Partials/`) and **custom tag helpers** (`class ... : TagHelper`, `[HtmlTargetElement(...)]`, used in markup as custom elements) — grep for those signals, not just file extensions. Read the examples the user gave to calibrate. The helper's file scan below is only a triage aid; this semantic enumeration is the real work.
3. Propose component-map rows: for each legacy feature, suggest a new mapping only when the after-surface plus the examples make it clear; otherwise mark it `unmapped` and note the gap. A reusable partial or tag helper often satisfies the same feature across several pages — that is one component appearing in several rows, which is expected. Never invent a confident mapping, and never silently drop a feature. Surface the proposed rows to the user before writing.
4. Write the files:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-migrate.js" init --write \
     --page "<page>" --legacy "<before paths, comma-separated>" --new "<after paths>" \
     --rows "feature|legacy source|new component|status|notes ; ..."
   ```

   The default scan covers common WebForms/.NET, server-template, and JS extensions. Tune it to your stack:
   - `--ext "aspx,ascx,master,cs,cshtml,razor,js"` — extensions for both surfaces.
   - `--component-ext "razor,cshtml"` — extensions for the after surface only.
   - `--component-glob "**/_*.cshtml,**/*TagHelper.cs"` — the after surface only, by glob, to isolate partial views and tag helpers from ordinary pages and controllers (`**` crosses directories; a pattern with no `/` matches the basename).

   The helper is idempotent — it will not overwrite an existing non-empty map or ledger without `--force`. It lists discovered files under a "Discovered Candidates" section for triage. Drop `--write` to preview.
5. Seed `parity.md` from the same feature enumeration (the helper does this from `--rows`); the migration is complete only when every parity row is `verified` or `dropped`.
6. Report mapped vs. unmapped counts and hand off to `/based-migrato:plan` to slice the page.

## Completion Bar

`.migrato/migration/component-map.md` and `parity.md` exist, every enumerated legacy feature is either mapped or flagged as an `unmapped` gap, and the user has seen the proposed mappings. A human owns the gaps and any `dropped` decisions.
