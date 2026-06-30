#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) {
      args._.push(part);
      continue;
    }
    const raw = part.slice(2);
    const eq = raw.indexOf("=");
    if (eq >= 0) {
      args[raw.slice(0, eq)] = raw.slice(eq + 1);
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[raw] = next;
      i += 1;
    } else {
      args[raw] = true;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "help";
const pluginRoot = path.resolve(__dirname, "..");
const root = path.resolve(args.root || (["plugin-check", "smoke"].includes(command) ? pluginRoot : process.cwd()));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    return { __error: error.message };
  }
}

function writeText(file, body) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, body, "utf8");
}

function appendText(file, body) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, body, "utf8");
}

function slugify(input) {
  return String(input || "artifact")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "artifact";
}

function stamp() {
  return new Date().toISOString();
}

function stampSlug() {
  return stamp().replace(/[:.]/g, "-");
}

function csv(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function bullets(value, fallback) {
  const items = csv(value);
  return (items.length ? items : [fallback]).map((item) => `- ${item}`).join("\n");
}

function checks(value, fallback) {
  const items = csv(value);
  return (items.length ? items : [fallback]).map((item) => `- [ ] ${item}`).join("\n");
}

function rel(base, file) {
  return path.relative(base, file).replace(/\\/g, "/");
}

function run(commandText, cwd) {
  if (!commandText) return { status: 1, stdout: "", stderr: "empty command" };
  const parts = commandText.match(/"([^"]*)"|'([^']*)'|[^\s]+/g) || [];
  const argv = parts.map((part) => part.replace(/^["']|["']$/g, ""));
  if (!argv.length) return { status: 1, stdout: "", stderr: "empty command" };
  const executable = process.platform === "win32" && ["npm", "pnpm", "yarn", "bun"].includes(argv[0])
    ? `${argv[0]}.cmd`
    : argv[0];
  const result = spawnSync(executable, argv.slice(1), {
    cwd,
    encoding: "utf8",
    timeout: 120000,
    shell: false,
  });
  return {
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || result.error?.message || "",
  };
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function inspectProject(projectRoot) {
  const names = safeReaddir(projectRoot).map((entry) => entry.name);
  const instructions = ["AGENTS.md", "CLAUDE.md", "README.md", ".claude", ".codex", ".opencode"]
    .filter((name) => names.includes(name));
  const manifests = ["package.json", "pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock", "pyproject.toml", "Cargo.toml", "go.mod"]
    .filter((name) => names.includes(name));
  const pkg = names.includes("package.json") ? readJson(path.join(projectRoot, "package.json")) : null;
  const scripts = pkg && !pkg.__error && pkg.scripts ? Object.keys(pkg.scripts) : [];
  const git = run("git rev-parse --is-inside-work-tree", projectRoot);
  const branch = git.status === 0 ? run("git branch --show-current", projectRoot).stdout.trim() : "";
  return { instructions, manifests, scripts, git: git.status === 0, branch };
}

function statePath(projectRoot) {
  return path.join(projectRoot, ".based", "state", "current.md");
}

function writeCurrentState(projectRoot, options = {}) {
  const scan = inspectProject(projectRoot);
  const body = `# Current State

- Objective: ${options.objective || args.objective || ""}
- Mode: ${options.mode || args.mode || "start"}
- Owner: ${options.owner || args.owner || "claudia-developer"}
- Scope: ${options.scope || args.scope || ""}
- Approval boundary: ${options.approvals || args.approvals || ""}
- Next action: ${options.next || args["next-action"] || "Inspect instructions and choose plan or implement."}
- Blockers: ${options.blockers || args.blockers || "None recorded."}
- Latest validation: ${options.validation || args.validation || "None recorded."}
- Active artifacts: ${options.artifacts || args.artifacts || "None recorded."}

## Repository Snapshot

- Root: ${projectRoot}
- Git: ${scan.git ? `yes (${scan.branch || "detached"})` : "no"}
- Instructions: ${scan.instructions.length ? scan.instructions.join(", ") : "none detected"}
- Manifests: ${scan.manifests.length ? scan.manifests.join(", ") : "none detected"}
- Package scripts: ${scan.scripts.length ? scan.scripts.join(", ") : "none detected"}

Generated: ${stamp()}
`;
  const file = statePath(projectRoot);
  writeText(file, body);
  return file;
}

function writePlan(projectRoot) {
  const title = args.title || args.objective || args._.slice(2).join(" ") || "implementation-plan";
  const slug = slugify(args.slug || title);
  const dir = path.join(projectRoot, ".based", "plans", slug);
  const plan = `# ${title}

- Objective: ${args.objective || ""}
- Status: draft
- Root: ${projectRoot}
- Generated: ${stamp()}
- Developer entrypoint: read this file first, then open linked detail files only as needed.

## Plan Files

| File | Purpose |
| --- | --- |
| [context.md](context.md) | Constraints, repo facts, assumptions, and decisions. |
| [tasks.md](tasks.md) | Sequenced implementation stages and likely files. |
| [validation.md](validation.md) | Commands, gates, expected evidence, and skipped checks. |
| [risks.md](risks.md) | Stop conditions, approvals, rollback notes, and open questions. |
| [handoff.md](handoff.md) | Compact action-state handoff for implementation. |

## Scope

${bullets(args.scope, "Fill in included and excluded surfaces.")}

## Execution Sequence

${checks(args.tasks || args.changes, "Fill in the first implementation step.")}

## Validation Summary

${bullets(args.validation, "Fill in the smallest meaningful validation command.")}

## Risks / Stop Conditions

${bullets(args.risks, "Fill in the condition that should stop implementation or trigger replanning.")}

## Next Action

${args["next-action"] || "Implementer reads plan.md, opens linked detail files as needed, then performs the first task."}
`;
  const context = `# Context

## Instruction Contracts

${bullets(args.instructions, "Fill in instructions inspected during planning.")}

## Files Inspected

${bullets(args.files, "Fill in exact files inspected during planning.")}

## Assumptions

${bullets(args.assumptions, "Fill in assumptions and inferred facts.")}

## Decisions

${bullets(args.decisions, "Fill in decisions made during planning and why.")}
`;
  const tasks = `# Tasks

## Implementation Stages

${checks(args.tasks || args.changes, "Fill in sequenced implementation work.")}

## Likely Files

${bullets(args.files, "Fill in likely files or directories to touch.")}

## Acceptance Checks

${bullets(args.acceptance, "Fill in observable acceptance checks.")}
`;
  const validation = `# Validation

## Planned Checks

${bullets(args.validation, "Fill in validation commands and expected evidence.")}

## Evidence To Capture

${bullets(args.evidence, "Fill in output, screenshots, logs, or review evidence needed for completion.")}

## Skipped Checks

${bullets(args.skipped, "Fill in checks intentionally skipped and why.")}
`;
  const risks = `# Risks

## Rejection Modes

${bullets(args.risks, "Fill in likely failure or rejection modes.")}

## Stop Conditions

${bullets(args["stop-conditions"], "Fill in conditions that should stop work or trigger replanning.")}

## Approval Boundaries

${bullets(args.approvals, "Fill in actions that require explicit approval.")}

## Rollback Notes

${bullets(args.rollback, "Fill in rollback or recovery notes.")}
`;
  const handoff = `# Action-State Handoff

- Objective: ${args.objective || ""}
- Current owner / mode: plan
- Instruction contracts: ${args.instructions || ""}
- Authority / approval boundary: ${args.approvals || ""}
- Scope: ${args.scope || ""}
- Current state: Progressive plan bundle created at .based/plans/${slug}/.
- Active artifacts: .based/plans/${slug}/plan.md
- Files read: ${args.files || ""}
- Files changed: .based/plans/${slug}/plan.md, context.md, tasks.md, validation.md, risks.md, handoff.md
- Decisions: ${args.decisions || ""}
- Evidence: ${args.evidence || ""}
- Validation: ${args.validation || ""}
- Risks: ${args.risks || ""}
- Next action: ${args["next-action"] || "Implement from plan.md."}
`;
  writeText(path.join(dir, "plan.md"), plan);
  writeText(path.join(dir, "context.md"), context);
  writeText(path.join(dir, "tasks.md"), tasks);
  writeText(path.join(dir, "validation.md"), validation);
  writeText(path.join(dir, "risks.md"), risks);
  writeText(path.join(dir, "handoff.md"), handoff);
  return path.join(dir, "plan.md");
}

function writeValidation(projectRoot) {
  const title = args.title || "validation";
  const slug = `${stampSlug()}-${slugify(title)}`;
  const file = path.join(projectRoot, ".based", "validation", `${slug}.md`);
  const body = `# Validation Record

- Title: ${title}
- Command: ${args.command || ""}
- Result: ${args.result || "skipped"}
- Working directory: ${args.cwd || projectRoot}
- What this proves: ${args.proves || ""}
- What remains unproven: ${args.unproven || ""}
- Attempts: ${args.attempts || "1"}
- Generated: ${stamp()}

## Output

\`\`\`text
${args.output || ""}
\`\`\`
`;
  writeText(file, body);
  return file;
}

function writeReview(projectRoot) {
  const title = args.title || "review";
  const slug = `${stampSlug()}-${slugify(title)}`;
  const file = path.join(projectRoot, ".based", "reviews", `${slug}.md`);
  const body = `# Review

- Objective: ${args.objective || ""}
- Surface: ${args.surface || args.files || ""}
- Validation inspected: ${args.validation || ""}
- Verdict: ${args.verdict || "pending"}
- Generated: ${stamp()}

## Findings

${bullets(args.findings, "Fill in findings, ordered by severity.")}

## Open Questions

${bullets(args.questions, "Fill in questions or residual risks.")}
`;
  writeText(file, body);
  return file;
}

function writeHandoff(projectRoot) {
  const title = args.title || "handoff";
  const slug = `${stampSlug()}-${slugify(title)}`;
  const file = path.join(projectRoot, ".based", "handoffs", `${slug}.md`);
  const body = `# Action-State Handoff

- Objective: ${args.objective || ""}
- Current owner / mode: ${args.mode || "handoff"}
- Instruction contracts: ${args.instructions || ""}
- Authority / approval boundary: ${args.approvals || ""}
- Scope: ${args.scope || ""}
- Exclusions: ${args.exclusions || ""}
- Current state: ${args.state || ""}
- Active artifacts: ${args.artifacts || ""}
- Files read: ${args.read || ""}
- Files changed: ${args.changed || ""}
- Decisions: ${args.decisions || ""}
- Evidence: ${args.evidence || ""}
- Validation: ${args.validation || ""}
- Risks: ${args.risks || ""}
- Privacy / safety notes: ${args.safety || ""}
- Tool-trust notes: ${args.tools || ""}
- State invariants: ${args.invariants || ""}
- Next action: ${args["next-action"] || ""}

Generated: ${stamp()}
`;
  writeText(file, body);
  return file;
}

function writeMemoryDraft(projectRoot) {
  const title = args.title || "memory-draft";
  const slug = `${stampSlug()}-${slugify(title)}`;
  const file = path.join(projectRoot, ".based", "memory", "drafts", `${slug}.md`);
  const body = `# Memory Draft

- Title: ${title}
- Scope: ${args.scope || "repo"}
- Confidence: ${args.confidence || "medium"}
- Source kind: ${args.source || "validated-trace"}
- Allowed readers: ${args.readers || "project"}
- Supersession: ${args.supersession || "review before promotion"}
- Retirement: ${args.retirement || "retire when contradicted or stale"}
- Privacy notes: ${args.privacy || "No sensitive data reviewed."}
- Generated: ${stamp()}

## Claim

${args.summary || ""}

## Provenance Evidence

${bullets(args.evidence, "Fill in exact provenance before promotion.")}

## Promotion Checklist

- [ ] Explicit approval
- [ ] Privacy reviewed
- [ ] Supersession reviewed
- [ ] Validation evidence attached where possible
`;
  writeText(file, body);
  return file;
}

function appendTrace(projectRoot) {
  const file = path.join(projectRoot, ".based", "traces", "actions.jsonl");
  const record = {
    id: args.id || `trace-${stampSlug()}`,
    timestamp: stamp(),
    event: args.event || "note",
    objective: args.objective || "",
    summary: args.summary || "",
    actor: args.actor || "based-claudia",
    authority: args.authority || "allow",
    artifacts: csv(args.artifacts),
    files: csv(args.files),
    commands: csv(args.commands),
    validation: args.validation || "",
    risks: csv(args.risks),
    nextAction: args["next-action"] || "",
  };
  appendText(file, `${JSON.stringify(record)}\n`);
  return record.id;
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return {};
  const end = text.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = text.slice(3, end).trim();
  const meta = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) meta[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return meta;
}

function listMarkdown(dir) {
  return safeReaddir(dir)
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(dir, entry.name));
}

function pluginCheck(checkRoot = root) {
  const errors = [];
  const warnings = [];
  const requiredFiles = [
    ".claude-plugin/plugin.json",
    "README.md",
    "settings.json",
    "package.json",
    "agents/claudia-developer.md",
    "bin/based-claudia.js",
    "bin/based-claudia",
    "bin/based-claudia.cmd",
  ];
  const requiredRefs = [
    "artifact-spine.md",
    "handoff-template.md",
    "memory-policy.md",
    "research-basis.md",
    "review-policy.md",
    "role-map.md",
    "safety-policy.md",
    "system-contract.md",
    "validation-ladder.md",
    "workflow-kernel.md",
  ];
  const requiredSkills = ["start", "plan", "implement", "check", "review", "handoff", "learn"];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(checkRoot, file))) errors.push(`Missing ${file}`);
  }
  for (const file of requiredRefs) {
    if (!fs.existsSync(path.join(checkRoot, "references", file))) errors.push(`Missing references/${file}`);
  }
  for (const skill of requiredSkills) {
    const file = path.join(checkRoot, "skills", skill, "SKILL.md");
    if (!fs.existsSync(file)) {
      errors.push(`Missing skills/${skill}/SKILL.md`);
      continue;
    }
    const meta = parseFrontmatter(readText(file));
    for (const field of ["name", "description", "when_to_use"]) {
      if (!meta[field]) errors.push(`skills/${skill}/SKILL.md missing ${field}`);
    }
    if (meta.name && meta.name !== skill) warnings.push(`skills/${skill}/SKILL.md name '${meta.name}' differs from folder`);
  }

  const manifest = readJson(path.join(checkRoot, ".claude-plugin", "plugin.json"));
  if (manifest.__error) errors.push(`Invalid plugin.json: ${manifest.__error}`);
  if (manifest.name !== "based-claudia") errors.push("plugin.json name should be based-claudia");
  if (!manifest.version) errors.push("plugin.json missing version");

  const settings = readJson(path.join(checkRoot, "settings.json"));
  if (settings.__error) errors.push(`Invalid settings.json: ${settings.__error}`);
  if (settings.agent !== "claudia-developer") errors.push("settings.json should select claudia-developer");

  for (const agent of listMarkdown(path.join(checkRoot, "agents"))) {
    const meta = parseFrontmatter(readText(agent));
    if (!meta.name || !meta.description) errors.push(`${rel(checkRoot, agent)} missing name or description`);
  }

  const readme = readText(path.join(checkRoot, "README.md"));
  for (const token of ["/based-claudia:start", "/based-claudia:implement", "based-claudia plugin-check", ".based/state/current.md"]) {
    if (!readme.includes(token)) warnings.push(`README does not mention ${token}`);
  }

  console.log("# Based Claudia Plugin Check");
  console.log("");
  console.log(`Root: ${checkRoot}`);
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
  return errors.length ? 1 : 0;
}

function smoke() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "based-claudia-smoke-"));
  try {
    writeCurrentState(tmp, { objective: "Smoke test", next: "Write a plan." });
    const oldArgs = { ...args };
    args.title = "Smoke Plan";
    args.objective = "Smoke test artifact flow";
    args.tasks = "Create plan,Record validation";
    args.validation = "npm run check";
    writePlan(tmp);
    args.title = "Smoke Validation";
    args.command = "npm run check";
    args.result = "pass";
    writeValidation(tmp);
    args.title = "Smoke Review";
    writeReview(tmp);
    args.title = "Smoke Handoff";
    writeHandoff(tmp);
    args.title = "Smoke Memory";
    args.summary = "Validated smoke artifact flow.";
    writeMemoryDraft(tmp);
    args.event = "smoke";
    args.summary = "Artifact flow smoke passed.";
    appendTrace(tmp);
    Object.assign(args, oldArgs);
    const required = [
      ".based/state/current.md",
      ".based/plans/smoke-plan/plan.md",
      ".based/traces/actions.jsonl",
    ];
    for (const file of required) {
      if (!fs.existsSync(path.join(tmp, file))) throw new Error(`missing smoke artifact ${file}`);
    }
    console.log(`Smoke OK: ${tmp}`);
    return 0;
  } finally {
    const resolved = path.resolve(tmp);
    if (resolved.startsWith(os.tmpdir())) {
      fs.rmSync(resolved, { recursive: true, force: true });
    }
  }
}

function usage() {
  console.log(`Based Claudia

Usage:
  based-claudia init --objective "..."
  based-claudia status
  based-claudia next
  based-claudia plan write --title "..." --objective "..."
  based-claudia check record --title "..." --command "..." --result pass|fail|skipped
  based-claudia review write --title "..."
  based-claudia handoff write --title "..."
  based-claudia trace append --event validation --summary "..."
  based-claudia memory draft --title "..." --summary "..."
  based-claudia plugin-check
  based-claudia smoke

All durable workflow artifacts are written under .based/** in the selected --root or current directory.`);
}

let exitCode = 0;
if (command === "help" || args.help) {
  usage();
} else if (command === "init") {
  console.log(writeCurrentState(root));
} else if (command === "status") {
  const file = statePath(root);
  if (fs.existsSync(file)) process.stdout.write(readText(file));
  else console.log(`No current state found at ${file}`);
} else if (command === "next") {
  const text = readText(statePath(root));
  const match = text.match(/^- Next action:\s*(.*)$/m);
  console.log(match ? match[1] : "No next action recorded.");
} else if (command === "plan" && args._[1] === "write") {
  console.log(writePlan(root));
} else if (command === "check" && args._[1] === "record") {
  console.log(writeValidation(root));
} else if (command === "review" && args._[1] === "write") {
  console.log(writeReview(root));
} else if (command === "handoff" && args._[1] === "write") {
  console.log(writeHandoff(root));
} else if (command === "trace" && args._[1] === "append") {
  console.log(appendTrace(root));
} else if (command === "memory" && args._[1] === "draft") {
  console.log(writeMemoryDraft(root));
} else if (command === "plugin-check") {
  exitCode = pluginCheck(root);
} else if (command === "smoke") {
  exitCode = smoke();
} else {
  console.error(`Unknown command: ${args._.join(" ")}`);
  usage();
  exitCode = 1;
}

process.exit(exitCode);
