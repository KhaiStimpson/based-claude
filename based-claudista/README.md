# Based Claudista

Based Claudista is a Claude Code plugin built as a workflow control plane instead of a large set of equally important commands. The normal entrypoint is `/based-claudista:work`; it routes the task through discover, plan, act, verify, review, handoff, memory, or improvement phases based on task shape.

The design is grounded in the local MAS Research Wiki: smallest adequate topology, compact action state, deterministic validation before semantic judgment, governed memory, explicit loop modes, and trace-derived improvement with rollback.

## Command Surface

Use the main router most of the time:

```text
/based-claudista:work implement the requested change end to end
```

Use a specialist command when the desired mode is explicit:

```text
/based-claudista:plan design the change before editing
/based-claudista:check validate or review the current work
/based-claudista:memory draft or audit governed memory cards
/based-claudista:improve propose a reusable improvement from validated traces
/based-claudista:handoff create compact continuation state
```

## Runtime State

Based Claudista writes only when a command or helper is explicitly invoked. Runtime artifacts live under `.based-claudista/` in the target repository:

```text
.based-claudista/
  runs/
  traces/actions.jsonl
  memory/cards/
  improvements/
  handoffs/
  plans/
```

Do not store secrets, credentials, private keys, customer data, or raw transcripts in those files. Store compact action state: objective, files, evidence, decisions, validation, risks, and next action.

## Loop Modes

- `manual`: ordinary human-triggered task work.
- `L1 report-only`: recurring triage may write state and reports but does not modify product files.
- `L2 assisted-fix`: small fixes are allowed only with validation, reviewer separation, protected paths, and human gates.
- `L3 unattended`: intentionally not a default plugin mode. It requires explicit external approval, isolation, budgets, kill criteria, and permanent human review for merge, deploy, delete, or irreversible data movement.

## Local Helpers

Run from the plugin folder or through `npm --prefix based-claudista run <script>`:

```bash
node bin/claudista-check.js
node bin/claudista-doctor.js --root ..
node bin/claudista-quality-gate.js --root .. --run
node bin/claudista-trace.js append --root .. --objective "..." --event validation --summary "npm test passed" --validation pass
node bin/claudista-trace.js append --root .. --objective "..." --event workflow --summary "L2 fix routed" --contribution-role decisive_progress --effort high
node bin/claudista-memory.js audit --root ..
node bin/claudista-improve.js suggest --root .. --title "validation routing" --summary "..."
node bin/claudista-handoff.js --root .. --objective "..."
```

`claudista-quality-gate` prints validation candidates by default. It runs commands only with `--run`, and shell syntax requires `--allow-shell`.

## Validate The Plugin

```bash
npm --prefix based-claudista run check
```

If Claude Code is available:

```bash
claude plugin validate ./based-claudista --strict
```

## Design Boundaries

- One owner keeps global state and completion criteria.
- Subagents are used only for context isolation, independent validation, independent review, repair diagnosis, or safety separation.
- The router records phase, effort, tool-trigger, and contribution-role decisions when they affect cost, recall, safety, or validation.
- Durable memory is scoped, provenance-bearing, supersedable, and reviewable.
- Self-improvement is proposal-driven: trace, propose, validate, review, promote, and preserve rollback notes.
- Guarded minimization removes avoidable complexity only after behavior and validation are understood.
