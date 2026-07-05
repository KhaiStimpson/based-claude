const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { tempRoot, runScript } = require("./_test-lib");

test("claudius-plan prints to stdout and writes nothing without --write", () => {
  const root = tempRoot();
  const result = runScript("claudius-plan.js", ["--title", "no write plan", "--root", root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /# no write plan/i);
  assert.ok(!fs.existsSync(path.join(root, ".claudius")), "no files should be written without --write");
});

test("claudius-plan --write creates the full progressive bundle", () => {
  const root = tempRoot();
  const result = runScript("claudius-plan.js", [
    "--write", "--title", "auth refactor",
    "--objective", "Add OAuth support",
    "--tasks", "update login,add tests",
    "--validation", "npm test",
    "--root", root,
  ]);
  assert.equal(result.status, 0, result.stderr);
  const dir = path.join(root, ".claudius/plans/auth-refactor");
  for (const file of ["plan.md", "context.md", "tasks.md", "validation.md", "risks.md", "handoff.md"]) {
    assert.ok(fs.existsSync(path.join(dir, file)), `${file} should be written`);
  }
  const plan = fs.readFileSync(path.join(dir, "plan.md"), "utf8");
  assert.match(plan, /update login/);
});
