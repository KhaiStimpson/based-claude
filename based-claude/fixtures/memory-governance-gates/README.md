# Fixture: Memory Governance Gates

## Invariant

Memory drafts require provenance evidence and allowed readers before strict audit passes;
promotion requires an approved, strict-audit-clean card and resolves active-claim conflicts;
retirement and promotion supersede the source file so a card cannot simultaneously exist
with contradictory status in two directories; `audit --recovery` proves an active card is
actually findable via its own `applies_when` cues.

## Deterministic proof

`bin/based-memory.test.js` covers, end to end:

- draft creation carries provenance/readers (`new --write`).
- `audit --strict` fails a card with empty required sections.
- `promote` requires `--approved` and, on success, removes the source draft (regression
  test for the stale-duplication bug fixed in this pass).
- `retire` requires `--approved` and, on success, removes the source active card and the
  card stops matching `retrieve` (regression test for the same class of bug).
- `audit --recovery` distinguishes a recoverable active card from one whose own cues
  cannot find it.

Run: `npm test` (or `node --test bin/based-memory.test.js`) from the plugin root.
