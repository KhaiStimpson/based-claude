# Based Claudius

Based Claudius is the consolidated flagship of the Based plugin family for Claude Code. It merges the three sibling plugins into one production workflow: based-claudista's router entrypoint, based-claudia's artifact-backed state, and based-claude's reference depth, governed memory, and gated self-improvement — plus a delivered-code quality contract the family previously only implied.

The plugin intentionally avoids always-on hooks, monitors, MCP servers, and automatic writes. Enabling it changes the default Claude Code agent to `claudius-developer`; every script run and durable write is opt-in. `references/phase-gates.md` documents deterministic hook templates for users who want them — nothing installs them automatically.

## Design Commitments

- **One router, few commands.** `/based-claudius:work` routes through discover, plan, act, verify, review, handoff, and improve phases by task shape. Specialist commands exist for explicit modes, not as a parallel workflow.
- **Elegant code is a contract, not a vibe.** `references/code-style.md` defines the bar — local conventions win, comments only where code cannot say why, no speculative abstraction, no AI-tell debris — and `bin/claudius-slop-check.js` makes the mechanical part checkable. Review gates carry the judgment part.
- **Deterministic validation before semantic judgment.** The validation ladder starts at syntax and ends at independent review; completion claims need evidence.
- **Memory is governed data.** Cards carry scope, provenance, supersession, and retirement; promotion and retirement require approval and move the source file so stale claims stop matching retrieval.
- **Improvement is proposal-driven.** The skill radar spots repetition while working and proposes; nothing self-modifies. An optional scheduled radar recipe stays report-and-propose only.
- **Safety lives at the action boundary.** allow/warn/escalate/block classification, supply-chain review for skills and adapters, and untrusted-by-default tool output.

## Components

- `skills/` provide slash commands: `/based-claudius:work` (router), `/based-claudius:start`, `/based-claudius:plan`, `/based-claudius:check`, `/based-claudius:memory`, `/based-claudius:improve`, and `/based-claudius:handoff`.
- `agents/` provide the owner plus focused subagents: `claudius-developer` (default), `claudius-scout` (haiku), `claudius-planner` (opus), `claudius-repairer`, `claudius-validator`, `claudius-reviewer`, `claudius-safety`, `claudius-memory`, `claudius-improver`. Agents are thin role deltas over the canonical references — policy lives in one place.
- `references/` store the canonical contracts: system contract, research basis, code style, delegation policy, validation ladder, review policy, safety policy, memory schema, trace schema, model contract, planning, diagnostic ledger, self-improvement, loop readiness, tool-adapter safety, phase gates, and the handoff template.
- `bin/` provides no-dependency Node helpers Claude runs from the Bash tool while the plugin is enabled.
- `fixtures/` document the guarantees this plugin claims and how each is proven.
- `settings.json` selects the Claudius Developer agent when the plugin is enabled.

## Test Locally

From this repository root, load the plugin for a development session:

```bash
claude --plugin-dir ./based-claudius
```

Then run `/reload-plugins` after edits and try `/based-claudius:start`. For shared distribution, this repository ships `.claude-plugin/marketplace.json`: run `/plugin marketplace add KhaiStimpson/based-claude` followed by `/plugin install based-claudius`.

## Day-To-Day Commands

```text
/based-claudius:work implement the requested change end to end
/based-claudius:start orient the project and choose a workflow
/based-claudius:plan design the change before editing
/based-claudius:check validate or review the current work
/based-claudius:memory draft or audit governed memory cards
/based-claudius:improve propose a reusable improvement from validated traces
/based-claudius:handoff create compact continuation state
```

## CLI Helpers

All helpers resolve through `${CLAUDE_PLUGIN_ROOT}` so they work in any install; on current Claude Code versions the `bin/` shims are also on PATH.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-doctor.js"          # compact project scan
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-quality-gate.js"    # list validation candidates (--run to execute)
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-slop-check.js" --diff  # mechanical code-style pass
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-plan.js" --write    # scaffold a .claudius/plans bundle
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-handoff.js"         # print or write an action-state handoff
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-trace.js" append    # append a compact action trace
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-memory.js" audit    # governed memory lifecycle
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-improve.js" suggest # gated improvement lifecycle
node "${CLAUDE_PLUGIN_ROOT}/bin/claudius-plugin-check.js"    # structural and governance self-check
```

## Runtime State

Durable workflow state lives under `.claudius/` in the target repository, written only by explicit command or helper invocation. Do not store secrets, credentials, raw transcripts, or private user data there — store compact action state: objective, files, evidence, decisions, validation, risks, next action.

## Validation

```bash
npm test          # bin behavior suite (node --test)
npm run check     # structural and governance self-check
npm run scorecard # harness component scorecard
```

`fixtures/README.md` maps each claimed guarantee to the test or review pass that proves it.

## Relationship To The Siblings

`based-claude`, `based-claudia`, and `based-claudista` remain available in this marketplace as the focused variants they always were. Based Claudius is where consolidation and new capability land first. If you enable multiple siblings at once, note that each sets its own default agent and the last-enabled plugin wins.
