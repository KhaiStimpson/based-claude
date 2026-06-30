#!/usr/bin/env node
const { parseArgs, resolveRoot, inspectProject, runCommandString } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = resolveRoot(args);
const scan = inspectProject(root);
const candidates = scan.validationCandidates;

if (!candidates.length) {
  console.log("No validation candidates detected. Run based-doctor and inspect project docs.");
  process.exit(0);
}

console.log("# Based Quality Gate");
console.log("");
console.log(`Root: ${root}`);
console.log("");
for (const candidate of candidates) {
  console.log(`- ${candidate.command} (${candidate.reason})`);
}

if (!args.run) {
  console.log("");
  console.log("Dry run only. Add --run to execute these commands in order. Add --allow-shell only after reviewing commands that need shell syntax.");
  process.exit(0);
}

console.log("");
console.log("Executing validation candidates...");
for (const candidate of candidates) {
  console.log("");
  console.log(`> ${candidate.command}`);
  const result = runCommandString(candidate.command, root, {
    stdio: "inherit",
    timeout: Number(args.timeout || 120000),
    allowShell: Boolean(args["allow-shell"]),
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`Command failed with status ${result.status}: ${candidate.command}`);
    if (!args.continue) process.exit(result.status || 1);
  }
}

console.log("");
console.log("All executed validation candidates completed successfully.");
