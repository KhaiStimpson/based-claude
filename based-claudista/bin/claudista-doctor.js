#!/usr/bin/env node
const { parseArgs, rootFromArgs, inspectProject } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = rootFromArgs(args);
const scan = inspectProject(root);

if (args.format === "json") {
  console.log(JSON.stringify(scan, null, 2));
  process.exit(0);
}

console.log("# Claudista Doctor");
console.log("");
console.log(`- Root: ${scan.root}`);
console.log(`- Timestamp: ${scan.timestamp}`);
console.log("");
console.log("## Instructions");
if (scan.instructions.length) scan.instructions.forEach((item) => console.log(`- ${item}`));
else console.log("- None detected.");
console.log("");
console.log("## Manifests");
if (scan.manifests.length) scan.manifests.forEach((item) => console.log(`- ${item}`));
else console.log("- None detected.");
console.log("");
console.log("## Validation Candidates");
if (scan.validationCandidates.length) scan.validationCandidates.forEach((item) => console.log(`- \`${item.command}\` (${item.reason})`));
else console.log("- None detected.");
console.log("");
console.log("## Tests");
if (scan.tests.length) scan.tests.slice(0, 20).forEach((item) => console.log(`- ${item}`));
else console.log("- None detected.");
