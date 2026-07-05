const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { tempRoot, runScript } = require("./_test-lib");

function write(root, rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

test("clean code produces no findings", () => {
  const root = tempRoot();
  write(
    root,
    "clean.js",
    [
      "function totalPrice(items) {",
      "  return items.reduce((sum, item) => sum + item.price, 0);",
      "}",
      "",
      "// Rounding matches the invoice service; see billing docs before changing.",
      "function roundCents(value) {",
      "  return Math.round(value * 100) / 100;",
      "}",
      "",
    ].join("\n")
  );
  const result = runScript("claudius-slop-check.js", ["--root", root, "clean.js"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /No slop findings/);
});

test("narration, placeholder, ai-phrase, and emoji are reported", () => {
  const root = tempRoot();
  write(
    root,
    "sloppy.js",
    [
      "// increment the counter",
      "counter += 1;",
      "// TODO: handle errors",
      "// This function is responsible for fetching users.",
      "const banner = 'launch \u{1F680}';",
      "",
    ].join("\n")
  );
  const result = runScript("claudius-slop-check.js", ["--root", root, "sloppy.js"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /narration/);
  assert.match(result.stdout, /placeholder/);
  assert.match(result.stdout, /ai-phrase/);
  assert.match(result.stdout, /emoji/);
});

test("--strict exits nonzero when findings exist", () => {
  const root = tempRoot();
  write(root, "sloppy.py", "# loop over the items\nfor item in items:\n    pass\n");
  const result = runScript("claudius-slop-check.js", ["--root", root, "--strict", "sloppy.py"]);
  assert.equal(result.status, 1, result.stdout + result.stderr);
});

test("why-comments and leading license blocks are not narration", () => {
  const root = tempRoot();
  write(
    root,
    "guarded.js",
    [
      "// Copyright example authors.",
      "// Licensed under MIT.",
      "",
      "// Returns null here because the upstream API omits the field on legacy accounts.",
      "function legacyField(payload) {",
      "  return payload.field ?? null;",
      "}",
      "",
    ].join("\n")
  );
  const result = runScript("claudius-slop-check.js", ["--root", root, "guarded.js"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /No slop findings/);
});

test("commented-out code blocks are reported once per run", () => {
  const root = tempRoot();
  write(
    root,
    "dead.js",
    [
      "// const legacy = loadLegacy();",
      "// legacy.apply(config);",
      "// legacy.flush();",
      "run(config);",
      "",
    ].join("\n")
  );
  const result = runScript("claudius-slop-check.js", ["--root", root, "dead.js"]);
  const findingLines = result.stdout.match(/^\s+\d+\s+commented-code/gm) || [];
  assert.equal(findingLines.length, 1, result.stdout);
});

test("comment-heavy files get a density finding", () => {
  const root = tempRoot();
  const lines = [];
  for (let i = 0; i < 8; i += 1) {
    lines.push(`value${i} = ${i}  # assign value ${i} for later use in the pipeline stage`);
  }
  write(root, "dense.py", `x = 0\n${lines.map((line) => `# ${line}`).join("\n")}\nresult = x\n`);
  const result = runScript("claudius-slop-check.js", ["--root", root, "dense.py"]);
  assert.match(result.stdout, /comment-density/);
});

test("markdown and unknown extensions are skipped", () => {
  const root = tempRoot();
  write(root, "notes.md", "Note that this is prose with a TODO and \u{1F389}.\n");
  const result = runScript("claudius-slop-check.js", ["--root", root, "notes.md"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /No slop findings/);
});

test("--diff checks only added lines", () => {
  const root = tempRoot();
  const git = (...args) => {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result;
  };
  git("init", "-q");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  write(root, "app.js", "// TODO: pre-existing debt\nconst existing = 1;\n");
  git("add", ".");
  git("commit", "-qm", "base");
  write(root, "app.js", "// TODO: pre-existing debt\nconst existing = 1;\n// increment the counter\nexisting += 1;\n");
  const result = runScript("claudius-slop-check.js", ["--root", root, "--diff"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /narration/);
  assert.equal(/pre-existing debt/.test(result.stdout), false, result.stdout);
});
