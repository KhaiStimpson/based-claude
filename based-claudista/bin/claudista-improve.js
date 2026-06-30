#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, rootFromArgs, ensureDir, slugify, containsSensitiveText } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const action = args._[0] || "suggest";
const root = rootFromArgs(args);
const dir = path.join(root, ".based-claudista", "improvements");

if (action !== "suggest") {
  console.error("Supported action: suggest");
  process.exit(1);
}

const title = args.title || "Untitled improvement";
const body = [
  "# Improvement Proposal",
  "",
  `Title: ${title}`,
  `Created: ${new Date().toISOString()}`,
  "",
  "## Target Surface",
  "",
  args.target || "workflow",
  "",
  "## Trace Evidence",
  "",
  args.evidence || "No trace evidence supplied.",
  "",
  "## Proposal",
  "",
  args.summary || "",
  "",
  "## Validation Plan",
  "",
  args.validation || "Run the smallest deterministic check that can falsify the change.",
  "",
  "## Independent Review",
  "",
  "Required for evaluator, safety, memory-policy, executable script, hook, MCP, or trust-boundary changes.",
  "",
  "## Rollback",
  "",
  args.rollback || "Revert the changed artifact and retire this proposal.",
  "",
  "## Retirement Condition",
  "",
  args.retirement || "When stale, contradicted, or superseded by stronger evidence.",
  "",
].join("\n");

if (containsSensitiveText(body)) {
  console.error("Proposal appears to contain sensitive text. Refusing to write.");
  process.exit(1);
}

ensureDir(dir);
const file = path.join(dir, `${slugify(title)}.md`);
fs.writeFileSync(file, body, "utf8");
console.log(`Wrote ${file}`);
