#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, rootFromArgs, ensureDir, timestampId, containsSensitiveText } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = rootFromArgs(args);
const body = [
  "# Based Claudista Handoff",
  "",
  `Objective: ${args.objective || ""}`,
  "",
  `Status: ${args.status || ""}`,
  "",
  `Workflow mode: ${args.mode || "manual"}`,
  "",
  `Files read: ${args["files-read"] || ""}`,
  "",
  `Files changed: ${args["files-changed"] || ""}`,
  "",
  `Decisions: ${args.decisions || ""}`,
  "",
  `Evidence: ${args.evidence || ""}`,
  "",
  `Validation: ${args.validation || ""}`,
  "",
  `Risks: ${args.risks || ""}`,
  "",
  `Blockers: ${args.blockers || ""}`,
  "",
  `Next action: ${args.next || ""}`,
  "",
].join("\n");

if (containsSensitiveText(body)) {
  console.error("Handoff appears to contain sensitive text. Refusing to write.");
  process.exit(1);
}

if (!args.write) {
  console.log(body);
  process.exit(0);
}

const dir = path.join(root, ".based-claudista", "handoffs");
ensureDir(dir);
const file = path.join(dir, `${timestampId("handoff")}.md`);
fs.writeFileSync(file, body, "utf8");
console.log(`Wrote ${file}`);
