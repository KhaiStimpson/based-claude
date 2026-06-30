#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, parseFrontmatter, readJson } = require("./_lib");

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

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(dir, entry.name));
}

function recursiveFiles(dir, options = {}) {
  if (!fs.existsSync(dir)) return [];
  const skip = new Set(options.skip || []);
  const out = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  visit(dir);
  return out;
}

function lintText(file, text, patterns, target) {
  text.split(/\r?\n/).forEach((line, index) => {
    for (const pattern of patterns) {
      if (pattern.test(line)) target.push(`${rel(file)}:${index + 1} matches discouraged wording: ${line.trim()}`);
    }
  });
}

function getSection(text, heading) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading.toLowerCase()}`);
  if (start === -1) return "";
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

function isConditionalReference(line) {
  return /\b(when|only|if|for|before|after|while|unless|on trigger)\b/i.test(line);
}

function checkFrontmatter(file, required) {
  const text = readText(file);
  const meta = parseFrontmatter(text);
  for (const field of required) {
    if (!meta[field]) errors.push(`${rel(file)} missing frontmatter field: ${field}`);
  }
  return meta;
}

const manifestPath = path.join(root, ".claude-plugin", "plugin.json");
requireFile(manifestPath, "plugin manifest");
if (fs.existsSync(manifestPath)) {
  const manifest = readJson(manifestPath);
  if (manifest.__error) errors.push(`Invalid plugin.json: ${manifest.__error}`);
  if (!manifest.name) errors.push("plugin.json missing name");
  if (manifest.name && !/^[a-z0-9][a-z0-9-]*$/.test(manifest.name)) {
    errors.push("plugin.json name should be kebab-case lowercase");
  }
  if (!manifest.version) errors.push("plugin.json missing version");
  if (!manifest.description) errors.push("plugin.json missing description");
}

requireFile(path.join(root, "README.md"), "README");
requireFile(path.join(root, "settings.json"), "settings.json");
requireFile(path.join(root, "package.json"), "package.json");

if (fs.existsSync(path.join(root, ".based-smoke"))) {
  errors.push("Remove .based-smoke from the plugin source/package surface before validation.");
}

const settingsPath = path.join(root, "settings.json");
let settings = {};
if (fs.existsSync(settingsPath)) {
  settings = readJson(settingsPath);
  if (settings.__error) errors.push(`Invalid settings.json: ${settings.__error}`);
  if (!settings.agent) warnings.push("settings.json does not set a default agent.");
  if (settings.agent) requireFile(path.join(root, "agents", `${settings.agent}.md`), `default agent ${settings.agent}`);
}

const requiredRefs = [
  "research-basis.md",
  "system-contract.md",
  "validation-ladder.md",
  "role-map.md",
  "safety-policy.md",
  "memory-card-schema.md",
  "handoff-template.md",
  "plan-artifact.md",
  "diagnostic-ledger.md",
  "project-scan-schema.md",
  "delegation-policy.md",
  "delegation-evidence.md",
  "trace-schema.md",
  "self-improvement-protocol.md",
];
for (const ref of requiredRefs) requireFile(path.join(root, "references", ref), `reference ${ref}`);

for (const file of markdownFiles(path.join(root, "references"))) {
  const words = wordCount(readText(file));
  if (words > 700) warnings.push(`${rel(file)} is ${words} words; consider splitting or making it trigger-loaded.`);
}

const skillsDir = path.join(root, "skills");
if (!fs.existsSync(skillsDir)) errors.push("Missing skills directory.");
else {
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (!skills.length) errors.push("No skills found.");
  for (const skill of skills) {
    const file = path.join(skillsDir, skill.name, "SKILL.md");
    requireFile(file, `skill ${skill.name}`);
    if (fs.existsSync(file)) {
      const meta = checkFrontmatter(file, ["name", "description", "when_to_use"]);
      if (meta.name && meta.name !== skill.name) {
        warnings.push(`${rel(file)} name '${meta.name}' differs from directory '${skill.name}'.`);
      }
      const text = readText(file);
      const words = wordCount(text);
      if (words > 650) warnings.push(`${rel(file)} is ${words} words; consider moving detail to references.`);
      const readFirst = getSection(text, "Read First");
      const referenceBullets = readFirst
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- ") && line.includes(".md"));
      const unconditional = referenceBullets.filter((line) => !isConditionalReference(line));
      if (unconditional.length > 2) {
        warnings.push(`${rel(file)} has ${unconditional.length} unconditional Read First references.`);
      }
      for (const bullet of unconditional) {
        if (bullet.includes("research-basis.md") || bullet.includes("delegation-evidence.md")) {
          warnings.push(`${rel(file)} loads ${bullet.match(/`([^`]+)`/)?.[1] || "a research appendix"} unconditionally.`);
        }
      }
    }
  }
}

const agentsDir = path.join(root, "agents");
const personaPatternSources = [
  "\\byou\\s+are\\b",
  "\\bact\\s+as\\b",
  "\\bex" + "pert\\b",
  "\\bspecial" + "ist\\b",
  "\\bworld[- ]class\\b",
  "\\bel" + "ite\\b",
  "\\bseason" + "ed\\b",
  "\\bper" + "sona\\b",
  "\\bhighly\\s+skilled\\b",
  "\\bgu" + "ru\\b",
  "\\brock" + "star\\b",
  "\\bbest-in-class\\b",
];
const personaPatterns = personaPatternSources.map((source) => new RegExp(source, "i"));
if (!fs.existsSync(agentsDir)) errors.push("Missing agents directory.");
else {
  const agents = fs.readdirSync(agentsDir).filter((name) => name.endsWith(".md"));
  if (!agents.length) errors.push("No agents found.");
  for (const agent of agents) {
    const file = path.join(agentsDir, agent);
    const meta = checkFrontmatter(file, ["name", "description"]);
    const text = readText(file);
    lintText(file, `${meta.description || ""}\n${text}`, personaPatterns, errors);
    const words = wordCount(text);
    if (words > 500) warnings.push(`${rel(file)} is ${words} words; keep default agent prompts compact.`);
  }
}

const binDir = path.join(root, "bin");
for (const script of [
  "_lib.js",
  "based-doctor.js",
  "based-quality-gate.js",
  "based-plan.js",
  "based-handoff.js",
  "based-memory.js",
  "based-trace.js",
  "based-improve.js",
  "based-plugin-check.js",
]) {
  requireFile(path.join(binDir, script), `bin script ${script}`);
}

const memoryScript = readText(path.join(binDir, "based-memory.js"));
for (const marker of ["missing provenance evidence", "missing allowed_readers", "duplicate active claim", "supersession-reviewed"]) {
  if (!memoryScript.includes(marker)) errors.push(`based-memory.js missing governance marker: ${marker}`);
}

const improveScript = readText(path.join(binDir, "based-improve.js"));
for (const marker of ["reviews.jsonl", "requiresIndependentReview", "--allow-shell", "reviewRequired"]) {
  if (!improveScript.includes(marker)) errors.push(`based-improve.js missing governance marker: ${marker}`);
}
for (const script of ["based-quality-gate.js", "based-improve.js"]) {
  const text = readText(path.join(binDir, script));
  if (/shell:\s*true/.test(text) || /spawnSync\(/.test(text)) {
    errors.push(`${script} should use runCommandString instead of direct shell execution.`);
  }
}

const readme = readText(path.join(root, "README.md"));
for (const token of ["based-doctor", "based-quality-gate", "based-plan", "based-memory", "based-trace", "based-improve", "/based-claude:code", "/based-claude:plan-file"]) {
  if (!readme.includes(token)) warnings.push(`README does not mention ${token}`);
}

const zipPath = path.resolve(root, "..", `${path.basename(root)}.zip`);
if (fs.existsSync(zipPath)) {
  const sourceFiles = recursiveFiles(root, { skip: [".based-smoke", "node_modules", ".git"] });
  const newestSource = sourceFiles.reduce((max, file) => Math.max(max, fs.statSync(file).mtimeMs), 0);
  if (fs.statSync(zipPath).mtimeMs < newestSource) {
    warnings.push(`${path.basename(zipPath)} is older than plugin source files; regenerate the archive after changes.`);
  }
}

console.log("# Based Claude Plugin Check");
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
if (!errors.length && !warnings.length) {
  console.log("No issues found.");
} else if (!errors.length) {
  console.log("No blocking issues found.");
}

process.exit(errors.length ? 1 : 0);
