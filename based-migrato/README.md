# Based Migrato

Based Migrato is the migration-first member of the Based plugin family for Claude Code. It takes the full Based Claudius spine — the discover/plan/act/verify/review/handoff/improve router, artifact-backed state, deterministic validation, code-elegance review gates, governed memory, and gated self-improvement — and bakes a migration workflow into its planner.

The problem it exists for: you point it at a legacy page and say "migrate this." Migrato's planner enumerates the page's full feature set, reconciles it against a project-maintained legacy-to-new **component map**, and produces **horizontal, individually shippable and testable slices** rather than one undifferentiated rewrite. A living **feature-parity ledger** tracks every legacy behavior from `unmapped` to `verified`, so nothing is silently dropped. `references/migration.md` is the canonical contract for all of this.

The plugin intentionally avoids always-on hooks, monitors, MCP servers, and automatic writes. Enabling it changes the default Claude Code agent to `migrato-developer`; every script run and durable write is opt-in. `references/phase-gates.md` documents deterministic hook templates for users who want them — nothing installs them automatically.

## Design Commitments

- **Migration is the default task shape.** `/based-migrato:plan` decomposes a legacy page into horizontal slices — each independently shippable, independently testable, parity-bearing, and reversible — and never advances a feature to "verified" without an observed equivalence check. `references/migration.md` owns the slice bar and the parity ledger lifecycle.
- **One router, few commands.** `/based-migrato:work` routes through discover, plan, act, verify, review, handoff, and improve phases by task shape. Specialist commands exist for explicit modes, not as a parallel workflow.
- **Elegant code is a contract, not a vibe.** `references/code-style.md` defines the bar — local conventions win, comments only where code cannot say why, no speculative abstraction, no AI-tell debris — and `bin/migrato-slop-check.js` makes the mechanical part checkable. Review gates carry the judgment part.
- **Deterministic validation before semantic judgment.** The validation ladder starts at syntax and ends at independent review; completion claims need evidence.
- **Memory is governed data.** Cards carry scope, provenance, supersession, and retirement; promotion and retirement require approval and move the source file so stale claims stop matching retrieval.
- **Improvement is proposal-driven.** The skill radar spots repetition while working and proposes; nothing self-modifies. An optional scheduled radar recipe stays report-and-propose only.
- **Safety lives at the action boundary.** allow/warn/escalate/block classification, supply-chain review for skills and adapters, and untrusted-by-default tool output.

## Components

- `skills/` provide slash commands: `/based-migrato:work` (router), `/based-migrato:start`, `/based-migrato:init` (bootstrap the component map + parity ledger), `/based-migrato:plan`, `/based-migrato:check`, `/based-migrato:memory`, `/based-migrato:improve`, and `/based-migrato:handoff`.
- `agents/` provide the owner plus focused subagents: `migrato-developer` (default), `migrato-scout` (haiku), `migrato-planner` (opus), `migrato-repairer`, `migrato-validator`, `migrato-reviewer`, `migrato-safety`, `migrato-memory`, `migrato-improver`. Agents are thin role deltas over the canonical references — policy lives in one place.
- `references/` store the canonical contracts: **migration** (slice bar, parity ledger, file schemas), system contract, research basis, code style, delegation policy, validation ladder, review policy, safety policy, memory schema, trace schema, model contract, planning, diagnostic ledger, self-improvement, loop readiness, tool-adapter safety, phase gates, and the handoff template.
- `bin/` provides no-dependency Node helpers Claude runs from the Bash tool while the plugin is enabled.
- `fixtures/` document the guarantees this plugin claims and how each is proven.
- `settings.json` selects the Migrato Developer agent when the plugin is enabled.

## Test Locally

From this repository root, load the plugin for a development session:

```bash
claude --plugin-dir ./based-migrato
```

Then run `/reload-plugins` after edits and try `/based-migrato:start`. For shared distribution, this repository ships `.claude-plugin/marketplace.json`: run `/plugin marketplace add KhaiStimpson/based-claude` followed by `/plugin install based-migrato`.

## Day-To-Day Commands

```text
/based-migrato:work implement the requested change end to end
/based-migrato:start orient the project and choose a workflow
/based-migrato:plan design the change before editing
/based-migrato:check validate or review the current work
/based-migrato:memory draft or audit governed memory cards
/based-migrato:improve propose a reusable improvement from validated traces
/based-migrato:handoff create compact continuation state
```

## Migration Workflow

First, bootstrap the registries for the page — `/based-migrato:init` interviews you for the page name, the **before** (legacy) and **after** (new) folders to search, and a few example mappings, then scans both surfaces and writes the component map and parity ledger:

```text
/based-migrato:init set up the component map for the account settings page
```

Then point the planner at the page:

```text
/based-migrato:plan migrate the account settings page to the new component library
```

The planner will:

1. **Enumerate** the legacy page's full feature set — every behavior, edge case, empty/error state, permission, and side effect.
2. **Reconcile** that set against `.migrato/migration/component-map.md`, flagging features with no new component as `unmapped` gaps for a human to resolve.
3. **Slice** the page into horizontal, individually shippable and testable units (default: by user-facing capability), each naming the parity rows it brings over, its isolation mechanism, its own validation, and its rollback.
4. **Seed** `.migrato/migration/parity.md` from the enumeration so parity is tracked across the whole migration, not one plan.

### Project-maintained migration files

These two files live in **your** repository under `.migrato/migration/` and are edited by whoever runs the migration — the plugin ships only their schema and these examples, never a project's real mappings. Anyone can add or correct a row.

`component-map.md` — legacy feature → new component registry:

```markdown
# Component Map — Account Settings

| Legacy feature | Legacy source | New component | Status | Notes |
| --- | --- | --- | --- | --- |
| Save profile | legacy/profile.js | <ProfileForm> | migrated | slice 1 |
| Avatar upload | legacy/avatar.js | — | unmapped | no new component yet; gap |
| "Saved" toast | jquery flashMsg | <Toast> | verified | slice 1 |
| Print stylesheet | print.css | — | dropped | out of scope (approved: KS) |
```

`parity.md` — the living ledger, seeded by the planner and updated as slices land. Statuses run `unmapped → mapped → in-slice → migrated → verified` (plus `dropped` with a recorded reason). The migration is complete only when every row is `verified` or `dropped`; `migrated` means the code exists, `verified` means it behaves like the legacy feature.

Full policy — the slice bar, the ledger lifecycle, and the anti-patterns — lives in `references/migration.md`.

## CLI Helpers

All helpers resolve through `${CLAUDE_PLUGIN_ROOT}` so they work in any install; on current Claude Code versions the `bin/` shims are also on PATH.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-migrate.js" init --write  # scaffold the component map + parity ledger
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-doctor.js"          # compact project scan
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-quality-gate.js"    # list validation candidates (--run to execute)
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-slop-check.js" --diff  # mechanical code-style pass
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-plan.js" --write    # scaffold a .migrato/plans bundle
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-handoff.js"         # print or write an action-state handoff
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-trace.js" append    # append a compact action trace
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-memory.js" audit    # governed memory lifecycle
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-improve.js" suggest # gated improvement lifecycle
node "${CLAUDE_PLUGIN_ROOT}/bin/migrato-plugin-check.js"    # structural and governance self-check
```

## Runtime State

Durable workflow state lives under `.migrato/` in the target repository, written only by explicit command or helper invocation. Do not store secrets, credentials, raw transcripts, or private user data there — store compact action state: objective, files, evidence, decisions, validation, risks, next action.

## Validation

```bash
npm test          # bin behavior suite (node --test)
npm run check     # structural and governance self-check
npm run scorecard # harness component scorecard
```

`fixtures/README.md` maps each claimed guarantee to the test or review pass that proves it.

For the prompt-level guarantees that fixtures can only document — does the agent write code
that fits the host codebase, do the right skills trigger — the live behavioral suite in
[`../evals`](../evals/README.md) runs the real plugin in headless sessions against fixture
repositories and grades the diffs deterministically first, then with an independent judge.
It costs tokens and is run manually; `npm run eval:dry` exercises the whole pipeline for free.

## Relationship To The Siblings

Based Migrato is built on the full Based Claudius spine and adds the migration workflow on top; `based-claudius` remains the general-purpose flagship, and `based-claude`, `based-claudia`, and `based-claudista` remain the focused variants they always were. Reach for Migrato when the job is porting legacy pages to a new implementation and you want horizontal slicing plus feature-parity tracking; reach for Claudius for general production work. If you enable multiple siblings at once, note that each sets its own default agent and the last-enabled plugin wins.
