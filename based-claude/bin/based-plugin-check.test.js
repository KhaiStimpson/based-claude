const test = require("node:test");
const assert = require("node:assert/strict");
const { runScript } = require("./_test-lib");

test("the plugin passes its own structural and governance checks with no errors", () => {
  // No --root: based-plugin-check.js defaults to path.join(__dirname, ".."), i.e. this
  // plugin's own root. This is both a regression test and a self-validation step.
  const result = runScript("based-plugin-check.js", []);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.doesNotMatch(result.stdout, /## Errors/);
});

test("--scorecard prints the ten harness components with no gaps", () => {
  const result = runScript("based-plugin-check.js", ["--scorecard"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.doesNotMatch(result.stdout, /- gap:/, "harness scorecard should report no gaps against the plugin's own evidence");
});
