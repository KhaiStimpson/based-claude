#!/usr/bin/env node
const { parseArgs, rootFromArgs, inspectProject, runCommandString } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = rootFromArgs(args);
const scan = inspectProject(root);
const command = args.command || (scan.validationCandidates[0] && scan.validationCandidates[0].command);

if (args.format === "json" && !args.run) {
  console.log(JSON.stringify({ root, validationCandidates: scan.validationCandidates }, null, 2));
  process.exit(0);
}

console.log("# Claudista Quality Gate");
console.log("");
console.log(`Root: ${root}`);
console.log("");
console.log("## Candidates");
if (scan.validationCandidates.length) scan.validationCandidates.forEach((item) => console.log(`- \`${item.command}\` (${item.reason})`));
else console.log("- No validation candidates detected.");

if (!args.run) {
  console.log("");
  console.log("No commands were run. Add --run to execute the first candidate or --command \"...\" --run to execute a selected command.");
  process.exit(0);
}

if (!command) {
  console.log("");
  console.log("No command selected.");
  process.exit(1);
}

console.log("");
console.log(`## Running \`${command}\``);
const result = runCommandString(command, root, { allowShell: Boolean(args["allow-shell"]) });
if (result.stdout.trim()) {
  console.log("");
  console.log("### stdout");
  console.log(result.stdout.trim());
}
if (result.stderr.trim()) {
  console.log("");
  console.log("### stderr");
  console.log(result.stderr.trim());
}
console.log("");
console.log(`Exit status: ${result.status}`);
process.exit(result.status);
