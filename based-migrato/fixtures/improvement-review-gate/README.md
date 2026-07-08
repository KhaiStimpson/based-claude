# Fixture: Improvement Review Gate

## Invariant

Promotion of an improvement proposal requires a passing evaluation; a proposal whose
target or description touches an evaluator, validator, safety policy, memory policy,
credential, permission, executable script, hook, or MCP surface additionally requires
independent review (an approved `review` record or explicit `--reviewed
--review-evidence`) before promotion succeeds.

## Deterministic proof

`bin/migrato-improve.test.js` covers:

- `promote` requires `--approved`.
- `promote` refuses without a passing `evaluate` record.
- a failing evaluation blocks promotion even with `--approved`.
- a proposal targeting `hooks/hooks.json` is blocked from promotion until independent
  review evidence is supplied, then succeeds.
- `evaluate --command` fails closed on shell metacharacters without `--allow-shell`, and
  runs with it.

Run: `npm test` (or `node --test bin/migrato-improve.test.js`) from the plugin root.
