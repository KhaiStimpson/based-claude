#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  parseArgs,
  resolveRoot,
  ensureDir,
  readText,
  readJsonl,
  writeJsonl,
  parseFrontmatter,
  replaceFrontmatterField,
  listMarkdownFiles,
  slugify,
  timestampId,
  yamlString,
  today,
  containsSensitiveText,
  runCommandString,
} = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const action = args._[0] || "help";
const root = resolveRoot(args);
const baseDir = path.resolve(root, args.dir || ".claudius/improvements");
const proposalsDir = path.join(baseDir, "proposals");
const acceptedDir = path.join(baseDir, "accepted");
const evalFile = path.join(baseDir, "evaluations.jsonl");
const reviewFile = path.join(baseDir, "reviews.jsonl");
const traceFile = path.resolve(root, args.trace || ".claudius/traces/actions.jsonl");

function usage() {
  console.log(`Based Improve

Usage:
  claudius-improve propose --title "..." --problem "..." --change "..." --evidence "..." [--write]
  claudius-improve suggest [--write] [--limit 20]
  claudius-improve list
  claudius-improve show <slug-or-file>
  claudius-improve evaluate <slug-or-file> --command "npm run check" [--write] [--allow-shell]
  claudius-improve review <slug-or-file> --verdict approve --evidence "..." [--write]
  claudius-improve promote <slug-or-file> --approved [--reviewed --review-evidence "..."] [--force]

Self-improvement changes are proposals until approved and validated. Promote records acceptance; it does not silently edit skills, prompts, scripts, or validators.`);
}

function proposalBody(input) {
  const title = input.title || "Untitled Improvement";
  const slug = slugify(title);
  const date = today();
  return `---
type: improvement-proposal
title: ${yamlString(title)}
slug: ${slug}
status: proposed
target: ${yamlString(input.target || "")}
created: ${date}
updated: ${date}
source:
  kind: ${input.sourceKind || "validated-trace"}
  path_or_id: ${yamlString(input.source || "")}
confidence: ${input.confidence || "medium"}
rollback: ${yamlString(input.rollback || "Revert the proposed change and retire this proposal.")}
retirement_condition: ${yamlString(input.retirement || "When the target behavior, API, or evidence no longer applies.")}
---

# ${title}

## Problem

${input.problem || ""}

## Evidence

- ${input.evidence || ""}

## Proposed Change

${input.change || ""}

## Validation Plan

- ${input.validation || "Run deterministic checks for the touched target and compare behavior before promotion."}

## Before / After Evidence

- Before:
- After:

## Safety Notes

- Requires approval before modifying skills, prompts, scripts, validators, or memory policy.
- Evaluator or safety changes require independent review.
`;
}

function resolveProposal(target) {
  if (!target) {
    console.error("A proposal slug or file path is required.");
    process.exit(1);
  }
  const direct = path.resolve(root, target);
  const proposed = path.join(proposalsDir, `${target.replace(/\.md$/, "")}.md`);
  const accepted = path.join(acceptedDir, `${target.replace(/\.md$/, "")}.md`);
  if (fs.existsSync(direct)) return direct;
  if (fs.existsSync(proposed)) return proposed;
  if (fs.existsSync(accepted)) return accepted;
  console.error(`Proposal not found: ${target}`);
  process.exit(1);
}

function writeProposal(body, title) {
  const slug = slugify(title);
  ensureDir(proposalsDir);
  const file = path.join(proposalsDir, `${slug}.md`);
  if (fs.existsSync(file) && !args.force) {
    console.error(`Refusing to overwrite existing proposal without --force: ${file}`);
    process.exit(1);
  }
  fs.writeFileSync(file, body, "utf8");
  console.log(file);
}

function propose() {
  const input = {
    title: args.title || "Untitled Improvement",
    problem: args.problem || "",
    evidence: args.evidence || "",
    change: args.change || "",
    validation: args.validation || "",
    target: args.target || "",
    source: args.source || "",
    sourceKind: args.sourceKind || "validated-trace",
    confidence: args.confidence || "medium",
    rollback: args.rollback || "",
    retirement: args.retirement || "",
  };
  const body = proposalBody(input);
  if (containsSensitiveText(body)) {
    console.error("Refusing proposal because it appears to contain sensitive material.");
    process.exit(1);
  }
  if (args.write) writeProposal(body, input.title);
  else process.stdout.write(body);
}

function suggest() {
  const limit = Number(args.limit || 20);
  const records = readJsonl(traceFile)
    .filter((record) => !record.__error)
    .filter((record) => record.improvementCandidate || record.memoryCandidate || record.validation === "fail")
    .slice(-limit);
  if (!records.length) {
    console.log(`No trace candidates found at ${traceFile}`);
    return;
  }
  for (const record of records) {
    const title = record.improvementCandidate
      ? `Improve ${record.event || "workflow"} from ${record.id}`
      : `Review trace candidate ${record.id}`;
    const body = proposalBody({
      title,
      problem: record.summary || record.objective || "Trace candidate requires review.",
      evidence: `${traceFile}#${record.id}`,
      change: "Inspect the trace and decide whether to revise a skill, memory card, script, validation check, or workflow rule.",
      validation: "Run the plugin check and a focused replay or quality gate before promotion.",
      target: "",
      source: record.id,
      sourceKind: "trace",
      confidence: "low",
    });
    if (args.write) writeProposal(body, title);
    else {
      process.stdout.write(body);
      process.stdout.write("\n---\n");
    }
  }
}

function list() {
  for (const file of listMarkdownFiles(baseDir)) {
    const meta = parseFrontmatter(readText(file));
    console.log(`${path.relative(root, file).replace(/\\/g, "/")} ${meta.status || "-"} ${meta.title || ""}`);
  }
}

function show() {
  process.stdout.write(readText(resolveProposal(args._[1])));
}

function proposalRel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function section(text, heading) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading.toLowerCase()}`);
  if (start < 0) return "";
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n").trim();
}

function requiresIndependentReview(file) {
  const text = readText(file);
  const meta = parseFrontmatter(text);
  const haystack = [
    meta.target || "",
    section(text, "Problem"),
    section(text, "Proposed Change"),
  ].join("\n");
  return /\b(evaluator|rubric|validator|safety policy|memory policy|durable memory|privacy policy|credential|secret|permission|executable|script|hook|mcp|package publish|package publishing|bin[\\/]|\.js\b|\.cmd\b|\.sh\b)\b/i.test(haystack);
}

function review() {
  const file = resolveProposal(args._[1]);
  const verdict = String(args.verdict || args.result || "").toLowerCase();
  if (!verdict) {
    console.error("review requires --verdict.");
    process.exit(1);
  }
  if (!args.evidence) {
    console.error("review requires --evidence.");
    process.exit(1);
  }
  const record = {
    id: timestampId("improve-review"),
    timestamp: new Date().toISOString(),
    proposal: proposalRel(file),
    reviewer: args.reviewer || "independent-review",
    verdict,
    evidence: args.evidence,
    notes: args.notes || "",
  };
  if (args.write) writeJsonl(reviewFile, record);
  console.log(JSON.stringify(record, null, 2));
  if (!["approve", "approved", "pass"].includes(verdict)) process.exit(1);
}

function evaluate() {
  const file = resolveProposal(args._[1]);
  const command = args.command;
  if (!command) {
    console.error("evaluate requires --command.");
    process.exit(1);
  }
  console.log(`> ${command}`);
  const result = runCommandString(command, root, {
    encoding: "utf8",
    timeout: Number(args.timeout || 120000),
    allowShell: Boolean(args["allow-shell"]),
  });
  const record = {
    id: timestampId("improve-eval"),
    timestamp: new Date().toISOString(),
    proposal: proposalRel(file),
    command,
    allowShell: Boolean(args["allow-shell"]),
    status: typeof result.status === "number" ? result.status : 1,
    stdout: (result.stdout || "").slice(-4000),
    stderr: (result.stderr || result.error || "").slice(-4000),
  };
  if (args.write) writeJsonl(evalFile, record);
  console.log(JSON.stringify(record, null, 2));
  process.exit(record.status === 0 ? 0 : 1);
}

function hasPassingEvaluation(file) {
  const rel = proposalRel(file);
  return readJsonl(evalFile).some((record) => record.proposal === rel && record.status === 0);
}

function hasApprovedReview(file) {
  const rel = proposalRel(file);
  return readJsonl(reviewFile).some((record) =>
    record.proposal === rel && ["approve", "approved", "pass"].includes(String(record.verdict || "").toLowerCase())
  );
}

function promote() {
  if (!args.approved) {
    console.error("promote requires --approved.");
    process.exit(1);
  }
  const file = resolveProposal(args._[1]);
  if (!args.force && !hasPassingEvaluation(file)) {
    console.error(`No passing evaluation found for ${path.relative(root, file)}. Run evaluate --write or use --force.`);
    process.exit(1);
  }
  const original = readText(file);
  if (containsSensitiveText(original)) {
    console.error("Refusing to promote because the proposal appears to contain sensitive material.");
    process.exit(1);
  }
  const reviewRequired = requiresIndependentReview(file);
  const externallyReviewed = Boolean(args.reviewed && args["review-evidence"]);
  if (reviewRequired && !hasApprovedReview(file) && !externallyReviewed) {
    console.error("Independent review is required for evaluator, safety, memory-policy, executable-script, or trust-boundary changes. Run review --write or pass --reviewed --review-evidence \"...\".");
    process.exit(1);
  }
  let next = replaceFrontmatterField(original, "status", "accepted");
  next = replaceFrontmatterField(next, "updated", today());
  ensureDir(acceptedDir);
  const target = path.join(acceptedDir, path.basename(file));
  if (fs.existsSync(target) && !args.force) {
    console.error(`Refusing to overwrite accepted proposal without --force: ${target}`);
    process.exit(1);
  }
  fs.writeFileSync(target, next, "utf8");
  writeJsonl(path.join(baseDir, "promotions.jsonl"), {
    id: timestampId("improve-promotion"),
    timestamp: new Date().toISOString(),
    proposal: proposalRel(target),
    source: proposalRel(file),
    approved: true,
    reviewRequired,
    reviewEvidence: args["review-evidence"] || "",
    forced: Boolean(args.force),
  });
  console.log(target);
}

if (action === "help" || args.help) usage();
else if (action === "propose") propose();
else if (action === "suggest") suggest();
else if (action === "list") list();
else if (action === "show") show();
else if (action === "review") review();
else if (action === "evaluate") evaluate();
else if (action === "promote") promote();
else {
  console.error(`Unknown action: ${action}`);
  usage();
  process.exit(1);
}
