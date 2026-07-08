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

function hasFile(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function hasText(relPath, pattern) {
  return pattern.test(readText(path.join(root, relPath)));
}

function harnessScorecard() {
  const rows = [
    {
      component: "agent loop",
      evidence: ["references/system-contract.md", "skills/work/SKILL.md"],
      ok: hasText("references/system-contract.md", /Router Phases/) && hasText("skills/work/SKILL.md", /Completion Bar/),
    },
    {
      component: "context delivery",
      evidence: ["references/system-contract.md", "references/planning.md"],
      ok: hasText("references/system-contract.md", /Retrieve context progressively/) && hasFile("references/planning.md"),
    },
    {
      component: "tool interface",
      evidence: ["references/tool-adapter-safety.md"],
      ok: hasText("references/tool-adapter-safety.md", /confirmation/i) && hasText("references/tool-adapter-safety.md", /proof-after-write/i),
    },
    {
      component: "control mechanism",
      evidence: ["references/delegation-policy.md", "references/model-contract.md"],
      ok: hasFile("references/delegation-policy.md") && hasText("references/model-contract.md", /effort/i),
    },
    {
      component: "permissions",
      evidence: ["references/safety-policy.md"],
      ok: hasText("references/safety-policy.md", /Action Boundary|approval|credentials/i),
    },
    {
      component: "memory",
      evidence: ["references/memory-card-schema.md", "bin/migrato-memory.js"],
      ok: hasText("references/memory-card-schema.md", /provenance/i) && hasText("bin/migrato-memory.js", /supersession-reviewed/),
    },
    {
      component: "verification",
      evidence: ["references/validation-ladder.md", "bin/migrato-quality-gate.js"],
      ok: hasText("references/validation-ladder.md", /Syntax and schema/) && hasFile("bin/migrato-quality-gate.js"),
    },
    {
      component: "code quality",
      evidence: ["references/code-style.md", "bin/migrato-slop-check.js"],
      ok: hasText("references/code-style.md", /The Codebase Wins/) && hasFile("bin/migrato-slop-check.js"),
    },
    {
      component: "observability",
      evidence: ["references/trace-schema.md", "bin/migrato-trace.js"],
      ok: hasText("references/trace-schema.md", /risk_class/) && hasText("bin/migrato-trace.js", /risk-class/),
    },
    {
      component: "sandboxing",
      evidence: ["references/tool-adapter-safety.md", "references/safety-policy.md"],
      ok: hasText("references/tool-adapter-safety.md", /quarantine/i) && hasText("references/safety-policy.md", /supply-chain/i),
    },
    {
      component: "human gates",
      evidence: ["references/loop-readiness.md", "references/self-improvement.md"],
      ok: hasText("references/loop-readiness.md", /human gates/i) && hasText("references/self-improvement.md", /independent review/i),
    },
  ];
  return rows;
}

function printHarnessScorecard() {
  console.log("## Harness Scorecard");
  console.log("");
  for (const row of harnessScorecard()) {
    const status = row.ok ? "ok" : "gap";
    console.log(`- ${status}: ${row.component} (${row.evidence.join(", ")})`);
  }
  console.log("");
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

if (fs.existsSync(path.join(root, ".migrato-smoke"))) {
  errors.push("Remove .migrato-smoke from the plugin source/package surface before validation.");
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
  "code-style.md",
  "validation-ladder.md",
  "review-policy.md",
  "safety-policy.md",
  "memory-card-schema.md",
  "handoff-template.md",
  "planning.md",
  "diagnostic-ledger.md",
  "delegation-policy.md",
  "trace-schema.md",
  "self-improvement.md",
  "model-contract.md",
  "loop-readiness.md",
  "tool-adapter-safety.md",
  "phase-gates.md",
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
      const listingLength = `${meta.description || ""} ${meta.when_to_use || ""}`.trim().length;
      if (listingLength > 1536) {
        errors.push(`${rel(file)} description+when_to_use is ${listingLength} chars; the skill listing truncates at 1536.`);
      } else if (listingLength > 1200) {
        warnings.push(`${rel(file)} description+when_to_use is ${listingLength} chars; keep headroom under the 1536-char listing cap.`);
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
        if (bullet.includes("research-basis.md")) {
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
  "migrato-doctor.js",
  "migrato-quality-gate.js",
  "migrato-slop-check.js",
  "migrato-plan.js",
  "migrato-handoff.js",
  "migrato-memory.js",
  "migrato-trace.js",
  "migrato-improve.js",
  "migrato-plugin-check.js",
]) {
  requireFile(path.join(binDir, script), `bin script ${script}`);
}

const memoryScript = readText(path.join(binDir, "migrato-memory.js"));
for (const marker of ["missing provenance evidence", "missing allowed_readers", "duplicate active claim", "supersession-reviewed"]) {
  if (!memoryScript.includes(marker)) errors.push(`migrato-memory.js missing governance marker: ${marker}`);
}

const improveScript = readText(path.join(binDir, "migrato-improve.js"));
for (const marker of ["reviews.jsonl", "requiresIndependentReview", "--allow-shell", "reviewRequired"]) {
  if (!improveScript.includes(marker)) errors.push(`migrato-improve.js missing governance marker: ${marker}`);
}
for (const script of ["migrato-quality-gate.js", "migrato-improve.js"]) {
  const text = readText(path.join(binDir, script));
  if (/shell:\s*true/.test(text) || /spawnSync\(/.test(text)) {
    errors.push(`${script} should use runCommandString instead of direct shell execution.`);
  }
}

// Rule-copy drift check: agents and skills are thin shells over canonical references,
// but a few safety-critical clauses are intentionally repeated across surfaces so they
// survive without a file read. Each pair pins verbatim phrases that must appear in both
// files; editing only one side fails here instead of letting the copies silently diverge.
const ruleCopyPairs = [
  {
    label: "owner contract",
    fileA: "references/system-contract.md",
    fileB: "agents/migrato-developer.md",
    phrases: [
      "Never weaken tests, validators, rubrics, or safety checks to make work pass.",
    ],
  },
  {
    label: "code style",
    fileA: "references/code-style.md",
    fileB: "references/review-policy.md",
    phrases: [
      "speculative abstraction",
      "defensive noise",
    ],
  },
  {
    label: "safety ladder",
    fileA: "references/safety-policy.md",
    fileB: "agents/migrato-safety.md",
    phrases: ["allow", "warn", "escalate", "block until clarified"],
  },
  {
    label: "memory admission",
    fileA: "references/memory-card-schema.md",
    fileB: "skills/memory/SKILL.md",
    phrases: ["Prefer no memory over weak memory."],
  },
  {
    label: "review recall",
    fileA: "references/review-policy.md",
    fileB: "references/model-contract.md",
    phrases: ["Discovery", "Verification"],
  },
  {
    label: "skill radar",
    fileA: "references/system-contract.md",
    fileB: "references/self-improvement.md",
    phrases: ["three or more times", "silent side effect"],
  },
];
for (const pair of ruleCopyPairs) {
  const textA = readText(path.join(root, pair.fileA)).toLowerCase();
  const textB = readText(path.join(root, pair.fileB)).toLowerCase();
  for (const phrase of pair.phrases) {
    const inA = textA.includes(phrase.toLowerCase());
    const inB = textB.includes(phrase.toLowerCase());
    if (inA !== inB) {
      errors.push(`Rule-copy drift (${pair.label}): "${phrase}" present in ${inA ? pair.fileA : pair.fileB} but not ${inA ? pair.fileB : pair.fileA}.`);
    } else if (!inA && !inB) {
      warnings.push(`Rule-copy anchor missing from both ${pair.fileA} and ${pair.fileB}: "${phrase}" (drift check needs updating or the shared policy was intentionally reworded in both files).`);
    }
  }
}

const readme = readText(path.join(root, "README.md"));
for (const token of ["migrato-doctor", "migrato-quality-gate", "migrato-slop-check", "migrato-plan", "migrato-memory", "migrato-trace", "migrato-improve", "/based-migrato:work", "/based-migrato:check"]) {
  if (!readme.includes(token)) warnings.push(`README does not mention ${token}`);
}

console.log("# Based Migrato Plugin Check");
console.log("");
console.log(`Root: ${root}`);
console.log("");
if (args.scorecard || args["harness-scorecard"]) printHarnessScorecard();
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
