#!/usr/bin/env node
const path = require("path");
const {
  parseArgs,
  resolveRoot,
  readJsonl,
  writeJsonl,
  csv,
  timestampId,
} = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const action = args._[0] || "help";
const root = resolveRoot(args);
const traceFile = path.resolve(root, args.file || ".based/traces/actions.jsonl");

function usage() {
  console.log(`Based Trace

Usage:
  based-trace append --objective "..." --event validation --summary "..." [options]
  based-trace list [--limit 20]
  based-trace summarize [--limit 20]
  based-trace path

Append options:
  --task ID
  --actor NAME
  --authority allow|warn|escalate|block
  --files "a,b"
  --commands "npm test,npm run check"
  --validation pass|fail|skipped
  --decisions "a,b"
  --evidence "a,b"
  --risks "a,b"
  --memory-candidate
  --improvement-candidate

Trace append is explicit. The plugin does not install background capture hooks.`);
}

function append() {
  const now = new Date().toISOString();
  const record = {
    id: args.id || timestampId("trace"),
    timestamp: now,
    taskId: args.task || "",
    event: args.event || "note",
    objective: args.objective || "",
    summary: args.summary || "",
    actor: args.actor || "based-claude",
    authority: args.authority || "allow",
    files: csv(args.files),
    commands: csv(args.commands),
    validation: args.validation || "",
    decisions: csv(args.decisions),
    evidence: csv(args.evidence),
    risks: csv(args.risks),
    memoryCandidate: Boolean(args["memory-candidate"]),
    improvementCandidate: Boolean(args["improvement-candidate"]),
  };
  writeJsonl(traceFile, record);
  console.log(record.id);
}

function list() {
  const limit = Number(args.limit || 20);
  const records = readJsonl(traceFile).filter((record) => !record.__error);
  for (const record of records.slice(-limit)) {
    console.log(`${record.timestamp} ${record.event} ${record.validation || "-"} ${record.summary || record.objective || record.id}`);
  }
}

function summarize() {
  const limit = Number(args.limit || 20);
  const records = readJsonl(traceFile).filter((record) => !record.__error).slice(-limit);
  const byEvent = new Map();
  const candidates = { memory: 0, improvement: 0 };
  for (const record of records) {
    byEvent.set(record.event, (byEvent.get(record.event) || 0) + 1);
    if (record.memoryCandidate) candidates.memory += 1;
    if (record.improvementCandidate) candidates.improvement += 1;
  }
  console.log("# Trace Summary");
  console.log("");
  console.log(`Trace file: ${traceFile}`);
  console.log(`Records inspected: ${records.length}`);
  console.log("");
  console.log("## Events");
  if (byEvent.size) {
    [...byEvent.entries()].sort().forEach(([event, count]) => console.log(`- ${event}: ${count}`));
  } else {
    console.log("- None.");
  }
  console.log("");
  console.log("## Candidates");
  console.log(`- memory: ${candidates.memory}`);
  console.log(`- improvement: ${candidates.improvement}`);
}

if (action === "help" || args.help) usage();
else if (action === "append") append();
else if (action === "list") list();
else if (action === "summarize") summarize();
else if (action === "path") console.log(traceFile);
else {
  console.error(`Unknown action: ${action}`);
  usage();
  process.exit(1);
}

