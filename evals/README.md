# Based Claudius Evals

A live behavioral eval suite for the `based-claudius` plugin. It runs the real plugin in
headless Claude Code sessions against fixture repositories and grades the results — the layer
the plugin's own `fixtures/` explicitly cannot prove without a live model.

Two families, matching the two guarantees hardest to assert in prose:

- **code-quality** — can the agent deliver a change that fits the codebase? Each scenario is a
  small fixture repo with a distinctive convention plus a task. The diff is graded first by
  deterministic gates (fixture tests pass, `claudius-slop-check --strict` is clean, changes
  stayed in scope) and then by an independent LLM judge for the parts code cannot measure —
  style fit and restraint.
- **skill-activation** — do the right skills trigger on the right phrasings? Each row runs a
  prompt and records which plugin skills the model invoked. Hard rows assert a contract (a
  `disable-model-invocation` skill must never auto-fire; off-domain prompts trigger nothing).
  Advisory rows measure probabilistic auto-invocation of workflow skills and only surface in
  the report.

## Grading model

Deterministic-first, judge-second — the plugin's own validation ladder applied to itself:

1. Mechanical gates run against the produced diff (exit codes, expected files, tests). A hard
   gate failure fails the scenario before any model judgment.
2. An LLM judge scores only what code cannot (style fit, minimality), returns a structured
   `{pass, reasons}`, and its model identity is recorded in the report. The judge grades the
   diff and rubric, never the implementer's transcript — it is independent from the generator,
   per `references/validation-ladder.md`.

## Running

Requires the `claude` CLI on PATH (or `CLAUDE_CLI=/path/to/claude`). Live runs cost tokens;
this suite is manual by design — you are present and choose to pay per run.

```bash
npm run eval:dry          # no API calls: verify fixtures, discovery, baselines, report shape
npm run eval              # full suite (live sessions)
npm run eval:code         # code-quality family only
npm run eval:activation   # skill-activation family only
node run.js --scenario bugfix-terse    # one scenario
node run.js --keep        # leave fixture worktrees on disk for inspection
```

### Auth

Sessions run in `--bare` mode so only `based-claudius` loads — no other installed plugin,
hook, or CLAUDE.md can skew activation grading. Bare mode needs `ANTHROPIC_API_KEY`:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run eval
```

To use your interactive auth instead, set `CLAUDIUS_EVAL_NO_BARE=1` — but then locally
installed plugins may interfere with the skill-activation family. Override the session model
with `CLAUDIUS_EVAL_MODEL` (judge and implementer share it unless you change one).

## Reports

Each run writes `reports/<timestamp>/` with `report.md` (human-readable) and `results.json`
(machine-readable: per-scenario status, gates, judge verdict + model identity, cost). Reports
are gitignored.

Exit codes: `0` all pass, `1` a hard gate or judge failed, `3` a session was UNSTABLE
(crashed or the plugin did not load). Advisory misses never fail the suite.

## Scenario anatomy

A code-quality scenario is a directory under `scenarios/code-quality/<name>/`:

```text
scenario.json   task, baseline (tests-pass|tests-fail), gates, judge, allowedTools, maxTurns
fixture/        a self-contained repo; git-initialised into a temp worktree per run
judge.md        rubric handed to the independent judge with the diff
```

`gates` keys: `tests` (command that must exit 0 after the change), `slopStrict` (run
`claudius-slop-check --strict` on the staged diff), `allowedPaths` (change must stay within
these prefixes), `mustChange` (these prefixes must be touched). The baseline is verified before
every run so a drifting fixture is caught in `--dry-run` for free.

skill-activation lives in `scenarios/skill-activation/activation.json` as a table of
`{prompt, expect, advisory, why}` rows sharing one fixture. `expect: []` means no skill should
fire. Detection reads model-initiated `Skill` tool calls; user-typed slash commands are
expanded before the model runs and are out of scope.

## Adding a scenario

Drop a new directory under `scenarios/code-quality/` (the runner discovers it), or add a row to
`activation.json`. Keep fixtures tiny and give each a clear, distinctive convention — the eval
is only as sharp as the style signal in the fixture. Verify the baseline with `npm run eval:dry`
before spending tokens on a live run.
