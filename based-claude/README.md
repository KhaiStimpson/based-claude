# Based Claude

> Part of the Based plugin family. The consolidated flagship variant is [based-claudius](../based-claudius/README.md), which merges this plugin's strengths with its siblings' and adds a delivered-code quality contract.

Based Claude is a Claude Code plugin for production-grade software work. It packages the local MAS Research Wiki into a practical developer workflow: progressive context loading, single-owner execution by default, focused subagent roles when isolation helps, deterministic validation before semantic judgment, explicit safety boundaries, governed memory cards, and compact handoffs.

The plugin intentionally avoids always-on hooks, monitors, MCP servers, or automatic writes. Enabling it changes the default Claude Code agent to `based-developer`; every script and durable memory write is opt-in. `references/phase-gates.md` documents optional deterministic hook templates for users who want them — nothing in the plugin installs them automatically.

## Components

- `skills/` provide slash commands: `/based-claude:start`, `/based-claude:explore`, `/based-claude:code`, `/based-claude:plan`, `/based-claude:plan-file`, `/based-claude:repair`, `/based-claude:validate`, `/based-claude:review`, `/based-claude:safety`, `/based-claude:trace`, `/based-claude:memory`, `/based-claude:improve`, `/based-claude:minimize`, and `/based-claude:handoff`.
- `agents/` provide focused subagents for exploration, planning, implementation, repair, validation, review, safety, memory curation, self-improvement, and minimization. Model routing: Sonnet by default, Opus for the planner, Haiku for the scout (see `references/model-migration.md`).
- `bin/` provides no-dependency Node tools that Claude can run from the Bash tool while the plugin is enabled.
- `references/` stores the canonical research basis (including the delegation evidence appendix), model-migration contract with model routing, planning intake protocol, progressive plan artifact contract, delegation policy and role map, validation ladder, loop readiness checks, tool-adapter safety checks, fresh-review rules, memory schema, safety policy, diagnostic ledger, trace schema, project scan schema, and handoff template.
- `settings.json` selects the Based Developer agent when the plugin is enabled.

## Test Locally

From this repository root, load the plugin for a development session:

```bash
claude --plugin-dir ./based-claude
```

Then run `/reload-plugins` after edits and try `/based-claude:start`.

For persistent personal loading without a marketplace, place the plugin folder under your personal Claude skills directory as a skills-directory plugin. For shared distribution, this repository ships `.claude-plugin/marketplace.json`: run `/plugin marketplace add KhaiStimpson/based-claude` followed by `/plugin install based-claude`.

## Day-To-Day Commands

Use the commands directly when you want a specific operating mode:

```text
/based-claude:start orient the project and choose a workflow
/based-claude:explore gather read-only repository evidence
/based-claude:code implement the requested change end to end
/based-claude:plan design the change before editing
/based-claude:plan-file write a progressive markdown plan bundle for implementation
/based-claude:repair diagnose and fix this failing test
/based-claude:validate run the smallest meaningful checks
/based-claude:review review the diff for bugs and regressions
/based-claude:safety inspect action boundaries and data movement
/based-claude:trace record compact action-state evidence
/based-claude:memory draft a governed memory card from this validated trace
/based-claude:improve propose a reusable improvement from validated evidence
/based-claude:minimize remove avoidable complexity without weakening safeguards
/based-claude:handoff create an action-state handoff
```

For planning, start with the smallest useful prompt:

```text
/based-claude:plan <goal>
```

Add what success looks like and any hard constraints when you know them. The planner may ask a few intent questions, inspect the repository, then ask sharper follow-ups only when the answer changes the plan. There is no separate grill-me command; guided intake lives inside `/based-claude:plan`.

Use `/based-claude:plan-file <goal>` when the output should become markdown files for a developer. It writes an opt-in progressive bundle under `.based/plans/<slug>/` with `plan.md` as the short entrypoint and linked detail files for context, tasks, validation, risks, and handoff. Normal `/based-claude:plan` remains chat-only.

The skills are also discoverable by Claude when the request matches their descriptions.

## CLI Helpers

These helpers are intentionally conservative. They print evidence and suggestions by default; commands that write files or run validation suites require explicit flags.

Inside a Claude Code session with the plugin enabled, `bin/` is not on `PATH` — invoke helpers through the plugin-root variable so they resolve regardless of install location:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/based-doctor.js"
node "${CLAUDE_PLUGIN_ROOT}/bin/based-quality-gate.js"
node "${CLAUDE_PLUGIN_ROOT}/bin/based-quality-gate.js" --run
node "${CLAUDE_PLUGIN_ROOT}/bin/based-quality-gate.js" --run --allow-shell
node "${CLAUDE_PLUGIN_ROOT}/bin/based-plan.js" --write --title "auth-refactor" --objective "..." --tasks "..." --validation "npm test"
node "${CLAUDE_PLUGIN_ROOT}/bin/based-handoff.js"
node "${CLAUDE_PLUGIN_ROOT}/bin/based-handoff.js" --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-trace.js" append --objective "..." --event validation --summary "..." --validation pass
node "${CLAUDE_PLUGIN_ROOT}/bin/based-memory.js" audit --strict
node "${CLAUDE_PLUGIN_ROOT}/bin/based-memory.js" suggest --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-memory.js" new --title "Repo test recipe" --scope repo --summary "..." --evidence "..."
node "${CLAUDE_PLUGIN_ROOT}/bin/based-memory.js" promote repo-test-recipe --approved --supersession-reviewed
node "${CLAUDE_PLUGIN_ROOT}/bin/based-memory.js" retrieve --query "test recipe" --scope repo,user
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" suggest --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" evaluate proposal-slug --command "npm run check" --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" review proposal-slug --verdict approve --evidence "review artifact or reviewer notes" --write
node "${CLAUDE_PLUGIN_ROOT}/bin/based-improve.js" promote proposal-slug --approved
node "${CLAUDE_PLUGIN_ROOT}/bin/based-plugin-check.js"
node "${CLAUDE_PLUGIN_ROOT}/bin/based-plugin-check.js" --scorecard
```

Local development (this repository root, plugin not installed) or any shell with `based-claude/bin` on `PATH`, or after `npm link` in `based-claude/` (the `package.json` `bin` field maps each short name to its script), can use the shorter form instead: `based-doctor`, `based-quality-gate`, `based-plan`, `based-handoff`, `based-trace`, `based-memory`, `based-improve`, `based-plugin-check` — all skill and agent prompts in this plugin default to the `${CLAUDE_PLUGIN_ROOT}` form because it is the only one guaranteed to work in an installed plugin.

## Design Choices

- Single owner first. Subagent roles are used only for context isolation, parallel search, independent review, or trust-boundary separation.
- Dynamic workflow selection is automatic. The main agent decides whether to work directly or delegate based on task shape, uncertainty, risk, and validation needs.
- Recurring or autonomous loops must earn autonomy through readiness checks: state, cadence, budgets, attempt caps, maker/checker split, human gates, run logs, rollback, and kill criteria.
- Plan files are opt-in. `/based-claude:plan-file` writes progressive markdown bundles under `.based/plans/**`; `/based-claude:plan` stays chat-only.
- Workflow tracing is selective. The main agent records a compact `workflow` trace only when delegation happens or when broad/risky work intentionally stays direct.
- Structured handoffs instead of transcript replay. Return objective, files, decisions, evidence, validation, risks, and next action.
- Validation starts with executable checks. Semantic review is used after deterministic evidence where possible.
- Model migration is part of the harness contract. Effort, token headroom, literal scope, progress updates, tool triggers, and review recall are checked when model behavior matters.
- Fresh review starts from objective, diff, tests, validation, and contracts rather than the implementer's reasoning transcript. Broad reviews discover plausible issues first, then verify, rank, dedupe, and filter.
- Durable memory is governed. Cards need scope, provenance, supersession, confidence, and retirement conditions.
- Self-improvement is proposal-driven. Traces can draft memory and improvement candidates, but promotion requires approval, validation, rollback notes, and independent review for evaluator, safety, memory-policy, executable-script, or trust-boundary changes.
- Safety is an action boundary. Scripts, skills, tool calls, generated tests, and memory writes are treated as artifacts to review, not as authority. Live tool adapters should prefer read-only construction, disabled-by-default writes, confirmation gates, proof-after-write, quarantine, and sanitized external output.
- Minimization is guarded. Avoid overproduction, but never remove security controls, data-loss protection, accessibility, explicit requirements, or project-required validation.

## Validate The Plugin

Run from this repository root:

```bash
node based-claude/bin/based-plugin-check.js
node based-claude/bin/based-plugin-check.js --scorecard
npm --prefix based-claude test
```

If Claude Code is available, also run:

```bash
claude plugin validate ./based-claude
```
