#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, resolveRoot, inspectProject, slugify, csv } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = resolveRoot(args);
const title = args.title || args._.join(" ") || "implementation-plan";
const slug = slugify(args.slug || title);
const now = new Date().toISOString();
const scan = inspectProject(root);

function linesFrom(value, fallback) {
  const items = csv(value);
  if (items.length) return items.map((item) => `- ${item}`);
  return [`- ${fallback}`];
}

function checkboxLines(value, fallback) {
  const items = csv(value);
  if (items.length) return items.map((item) => `- [ ] ${item}`);
  return [`- [ ] ${fallback}`];
}

function mdTitle(value) {
  return String(value || "Implementation Plan").replace(/\s+/g, " ").trim();
}

function renderPlan() {
  return `# ${mdTitle(title)}

- Objective: ${args.objective || ""}
- Status: ${args.status || "draft"}
- Root: ${root}
- Generated: ${now}
- Developer entrypoint: read this file first, then open linked detail files only as needed.

## Plan Files

| File | Purpose |
| --- | --- |
| [context.md](context.md) | Constraints, repo facts, assumptions, and decisions. |
| [tasks.md](tasks.md) | Sequenced implementation stages and likely files. |
| [validation.md](validation.md) | Commands, gates, expected evidence, and skipped checks. |
| [risks.md](risks.md) | Stop conditions, approvals, rollback notes, and open questions. |
| [handoff.md](handoff.md) | Compact action-state handoff for the developer. |

## Scope

${linesFrom(args.scope, "Fill in included and excluded surfaces.").join("\n")}

## Execution Sequence

${checkboxLines(args.changes || args.tasks, "Fill in the first implementation step.").join("\n")}

## Validation Summary

${linesFrom(args.validation, "Fill in the smallest meaningful validation command.").join("\n")}

## Risks / Stop Conditions

${linesFrom(args.risks, "Fill in the condition that should stop implementation or trigger replanning.").join("\n")}

## Next Action

${args["next-action"] || "Developer reads plan.md, opens linked detail files as needed, then implements the first task."}
`;
}

function renderContext() {
  return `# Context

## Instruction Contracts

${scan.instructions.length ? scan.instructions.map((item) => `- ${item}`).join("\n") : "- None detected by helper. Planner should fill this in after repo inspection."}

## Repository Facts

- Git: ${scan.git.isRepository ? `yes (${scan.git.branch || "detached"})` : `no (${scan.git.note})`}
- Manifests: ${scan.manifests.length ? scan.manifests.join(", ") : "none detected"}
- Package managers: ${scan.packageManagers.length ? scan.packageManagers.join(", ") : "none detected"}

## Files Inspected

${linesFrom(args.files, "Fill in exact files inspected during planning.").join("\n")}

## Constraints And Assumptions

${linesFrom(args.assumptions, "Fill in constraints, assumptions, and inferred facts.").join("\n")}

## Decisions

${linesFrom(args.decisions, "Fill in decisions made during planning and why.").join("\n")}
`;
}

function renderTasks() {
  return `# Tasks

## Implementation Stages

${checkboxLines(args.tasks || args.changes, "Fill in sequenced implementation work.").join("\n")}

## Likely Files

${linesFrom(args.files, "Fill in likely files or directories to touch.").join("\n")}

## Acceptance Checks

${linesFrom(args.acceptance, "Fill in observable acceptance checks for the developer.").join("\n")}

## Dependencies

${linesFrom(args.dependencies, "Fill in ordering constraints or prerequisites.").join("\n")}
`;
}

function renderValidation() {
  const candidates = scan.validationCandidates.slice(0, 5).map((item) => `- \`${item.command}\` (${item.reason})`);
  return `# Validation

## Planned Checks

${linesFrom(args.validation, "Fill in validation commands and expected evidence.").join("\n")}

## Detected Candidates

${candidates.length ? candidates.join("\n") : "- None detected by helper. Planner should identify checks manually."}

## Evidence To Capture

${linesFrom(args.evidence, "Fill in command output, screenshots, logs, or review evidence needed for completion.").join("\n")}

## Skipped Checks

${linesFrom(args.skipped, "Fill in checks intentionally skipped and why.").join("\n")}
`;
}

function renderRisks() {
  return `# Risks

## Rejection Modes

${linesFrom(args.risks, "Fill in likely failure or rejection modes.").join("\n")}

## Stop Conditions

${linesFrom(args["stop-conditions"], "Fill in conditions that should stop work or trigger replanning.").join("\n")}

## Approval Boundaries

${linesFrom(args.approvals, "Fill in actions that require explicit approval.").join("\n")}

## Rollback Notes

${linesFrom(args.rollback, "Fill in rollback or recovery notes.").join("\n")}

## Open Questions

${linesFrom(args.questions, "Fill in open questions that do not block the first implementation step.").join("\n")}
`;
}

function renderHandoff() {
  return `# Action-State Handoff

- Objective: ${args.objective || ""}
- Current owner / mode: plan-file
- Instruction contracts: ${scan.instructions.join(", ")}
- Authority / approval boundary: ${args.approvals || ""}
- Scope: ${args.scope || ""}
- Exclusions: ${args.exclusions || ""}
- Current state: Progressive plan bundle created at .based/plans/${slug}/.
- Files read: ${args.files || ""}
- Files changed: .based/plans/${slug}/plan.md, .based/plans/${slug}/context.md, .based/plans/${slug}/tasks.md, .based/plans/${slug}/validation.md, .based/plans/${slug}/risks.md, .based/plans/${slug}/handoff.md
- Decisions: ${args.decisions || ""}
- Evidence: ${args.evidence || ""}
- Validation: ${args.validation || ""}
- Risks: ${args.risks || ""}
- Privacy / safety notes: ${args.safety || ""}
- Tool-trust notes: Helper-generated scaffold; planner must revise task-specific details before developer execution.
- State invariants: Developer starts from plan.md and opens linked details only as needed.
- Next action: ${args["next-action"] || "Developer implements the first task and updates validation evidence."}

Generated: ${now}
Root: ${root}
`;
}

const files = new Map([
  ["plan.md", renderPlan()],
  ["context.md", renderContext()],
  ["tasks.md", renderTasks()],
  ["validation.md", renderValidation()],
  ["risks.md", renderRisks()],
  ["handoff.md", renderHandoff()],
]);

if (args.write) {
  const baseDir = path.resolve(root, args.dir || path.join(".based", "plans"));
  const dir = path.join(baseDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, body] of files.entries()) {
    fs.writeFileSync(path.join(dir, name), body, "utf8");
  }
  console.log(path.join(dir, "plan.md"));
} else {
  for (const [name, body] of files.entries()) {
    console.log(`--- ${name} ---`);
    process.stdout.write(body);
    if (!body.endsWith("\n")) process.stdout.write("\n");
  }
}
