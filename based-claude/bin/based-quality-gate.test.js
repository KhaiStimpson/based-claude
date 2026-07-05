const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { tempRoot, runScript } = require("./_test-lib");

test("reports no candidates when there is no package.json", () => {
  const root = tempRoot();
  const result = runScript("based-quality-gate.js", ["--root", root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No validation candidates detected/);
});

test("--run executes a benign detected script and succeeds", () => {
  // The gate always shells out via "<pm> run <script-name>", not the raw script text, so
  // this exercises the real npm invocation path (requires npm on PATH, as any Node install
  // has). Use bare "node" rather than a quoted process.execPath: npm scripts execute
  // through the OS shell, and a quoted absolute path containing spaces (e.g. "C:\Program
  // Files\nodejs\node.exe") does not survive cmd.exe's own script-body quoting on Windows.
  const root = tempRoot();
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "fixture", scripts: { check: "node -e \"process.exit(0)\"" } }),
    "utf8"
  );
  const result = runScript("based-quality-gate.js", ["--run", "--root", root], { timeout: 60000 });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /completed successfully/);
});

