#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { parseArgs, readJson, readText, parseFrontmatter, wordCount, walk } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root || path.join(__dirname, ".."));
const errors = [];
const warnings = [];

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function requireFile(file, label) {
  if (!fs.existsSync(file)) errors.push(`Missing ${label}: ${rel(file)}`);
}

function requireDir(dir, label) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) errors.push(`Missing ${label}: ${rel(dir)}`);
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(dir, entry.name));
}

function checkFrontmatter(file, fields) {
  const meta = parseFrontmatter(readText(file));
  for (const field of fields) {
    if (!meta[field]) errors.push(`${rel(file)} missing frontmatter field: ${field}`);
  }
  return meta;
}

function checkJson(file) {
  const value = readJson(file);
  if (value.__error) errors.push(`${rel(file)} invalid JSON: ${value.__error}`);
  return value;
}

const manifestPath = path.join(root, ".claude-plugin", "plugin.json");
requireFile(manifestPath, "plugin manifest");
const manifest = fs.existsSync(manifestPath) ? checkJson(manifestPath) : {};
if (manifest.name !== "based-claudista") errors.push("plugin.json name must be based-claudista");
if (!manifest.version) errors.push("plugin.json missing version");
if (!manifest.description) errors.push("plugin.json missing description");

requireFile(path.join(root, "README.md"), "README");
requireFile(path.join(root, "settings.json"), "settings");
requireFile(path.join(root, "package.json"), "package manifest");
requireDir(path.join(root, "agents"), "agents directory");
requireDir(path.join(root, "skills"), "skills directory");
requireDir(path.join(root, "core"), "core directory");
requireDir(path.join(root, "references"), "references directory");
requireDir(path.join(root, "bin"), "bin directory");

const settings = fs.existsSync(path.join(root, "settings.json")) ? checkJson(path.join(root, "settings.json")) : {};
if (!settings.agent) errors.push("settings.json missing default agent");
if (settings.agent) requireFile(path.join(root, "agents", `${settings.agent}.md`), `default agent ${settings.agent}`);

for (const ref of [
  "system-contract.md",
  "research-basis.md",
  "validation-ladder.md",
  "state-contract.md",
  "loop-modes.md",
  "memory-governance.md",
  "self-improvement.md",
  "handoff-template.md",
]) {
  requireFile(path.join(root, "references", ref), `reference ${ref}`);
}

for (const schema of ["action-trace.schema.json", "memory-card.schema.json", "workflow-run.schema.json"]) {
  checkJson(path.join(root, "core", "schemas", schema));
}

for (const skill of ["work", "plan", "check", "memory", "improve", "handoff"]) {
  const file = path.join(root, "skills", skill, "SKILL.md");
  requireFile(file, `skill ${skill}`);
  if (fs.existsSync(file)) {
    const meta = checkFrontmatter(file, ["name", "description", "when_to_use"]);
    if (meta.name !== skill) warnings.push(`${rel(file)} name '${meta.name}' differs from folder '${skill}'`);
    if (wordCount(readText(file)) > 650) warnings.push(`${rel(file)} is long; move detail into references if it grows further`);
  }
}

for (const file of markdownFiles(path.join(root, "agents"))) {
  checkFrontmatter(file, ["name", "description"]);
  if (wordCount(readText(file)) > 500) warnings.push(`${rel(file)} is long for an agent prompt`);
}

for (const script of [
  "_lib.js",
  "claudista-check.js",
  "claudista-doctor.js",
  "claudista-quality-gate.js",
  "claudista-trace.js",
  "claudista-memory.js",
  "claudista-improve.js",
  "claudista-handoff.js",
]) {
  requireFile(path.join(root, "bin", script), `script ${script}`);
}

const files = walk(root, { maxDepth: 8, maxFiles: 10000 });
const legacySlashCommand = "/based-" + "claude:";
for (const file of files) {
  if (!/\.(md|json|js|cmd)$/i.test(file)) continue;
  const text = readText(path.join(root, file));
  if (file !== "README.md" && text.includes(legacySlashCommand)) {
    errors.push(`${file} contains legacy based-claude slash command`);
  }
}

for (const file of files.filter((item) => item.startsWith("bin/") && item.endsWith(".js"))) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`${file} failed node --check: ${result.stderr.trim() || result.stdout.trim()}`);
}

console.log("# Based Claudista Check");
console.log("");
console.log(`Root: ${root}`);
console.log("");
if (errors.length) {
  console.log("## Errors");
  errors.forEach((item) => console.log(`- ${item}`));
  console.log("");
}
if (warnings.length) {
  console.log("## Warnings");
  warnings.forEach((item) => console.log(`- ${item}`));
  console.log("");
}
if (!errors.length && !warnings.length) console.log("No issues found.");
else if (!errors.length) console.log("No blocking issues found.");

process.exit(errors.length ? 1 : 0);
