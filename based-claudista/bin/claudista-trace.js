#!/usr/bin/env node
const path = require("path");
const { parseArgs, rootFromArgs, writeJsonl, readJsonl, csv, timestampId, containsSensitiveText } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const action = args._[0] || "list";
const root = rootFromArgs(args);
const tracePath = path.join(root, ".based-claudista", "traces", "actions.jsonl");

if (action === "append") {
  const record = {
    id: timestampId("trace"),
    timestamp: new Date().toISOString(),
    taskId: args.task || "",
    event: args.event || "note",
    objective: args.objective || "",
    summary: args.summary || "",
    actor: args.actor || "based-claudista",
    authority: args.authority || "",
    files: csv(args.files),
    commands: csv(args.commands),
    validation: args.validation || "",
    decisions: csv(args.decisions),
    evidence: csv(args.evidence),
    risks: csv(args.risks),
    memoryCandidate: Boolean(args["memory-candidate"]),
    improvementCandidate: Boolean(args["improvement-candidate"]),
  };
  const serialized = JSON.stringify(record);
  if (containsSensitiveText(serialized)) {
    console.error("Trace appears to contain sensitive text. Refusing to write.");
    process.exit(1);
  }
  writeJsonl(tracePath, record);
  console.log(`Wrote ${record.id} to ${tracePath}`);
  process.exit(0);
}

const traces = readJsonl(tracePath);
if (action === "summarize") {
  const byEvent = {};
  for (const trace of traces) byEvent[trace.event || "unknown"] = (byEvent[trace.event || "unknown"] || 0) + 1;
  console.log(JSON.stringify({ path: tracePath, count: traces.length, byEvent }, null, 2));
  process.exit(0);
}

const limit = Number(args.limit || 10);
for (const trace of traces.slice(-limit)) {
  console.log(`${trace.timestamp || ""} ${trace.event || "note"} ${trace.summary || ""}`.trim());
}
