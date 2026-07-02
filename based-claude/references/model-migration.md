# Model Migration Contract

Use this reference when Claude model behavior, effort settings, model routing, tool use, token limits, or review recall may affect the workflow.

## Scope

Model-specific guidance is part of the harness contract, not scattered prompt decoration. Keep default skills compact and load this reference only when model behavior matters for coding, repair, planning, validation, review, tool use, or long-running agent work.

## Model Routing

Use model aliases, never dated model IDs; aliases track the latest snapshot when the harness upgrades.

- `inherit` / `sonnet` (latest): default for implementation, repair, validation, review, safety, memory, improvement, and minimization roles.
- `opus`: reserved for hard reasoning and planning — `based-planner` runs on it because it is only invoked when work is broad, ambiguous, or architectural.
- `haiku`: cheap read-only exploration — `based-scout` runs on it; keep haiku-facing prompts short, literal, and free of judgment calls.

If a dated model ID ever appears in this plugin, it is a bug; replace it with an alias and validate against the live harness.

## Claude Sonnet 5 Notes

These rules are based on medium-confidence vendor guidance plus local MAS wiki synthesis. Validate them against the live Claude Code environment before treating them as hard policy.

- Use high effort for ordinary implementation, repair, planning, and review. Reserve lower effort for narrow lookup, formatting, and clerical edits.
- Escalate to xhigh effort for hard debugging, broad architectural planning, safety-sensitive review, agentic tool-heavy work, and changes to validators, memory, policies, scripts, or trust boundaries. Agent frontmatter pins conservative defaults (`high` for owner/repair/review/safety roles, `medium` for scout/validator/memory/minimizer); escalate per invocation rather than raising the defaults.
- Treat `max_tokens` as shared headroom for hidden thinking, tool calls, and visible output. Long plans, broad reviews, trace summaries, and handoffs need explicit output-budget slack.
- Do not rely on implicit tool use. State when search, tests, schemas, local files, browsers, MCP tools, or external sources are required, and state what post-action evidence should be recorded.
- State scope literally when an instruction applies to every file, every finding, every generated artifact, the whole diff, or all repeated sections.
- Keep progress updates short and content-based. Avoid fixed tool-call update schedules unless the user explicitly needs that cadence.

## Review Migration Rule

For reviews, separate discovery from filtering:

1. Discovery pass: collect every plausible bug, regression, unsafe path, missing test, evaluator drift, or contract mismatch with evidence and confidence.
2. Verification pass: deduplicate, check evidence, classify severity, and reject unsupported findings.
3. Reporting pass: lead with verified findings ordered by severity, then residual risk and validation gaps.

Do not ask a reviewer to report only high-severity issues until after discovery, or recall may drop.

## Trace Fields

When model behavior affects the work, record compact trace fields such as:

- `model_assumption`
- `effort`
- `token_headroom`
- `tool_trigger`
- `review_stage`

These fields are evidence for later migration review, not automatic proof that the workflow was correct.
