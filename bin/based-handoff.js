#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, resolveRoot, inspectProject, slugify } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = resolveRoot(args);
const scan = inspectProject(root);
const title = args.title || "action-state-handoff";
const now = new Date().toISOString();

const body = `## Action-State Handoff
- Objective: ${args.objective || ""}
- Current owner / mode: ${args.mode || ""}
- Instruction contracts: ${scan.instructions.join(", ")}
- Authority / approval boundary:
- Scope:
- Exclusions:
- Current state:
- Files read:
- Files changed:
- Decisions:
- Evidence:
- Validation:
- Risks:
- Privacy / safety notes:
- Tool-trust notes:
- State invariants:
- Next action:

Generated: ${now}
Root: ${root}
Git: ${scan.git.isRepository ? `yes (${scan.git.branch || "detached"})` : `no (${scan.git.note})`}
`;

if (args.write) {
  const dir = path.resolve(root, args.dir || ".based/handoffs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${now.replace(/[:.]/g, "-")}-${slugify(title)}.md`);
  fs.writeFileSync(file, body, "utf8");
  console.log(file);
} else {
  process.stdout.write(body);
}

