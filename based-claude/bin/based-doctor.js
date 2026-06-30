#!/usr/bin/env node
const { parseArgs, resolveRoot, inspectProject, renderScanMarkdown } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const root = resolveRoot(args);
const scan = inspectProject(root);

if (args.json) {
  process.stdout.write(`${JSON.stringify(scan, null, 2)}\n`);
} else {
  process.stdout.write(`${renderScanMarkdown(scan)}\n`);
}

