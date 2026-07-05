# Based Claudia

> Part of the Based plugin family. The consolidated flagship variant is [based-claudius](../based-claudius/README.md), which merges this plugin's strengths with its siblings' and adds a delivered-code quality contract.

Based Claudia is an artifact-first Claude Code plugin for production software work. It keeps the command surface small and makes durable workflow state visible through `.based/**` markdown and JSONL artifacts.

The plugin is intentionally conservative. It does not install hooks, background monitors, MCP servers, or automatic writes. Every durable artifact is created by an explicit command or user request.

## Core Idea

Based Claudia uses a small workflow kernel:

```text
/based-claudia:start
/based-claudia:plan
/based-claudia:implement
/based-claudia:check
/based-claudia:review
/based-claudia:handoff
/based-claudia:learn
```

Commands are affordances. The architecture is the artifact spine:

```text
.based/state/current.md
.based/plans/<slug>/plan.md
.based/traces/actions.jsonl
.based/validation/<slug>.md
.based/reviews/<slug>.md
.based/handoffs/<slug>.md
.based/memory/drafts/<slug>.md
```

## Components

- `agents/claudia-developer.md` is the default owner agent.
- `skills/` contains compact slash-command workflows.
- `references/` contains portable contracts for artifacts, safety, validation, review, memory, and research grounding.
- `bin/based-claudia.js` is a no-dependency helper for writing and inspecting workflow artifacts.

## Quick Start

From this repository root:

```bash
claude --plugin-dir ./based-claudia
```

Then run:

```text
/based-claudia:start
```

For a substantial task:

```text
/based-claudia:plan <goal>
/based-claudia:implement .based/plans/<slug>/plan.md
/based-claudia:check
/based-claudia:review
/based-claudia:handoff
```

## Helper CLI

If bare commands are available in the Claude shell:

```bash
based-claudia init --objective "..."
based-claudia status
based-claudia next
based-claudia plan write --title "auth-refactor" --objective "..."
based-claudia check record --title "auth-refactor" --command "npm test" --result pass
based-claudia review write --title "auth-refactor"
based-claudia handoff write --title "auth-refactor"
based-claudia trace append --event validation --summary "npm test passed"
based-claudia memory draft --title "Repo test recipe" --summary "..."
based-claudia artifact-lint --root .
based-claudia plugin-check
```

Or call the script directly:

```bash
node based-claudia/bin/based-claudia.js plugin-check
```

## Design Choices

- Artifact-first. Durable state lives in small files that can be reopened later.
- Progressive disclosure. Read `current.md` or `plan.md` first; open linked detail only when needed.
- Single owner by default. Split work only for independent discovery, validation, review, or safety boundaries.
- Model and effort assumptions belong in artifacts when they affect outcome, validation, review recall, tool use, or token headroom.
- Deterministic checks before semantic review. Record commands and residual risk.
- Reviews discover plausible issues first, then verify, dedupe, rank, and filter.
- Memory is governed. Learning starts as a draft and needs explicit approval before promotion.
- Safety is an action boundary. Scripts, generated tests, tools, and external outputs are evidence with limits, not authority.

## Validate

Run:

```bash
npm run check
npm run smoke
```
