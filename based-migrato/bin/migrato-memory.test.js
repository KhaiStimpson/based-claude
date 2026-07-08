const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { tempRoot, runScript } = require("./_test-lib");

function fillPlaceholders(text) {
  // cardBody() leaves "How To Use" / "Failure Modes" / "Validation" as a bare "-" bullet.
  // Strict audit treats those as empty; fill them so promote() can pass the strict gate.
  return text.replace(/\n-\n/g, "\n- Filled in for test.\n");
}

test("new --write creates a governed draft with provenance and readers", () => {
  const root = tempRoot();
  const result = runScript("migrato-memory.js", [
    "new",
    "--title", "Test Card",
    "--scope", "repo",
    "--summary", "A summary.",
    "--evidence", "evidence-1",
    "--source", "test-source-1",
    "--write",
    "--root", root,
  ]);
  assert.equal(result.status, 0, result.stderr);
  const draftPath = path.join(root, ".migrato/memory/cards/drafts/test-card.md");
  assert.ok(fs.existsSync(draftPath), "draft file should exist");
  const text = fs.readFileSync(draftPath, "utf8");
  assert.match(text, /status: draft/);
  assert.match(text, /path_or_id: "test-source-1"/);
  assert.match(text, /allowed_readers:/);
});

test("promote requires --approved", () => {
  const root = tempRoot();
  runScript("migrato-memory.js", [
    "new", "--title", "Needs Approval", "--scope", "repo", "--summary", "Claim.",
    "--evidence", "e1", "--source", "s1", "--write", "--root", root,
  ]);
  const result = runScript("migrato-memory.js", ["promote", "needs-approval", "--root", root]);
  assert.notEqual(result.status, 0);
});

test("promote supersedes the draft: it moves to active and is removed from drafts", () => {
  const root = tempRoot();
  runScript("migrato-memory.js", [
    "new", "--title", "Promo Card", "--scope", "repo", "--summary", "Claim text.",
    "--evidence", "e1", "--source", "s1", "--write", "--root", root,
  ]);
  const draftPath = path.join(root, ".migrato/memory/cards/drafts/promo-card.md");
  assert.ok(fs.existsSync(draftPath));
  fs.writeFileSync(draftPath, fillPlaceholders(fs.readFileSync(draftPath, "utf8")), "utf8");

  const result = runScript("migrato-memory.js", ["promote", "promo-card", "--approved", "--root", root]);
  assert.equal(result.status, 0, result.stdout + result.stderr);

  const activePath = path.join(root, ".migrato/memory/cards/active/promo-card.md");
  assert.ok(fs.existsSync(activePath), "promoted card should exist in active/");
  assert.ok(!fs.existsSync(draftPath), "draft should no longer exist after promotion (regression: stale duplicate)");
});

test("retire supersedes the active card: it moves to retired and stops matching retrieve", () => {
  const root = tempRoot();
  runScript("migrato-memory.js", [
    "new", "--title", "Retire Card", "--scope", "repo", "--summary", "A retirable claim about widgets.",
    "--evidence", "e1", "--source", "s1", "--write", "--root", root,
  ]);
  const draftPath = path.join(root, ".migrato/memory/cards/drafts/retire-card.md");
  fs.writeFileSync(draftPath, fillPlaceholders(fs.readFileSync(draftPath, "utf8")), "utf8");
  runScript("migrato-memory.js", ["promote", "retire-card", "--approved", "--root", root]);
  const activePath = path.join(root, ".migrato/memory/cards/active/retire-card.md");
  assert.ok(fs.existsSync(activePath), "precondition: card must be active before retiring");

  const before = runScript("migrato-memory.js", ["retrieve", "--query", "widgets", "--root", root]);
  assert.match(before.stdout, /retire-card/, "precondition: retrieve should find the active card");

  const retireResult = runScript("migrato-memory.js", ["retire", "retire-card", "--approved", "--root", root]);
  assert.equal(retireResult.status, 0, retireResult.stdout + retireResult.stderr);

  const retiredPath = path.join(root, ".migrato/memory/cards/retired/retire-card.md");
  assert.ok(fs.existsSync(retiredPath), "retired copy should exist");
  assert.ok(!fs.existsSync(activePath), "active copy should no longer exist (regression: stale propagation)");

  const after = runScript("migrato-memory.js", ["retrieve", "--query", "widgets", "--root", root]);
  assert.doesNotMatch(after.stdout, /retire-card/, "retired card must no longer surface in retrieve");
});

test("audit --strict fails a card with empty required sections", () => {
  const root = tempRoot();
  runScript("migrato-memory.js", [
    "new", "--title", "Weak Card", "--scope", "repo", "--summary", "Claim.",
    "--evidence", "e1", "--source", "s1", "--write", "--root", root,
  ]);
  const result = runScript("migrato-memory.js", ["audit", "--strict", "--root", root]);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /FAIL/);
});

test("audit --recovery flags an active card that its own applies_when cues cannot find", () => {
  const root = tempRoot();
  const activeDir = path.join(root, ".migrato/memory/cards/active");
  fs.mkdirSync(activeDir, { recursive: true });

  const recoverable = `---
type: memory-card
title: "Recoverable Card"
scope: repo
status: active
created: 2026-01-01
updated: 2026-01-01
source:
  kind: user-statement
  path_or_id: "manual"
  captured_by: "test"
provenance:
  evidence:
    - "manual"
  derivation: "manual test fixture"
confidence: medium
applies_when:
  - "widget rendering"
does_not_apply_when: []
supersedes: []
superseded_by: []
retirement_condition: "never"
privacy:
  contains_sensitive_data: false
  allowed_readers:
    - "project"
---

# Recoverable Card

## Claim

Widgets use the shared rendering pipeline.
`;

  const unrecoverable = `---
type: memory-card
title: "Unrecoverable Card"
scope: repo
status: active
created: 2026-01-01
updated: 2026-01-01
source:
  kind: user-statement
  path_or_id: "manual"
  captured_by: "test"
provenance:
  evidence:
    - "manual"
  derivation: "manual test fixture"
confidence: medium
applies_when:
  - "zzz-unrelated-cue"
does_not_apply_when: []
supersedes: []
superseded_by: []
retirement_condition: "never"
privacy:
  contains_sensitive_data: false
  allowed_readers:
    - "project"
---

# Unrecoverable Card

## Claim

Something about database migrations.
`;

  fs.writeFileSync(path.join(activeDir, "recoverable-card.md"), recoverable, "utf8");
  fs.writeFileSync(path.join(activeDir, "unrecoverable-card.md"), unrecoverable, "utf8");

  const result = runScript("migrato-memory.js", ["audit", "--recovery", "--root", root]);
  assert.notEqual(result.status, 0, "overall audit should fail because one card is unrecoverable");
  assert.match(result.stdout, /OK\s+.*recoverable-card\.md recoverable/);
  assert.match(result.stdout, /FAIL\s+.*unrecoverable-card\.md: not recoverable/);
});
