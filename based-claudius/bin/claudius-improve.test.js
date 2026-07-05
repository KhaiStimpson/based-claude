const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { tempRoot, runScript } = require("./_test-lib");

// commandNeedsShell() in _lib.js blocks any command string containing shell
// metacharacters (including parens) unless --allow-shell is passed. Point at fixture
// scripts instead of `node -e "process.exit(0)"` so these commands exercise the normal
// (non-shell) execution path, matching how a real validation command usually looks.
const EXIT0 = path.join(__dirname, "__fixtures__", "exit-0.js");
const EXIT1 = path.join(__dirname, "__fixtures__", "exit-1.js");
const PASS_CMD = `node "${EXIT0}"`;
const FAIL_CMD = `node "${EXIT1}"`;

test("propose --write creates a proposal with rollback and retirement fields", () => {
  const root = tempRoot();
  const result = runScript("claudius-improve.js", [
    "propose",
    "--title", "Fix example",
    "--problem", "Something is wrong.",
    "--change", "Do the fix.",
    "--evidence", "trace-1",
    "--write",
    "--root", root,
  ]);
  assert.equal(result.status, 0, result.stderr);
  const proposalPath = path.join(root, ".claudius/improvements/proposals/fix-example.md");
  assert.ok(fs.existsSync(proposalPath));
  const text = fs.readFileSync(proposalPath, "utf8");
  assert.match(text, /rollback:/);
  assert.match(text, /retirement_condition:/);
});

test("promote requires --approved", () => {
  const root = tempRoot();
  runScript("claudius-improve.js", [
    "propose", "--title", "Needs Approval", "--problem", "p", "--change", "c", "--evidence", "e", "--write", "--root", root,
  ]);
  const result = runScript("claudius-improve.js", ["promote", "needs-approval", "--root", root]);
  assert.notEqual(result.status, 0);
});

test("promote refuses without a passing evaluation", () => {
  const root = tempRoot();
  runScript("claudius-improve.js", [
    "propose", "--title", "No Eval", "--problem", "p", "--change", "c", "--evidence", "e", "--write", "--root", root,
  ]);
  const result = runScript("claudius-improve.js", ["promote", "no-eval", "--approved", "--root", root]);
  assert.notEqual(result.status, 0);
});

test("a passing evaluation plus promote accepts a proposal with no risky target", () => {
  const root = tempRoot();
  runScript("claudius-improve.js", [
    "propose", "--title", "Docs Tweak", "--problem", "p", "--change", "reword a paragraph", "--evidence", "e",
    "--target", "README.md", "--write", "--root", root,
  ]);
  const evalResult = runScript("claudius-improve.js", [
    "evaluate", "docs-tweak", "--command", PASS_CMD, "--write", "--root", root,
  ]);
  assert.equal(evalResult.status, 0, evalResult.stdout + evalResult.stderr);

  const promoteResult = runScript("claudius-improve.js", ["promote", "docs-tweak", "--approved", "--root", root]);
  assert.equal(promoteResult.status, 0, promoteResult.stdout + promoteResult.stderr);
  assert.ok(fs.existsSync(path.join(root, ".claudius/improvements/accepted/docs-tweak.md")));
});

test("a failing evaluation blocks promotion", () => {
  const root = tempRoot();
  runScript("claudius-improve.js", [
    "propose", "--title", "Broken Change", "--problem", "p", "--change", "c", "--evidence", "e",
    "--target", "README.md", "--write", "--root", root,
  ]);
  const evalResult = runScript("claudius-improve.js", [
    "evaluate", "broken-change", "--command", FAIL_CMD, "--write", "--root", root,
  ]);
  assert.notEqual(evalResult.status, 0);

  const promoteResult = runScript("claudius-improve.js", ["promote", "broken-change", "--approved", "--root", root]);
  assert.notEqual(promoteResult.status, 0);
});

test("evaluate --command blocks shell metacharacters without --allow-shell, and runs them with it", () => {
  const root = tempRoot();
  runScript("claudius-improve.js", [
    "propose", "--title", "Shell Check", "--problem", "p", "--change", "c", "--evidence", "e", "--write", "--root", root,
  ]);
  const blocked = runScript("claudius-improve.js", [
    "evaluate", "shell-check", "--command", "echo a && echo b", "--write", "--root", root,
  ]);
  assert.notEqual(blocked.status, 0, "should fail closed rather than silently invoking a shell");
  assert.match(blocked.stdout + blocked.stderr, /allow-shell/);

  const allowed = runScript("claudius-improve.js", [
    "evaluate", "shell-check", "--command", "echo a && echo b", "--allow-shell", "--write", "--root", root,
  ]);
  assert.equal(allowed.status, 0, allowed.stdout + allowed.stderr);
});

test("a proposal touching a script or hook requires independent review before promotion", () => {
  const root = tempRoot();
  runScript("claudius-improve.js", [
    "propose", "--title", "Hook Change", "--problem", "p", "--change", "Add a PreToolUse hook.", "--evidence", "e",
    "--target", "hooks/hooks.json", "--write", "--root", root,
  ]);
  runScript("claudius-improve.js", ["evaluate", "hook-change", "--command", PASS_CMD, "--write", "--root", root]);

  const blocked = runScript("claudius-improve.js", ["promote", "hook-change", "--approved", "--root", root]);
  assert.notEqual(blocked.status, 0, "should require independent review for a hook-touching change");

  const reviewed = runScript("claudius-improve.js", [
    "promote", "hook-change", "--approved", "--reviewed", "--review-evidence", "manual review notes", "--root", root,
  ]);
  assert.equal(reviewed.status, 0, reviewed.stdout + reviewed.stderr);
});
