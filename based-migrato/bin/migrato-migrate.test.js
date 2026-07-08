const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { tempRoot, runScript } = require("./_test-lib");

function seedTree(root) {
  fs.mkdirSync(path.join(root, "legacy"), { recursive: true });
  fs.mkdirSync(path.join(root, "src/components"), { recursive: true });
  fs.writeFileSync(path.join(root, "legacy/profile.js"), "// legacy profile", "utf8");
  fs.writeFileSync(path.join(root, "legacy/avatar.js"), "// legacy avatar", "utf8");
  fs.writeFileSync(path.join(root, "src/components/ProfileForm.tsx"), "export const ProfileForm = () => null;", "utf8");
  fs.writeFileSync(path.join(root, "src/components/helpers.ts"), "export const x = 1;", "utf8");
}

test("migrato-migrate previews both files and writes nothing without --write", () => {
  const root = tempRoot();
  seedTree(root);
  const result = runScript("migrato-migrate.js", ["init", "--page", "Account", "--legacy", "legacy", "--new", "src/components", "--root", root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Component Map — Account/);
  assert.match(result.stdout, /Feature Parity — Account/);
  assert.ok(!fs.existsSync(path.join(root, ".migrato")), "nothing written without --write");
});

test("migrato-migrate --write creates map + ledger, scans surfaces, and seeds rows", () => {
  const root = tempRoot();
  seedTree(root);
  const result = runScript("migrato-migrate.js", [
    "init", "--write", "--page", "Account",
    "--legacy", "legacy", "--new", "src/components",
    "--rows", "Save profile|legacy/profile.js|<ProfileForm>|mapped|slice 1 ; Avatar upload|legacy/avatar.js||unmapped|gap",
    "--root", root,
  ]);
  assert.equal(result.status, 0, result.stderr);
  const dir = path.join(root, ".migrato/migration");
  const map = fs.readFileSync(path.join(dir, "component-map.md"), "utf8");
  const parity = fs.readFileSync(path.join(dir, "parity.md"), "utf8");
  // seeded rows land in the table
  assert.match(map, /Save profile .*<ProfileForm>.* mapped/);
  assert.match(map, /Avatar upload .* unmapped/);
  // discovered candidates: legacy files listed, only component-like new files listed
  assert.match(map, /legacy\/profile\.js/);
  assert.match(map, /ProfileForm\.tsx/);
  assert.ok(!map.includes("helpers.ts"), "non-component new files should not be listed as components");
  // parity ledger seeded and numbered from the same rows
  assert.match(parity, /\| 1 \| Save profile \| — \| mapped \|/);
  assert.match(parity, /\| 2 \| Avatar upload \| — \| unmapped \|/);
});

test("migrato-migrate does not overwrite an existing non-empty map without --force", () => {
  const root = tempRoot();
  seedTree(root);
  const dir = path.join(root, ".migrato/migration");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "component-map.md"), "# hand-written, keep me\n", "utf8");
  const result = runScript("migrato-migrate.js", ["init", "--write", "--page", "Account", "--root", root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /exists, skipped: .*component-map\.md/);
  assert.equal(fs.readFileSync(path.join(dir, "component-map.md"), "utf8"), "# hand-written, keep me\n");

  const forced = runScript("migrato-migrate.js", ["init", "--write", "--force", "--page", "Account", "--root", root]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(fs.readFileSync(path.join(dir, "component-map.md"), "utf8"), /Component Map — Account/);
});

test("migrato-migrate flags a missing legacy path instead of crashing", () => {
  const root = tempRoot();
  const result = runScript("migrato-migrate.js", ["init", "--page", "X", "--legacy", "does/not/exist", "--root", root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /path not found/);
});

test("migrato-migrate status counts ledger rows and reports incompleteness", () => {
  const root = tempRoot();
  runScript("migrato-migrate.js", [
    "init", "--write", "--page", "Account",
    "--rows", "A|s|<A>|verified|x ; B|s|<B>|migrated|y ; C|s||unmapped|gap ; D|s|<D>|dropped|out (ok)",
    "--root", root,
  ]);
  const result = runScript("migrato-migrate.js", ["status", "--root", root]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /2\/4 features verified or dropped \(50%\)/);
  assert.match(result.stdout, /verified: 1/);
  assert.match(result.stdout, /dropped: 1/);
  assert.match(result.stdout, /migrated: 1/);
  assert.match(result.stdout, /unmapped: 1/);
  assert.match(result.stdout, /Not complete: 2 feature/);
});

test("migrato-migrate status --json reports complete when all verified or dropped", () => {
  const root = tempRoot();
  runScript("migrato-migrate.js", [
    "init", "--write", "--page", "Account",
    "--rows", "A|s|<A>|verified|x ; B|s||dropped|out (ok)",
    "--root", root,
  ]);
  const result = runScript("migrato-migrate.js", ["status", "--json", "--root", root]);
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.total, 2);
  assert.equal(parsed.done, 2);
  assert.equal(parsed.complete, true);
});

test("migrato-migrate status exits non-zero when the ledger is missing", () => {
  const root = tempRoot();
  const result = runScript("migrato-migrate.js", ["status", "--root", root]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No parity ledger/);
});
