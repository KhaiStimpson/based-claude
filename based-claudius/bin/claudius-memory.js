#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  parseArgs,
  resolveRoot,
  readText,
  readJsonl,
  writeJsonl,
  parseFrontmatter,
  replaceFrontmatterField,
  listMarkdownFiles,
  slugify,
  csv,
  yamlString,
  today,
  timestampId,
  containsSensitiveText,
  ensureDir,
} = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const action = args._[0] || "help";
const root = resolveRoot(args);
const memoryRoot = path.resolve(root, args.dir || ".claudius/memory");
const cardsRoot = path.join(memoryRoot, "cards");
const draftsDir = path.join(cardsRoot, "drafts");
const activeDir = path.join(cardsRoot, "active");
const retiredDir = path.join(cardsRoot, "retired");
const traceFile = path.resolve(root, args.trace || ".claudius/traces/actions.jsonl");

const VALID_SCOPES = new Set(["session", "feature", "repo", "user", "global"]);
const VALID_STATUS = new Set(["draft", "active", "superseded", "retired"]);

function usage() {
  console.log(`Based Memory

Usage:
  claudius-memory new --title "..." --scope repo --summary "..." --evidence "..." [--write]
  claudius-memory suggest [--write] [--limit 20] [--from-successes]
  claudius-memory promote <slug-or-file> --approved [--supersession-reviewed] [--force]
  claudius-memory retrieve --query "..." [--scope repo,user] [--limit 5]
  claudius-memory retire <slug-or-file> --approved
  claudius-memory audit [--strict] [--recovery]
  claudius-memory list [--status active|draft|retired]
  claudius-memory show <slug-or-file>

Writes are explicit. New and suggest print drafts unless --write is provided. Promote and retire require --approved and supersede the source card (drafts are removed on promotion, active cards are removed on retirement) so retired or superseded claims stop appearing in retrieve results. --recovery on audit additionally verifies each active card is findable via its own applies_when/title cues and that no retired or superseded card still sits in active/.`);
}

function cardPathFor(dir, title) {
  return path.join(dir, `${slugify(title)}.md`);
}

function cardBody(input) {
  const title = input.title || "Untitled Memory Card";
  const date = today();
  return `---
type: memory-card
title: ${yamlString(title)}
scope: ${input.scope || "repo"}
status: ${input.status || "draft"}
created: ${date}
updated: ${date}
source:
  kind: ${input.sourceKind || "validated-trace"}
  path_or_id: ${yamlString(input.source || "")}
  captured_by: "based-claudius"
provenance:
  evidence:
    - ${yamlString(input.evidence || "")}
  derivation: ${yamlString(input.derivation || "Distilled from user-approved evidence.")}
confidence: ${input.confidence || "medium"}
applies_when: []
does_not_apply_when: []
supersedes: []
superseded_by: []
retirement_condition: ${yamlString(input.retirement || "When evidence is superseded or no longer reproduces.")}
privacy:
  contains_sensitive_data: false
  allowed_readers:
    - "project"
---

# ${title}

## Claim

${input.summary || ""}

## Evidence

- ${input.evidence || ""}

## How To Use

-

## Failure Modes

-

## Validation

-
`;
}

function allCards() {
  return listMarkdownFiles(cardsRoot);
}

function cardsByStatus(status) {
  return allCards().filter((file) => {
    const meta = parseFrontmatter(readText(file));
    return !status || meta.status === status || file.includes(`/${status}/`) || file.includes(`\\${status}\\`);
  });
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

function meaningful(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== "-" && line !== "- \"\"" && line !== "- ''")
    .join("\n")
    .trim();
}

function yamlFieldValue(text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^\\s*${escaped}:\\s*(.*)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

function yamlListItems(text, field) {
  const lines = text.split(/\r?\n/);
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = lines.findIndex((line) => new RegExp(`^\\s*${escaped}:\\s*$`).test(line));
  if (start < 0) return [];
  const items = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() && !/^\s/.test(line)) break;
    const match = line.match(/^\s*-\s*(.*)$/);
    if (match) {
      const value = match[1].trim().replace(/^["']|["']$/g, "");
      if (value) items.push(value);
    }
  }
  return items;
}

function firstMeaningfulLine(value) {
  return meaningful(value).split(/\r?\n/).map((line) => line.replace(/^-\s*/, "").trim()).find(Boolean) || "";
}

function resolveCard(target) {
  if (!target) {
    console.error("A card slug or file path is required.");
    process.exit(1);
  }
  const direct = path.resolve(root, target);
  const slug = target.replace(/\.md$/, "");
  const candidates = [
    direct,
    path.join(draftsDir, `${slug}.md`),
    path.join(activeDir, `${slug}.md`),
    path.join(retiredDir, `${slug}.md`),
    path.join(cardsRoot, `${slug}.md`),
  ];
  const found = candidates.find((file) => fs.existsSync(file));
  if (!found) {
    console.error(`Card not found: ${target}`);
    process.exit(1);
  }
  return found;
}

function writeDraft(body, title) {
  if (containsSensitiveText(body)) {
    console.error("Refusing memory draft because it appears to contain sensitive material.");
    process.exit(1);
  }
  ensureDir(draftsDir);
  const file = cardPathFor(draftsDir, title);
  if (fs.existsSync(file) && !args.force) {
    console.error(`Refusing to overwrite existing draft without --force: ${file}`);
    process.exit(1);
  }
  fs.writeFileSync(file, body, "utf8");
  console.log(file);
}

function newCard() {
  const input = {
    title: args.title || "Untitled Memory Card",
    scope: args.scope || "repo",
    summary: args.summary || "",
    evidence: args.evidence || "",
    source: args.source || "",
    sourceKind: args.sourceKind || "validated-trace",
    derivation: args.derivation || "",
    confidence: args.confidence || "medium",
    retirement: args.retirement || "",
  };
  const body = cardBody(input);
  if (args.write) writeDraft(body, input.title);
  else process.stdout.write(body);
}

function suggest() {
  const limit = Number(args.limit || 20);
  const records = readJsonl(traceFile)
    .filter((record) => !record.__error)
    .filter((record) => record.memoryCandidate || (args["from-successes"] && record.validation === "pass"))
    .slice(-limit);
  if (!records.length) {
    console.log(`No memory candidates found at ${traceFile}`);
    return;
  }
  for (const record of records) {
    const title = `Trace ${record.event || "memory"} ${record.id}`;
    const body = cardBody({
      title,
      scope: args.scope || "repo",
      summary: record.summary || record.objective || "Trace candidate requires human review before promotion.",
      evidence: `${traceFile}#${record.id}`,
      source: record.id,
      sourceKind: "trace",
      confidence: record.memoryCandidate ? "medium" : "low",
      retirement: "When the trace no longer reflects current repository behavior.",
    });
    if (args.write) writeDraft(body, title);
    else {
      process.stdout.write(body);
      process.stdout.write("\n---\n");
    }
  }
}

function auditCard(file, options = {}) {
  const text = readText(file);
  const meta = parseFrontmatter(text);
  const required = ["type", "title", "scope", "status", "created", "updated", "confidence"];
  const problems = [];
  for (const field of required) {
    if (!meta[field]) problems.push(`missing ${field}`);
  }
  if (meta.type && meta.type !== "memory-card") problems.push("type is not memory-card");
  if (meta.scope && !VALID_SCOPES.has(meta.scope)) problems.push(`invalid scope ${meta.scope}`);
  if (meta.status && !VALID_STATUS.has(meta.status)) problems.push(`invalid status ${meta.status}`);
  if (containsSensitiveText(text)) problems.push("possible sensitive material");
  if (options.strict) {
    for (const field of ["kind", "path_or_id", "captured_by", "derivation", "retirement_condition", "contains_sensitive_data"]) {
      if (!meaningful(yamlFieldValue(text, field))) problems.push(`missing ${field}`);
    }
    if (!yamlListItems(text, "evidence").length) problems.push("missing provenance evidence");
    if (!yamlListItems(text, "allowed_readers").length) problems.push("missing allowed_readers");
    for (const heading of ["Claim", "Evidence", "How To Use", "Failure Modes", "Validation"]) {
      if (!meaningful(section(text, heading))) problems.push(`missing ${heading} section content`);
    }
  }
  return { file, meta, text, problems };
}

function activeConflicts(file, check) {
  if (check.meta.status === "active") return [];
  const targetActive = path.resolve(activeDir, path.basename(file));
  const claim = firstMeaningfulLine(section(check.text, "Claim")).toLowerCase();
  const conflicts = [];
  for (const existing of cardsByStatus("active")) {
    if (path.resolve(existing) === path.resolve(file) || path.resolve(existing) === targetActive) continue;
    const existingText = readText(existing);
    const existingMeta = parseFrontmatter(existingText);
    const sameScope = (existingMeta.scope || "") === (check.meta.scope || "");
    const sameTitle = sameScope && existingMeta.title && check.meta.title && existingMeta.title.toLowerCase() === check.meta.title.toLowerCase();
    const existingClaim = firstMeaningfulLine(section(existingText, "Claim")).toLowerCase();
    const sameClaim = sameScope && claim && existingClaim && claim === existingClaim;
    if (sameTitle || sameClaim) conflicts.push(path.relative(root, existing).replace(/\\/g, "/"));
  }
  return conflicts;
}

function supersedesConflicts(text, conflicts) {
  const supersedes = yamlListItems(text, "supersedes").map((item) => item.toLowerCase());
  return conflicts.every((conflict) => {
    const lower = conflict.toLowerCase();
    const base = path.basename(conflict, ".md").toLowerCase();
    return supersedes.includes(lower) || supersedes.includes(base);
  });
}

function audit() {
  const files = allCards();
  let failures = 0;
  if (!files.length) {
    console.log(`No memory cards found at ${cardsRoot}`);
  } else {
    const activeTitles = new Map();
    const activeClaims = new Map();
    for (const file of files) {
      const result = auditCard(file, { strict: Boolean(args.strict) });
      if (result.meta.status === "active" && result.meta.title) {
        const key = `${result.meta.scope || ""}:${result.meta.title.toLowerCase()}`;
        if (activeTitles.has(key)) result.problems.push(`duplicate active title also in ${activeTitles.get(key)}`);
        else activeTitles.set(key, path.relative(root, file).replace(/\\/g, "/"));
      }
      if (result.meta.status === "active") {
        const claim = firstMeaningfulLine(section(result.text, "Claim")).toLowerCase();
        const key = `${result.meta.scope || ""}:${claim}`;
        if (claim && activeClaims.has(key)) result.problems.push(`duplicate active claim also in ${activeClaims.get(key)}`);
        else if (claim) activeClaims.set(key, path.relative(root, file).replace(/\\/g, "/"));
      }
      if (result.problems.length) {
        failures += 1;
        console.log(`FAIL ${path.relative(root, file).replace(/\\/g, "/")}: ${result.problems.join(", ")}`);
      } else {
        console.log(`OK   ${path.relative(root, file).replace(/\\/g, "/")} (${result.meta.scope}, ${result.meta.status}, ${result.meta.confidence})`);
      }
    }
  }
  if (args.recovery) {
    console.log("");
    console.log("## Recovery Audit");
    failures += recoveryAudit();
  }
  if (failures) process.exit(1);
}

function recoveryAudit() {
  let failures = 0;
  const activeCards = cardsByStatus("active");
  if (!activeCards.length) {
    console.log("No active cards to test for recovery.");
  }
  for (const file of activeCards) {
    const text = readText(file);
    const meta = parseFrontmatter(text);
    const cues = yamlListItems(text, "applies_when");
    const query = (cues.length ? cues.join(" ") : meta.title || "").trim();
    const rel = path.relative(root, file).replace(/\\/g, "/");
    if (!query) {
      console.log(`WARN ${rel}: no applies_when cues or title to test recovery`);
      continue;
    }
    const scopes = meta.scope ? new Set([meta.scope]) : undefined;
    const limit = Number(args.limit || 5);
    const matches = scoreActiveCards(query, scopes)
      .slice(0, limit)
      .some((result) => path.resolve(result.file) === path.resolve(file));
    if (!matches) {
      failures += 1;
      console.log(`FAIL ${rel}: not recoverable in top ${limit} for its own applies_when/title cues ("${query}")`);
    } else {
      console.log(`OK   ${rel} recoverable via its own cues`);
    }
  }
  const retiredOrSuperseded = cardsByStatus("retired").concat(cardsByStatus("superseded"));
  for (const file of retiredOrSuperseded) {
    const slug = path.basename(file);
    const activePath = path.join(activeDir, slug);
    if (path.resolve(file) !== path.resolve(activePath) && fs.existsSync(activePath)) {
      failures += 1;
      console.log(
        `FAIL ${path.relative(root, file).replace(/\\/g, "/")}: retired/superseded card still present in active/ (${path.relative(root, activePath).replace(/\\/g, "/")})`
      );
    }
  }
  return failures;
}

function promote() {
  if (!args.approved) {
    console.error("promote requires --approved.");
    process.exit(1);
  }
  const file = resolveCard(args._[1]);
  const check = auditCard(file, { strict: true });
  if (check.problems.length) {
    console.error(`Refusing promotion: ${check.problems.join(", ")}`);
    process.exit(1);
  }
  const conflicts = activeConflicts(file, check);
  if (conflicts.length && !supersedesConflicts(check.text, conflicts)) {
    if (!(args.force && args["supersession-reviewed"])) {
      console.error(`Refusing promotion: active memory conflicts require supersedes entries or --force --supersession-reviewed (${conflicts.join(", ")})`);
      process.exit(1);
    }
  }
  const slug = path.basename(file);
  const active = path.join(activeDir, slug);
  if (fs.existsSync(active) && !args.force) {
    console.error(`Active card already exists. Use --force only after supersession review: ${active}`);
    process.exit(1);
  }
  let text = replaceFrontmatterField(readText(file), "status", "active");
  text = replaceFrontmatterField(text, "updated", today());
  ensureDir(activeDir);
  fs.writeFileSync(active, text, "utf8");
  if (path.resolve(file) !== path.resolve(active)) {
    fs.rmSync(file, { force: true });
  }
  writeJsonl(path.join(memoryRoot, "promotions.jsonl"), {
    id: timestampId("memory-promotion"),
    timestamp: new Date().toISOString(),
    source: path.relative(root, file).replace(/\\/g, "/"),
    target: path.relative(root, active).replace(/\\/g, "/"),
    approved: true,
    conflicts,
    supersessionReviewed: Boolean(args["supersession-reviewed"]),
    forced: Boolean(args.force),
  });
  console.log(active);
}

function retire() {
  if (!args.approved) {
    console.error("retire requires --approved.");
    process.exit(1);
  }
  const file = resolveCard(args._[1]);
  let text = replaceFrontmatterField(readText(file), "status", "retired");
  text = replaceFrontmatterField(text, "updated", today());
  ensureDir(retiredDir);
  const retired = path.join(retiredDir, path.basename(file));
  fs.writeFileSync(retired, text, "utf8");
  if (path.resolve(file) !== path.resolve(retired)) {
    fs.rmSync(file, { force: true });
  }
  writeJsonl(path.join(memoryRoot, "retirements.jsonl"), {
    id: timestampId("memory-retirement"),
    timestamp: new Date().toISOString(),
    source: path.relative(root, file).replace(/\\/g, "/"),
    target: path.relative(root, retired).replace(/\\/g, "/"),
    approved: true,
  });
  console.log(retired);
}

function bodyOnly(text) {
  // Strip the YAML frontmatter block so search matches the card's actual claim/evidence
  // prose, not an incidental echo of its own applies_when/scope/confidence plumbing.
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return text;
  return text.slice(end + 4);
}

function scoreActiveCards(query, scopes) {
  const terms = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  const results = [];
  for (const file of cardsByStatus("active")) {
    const text = readText(file);
    const meta = parseFrontmatter(text);
    if (meta.scope && scopes && !scopes.has(meta.scope)) continue;
    const haystack = `${meta.title || ""}\n${bodyOnly(text)}`.toLowerCase();
    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    if (score > 0) results.push({ file, meta, score, text });
  }
  results.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));
  return results;
}

function retrieve() {
  const query = args.query || args._[1] || "";
  if (!query.trim()) {
    console.error("retrieve requires --query.");
    process.exit(1);
  }
  const scopes = new Set(csv(args.scope || "repo,user,global"));
  const results = scoreActiveCards(query, scopes);
  for (const result of results.slice(0, Number(args.limit || 5))) {
    const rel = path.relative(root, result.file).replace(/\\/g, "/");
    const claim = (result.text.match(/## Claim\s+([\s\S]*?)(\n## |\s*$)/) || [])[1]?.trim().split(/\r?\n/)[0] || "";
    console.log(`${rel} score=${result.score} scope=${result.meta.scope || ""} confidence=${result.meta.confidence || ""}`);
    if (claim) console.log(`  ${claim}`);
  }
}

function list() {
  for (const file of cardsByStatus(args.status || "")) {
    const meta = parseFrontmatter(readText(file));
    console.log(`${path.relative(root, file).replace(/\\/g, "/")} ${meta.status || "-"} ${meta.scope || "-"} ${meta.title || ""}`);
  }
}

function show() {
  process.stdout.write(readText(resolveCard(args._[1])));
}

if (action === "help" || args.help) usage();
else if (action === "new") newCard();
else if (action === "suggest") suggest();
else if (action === "promote") promote();
else if (action === "retrieve" || action === "search") retrieve();
else if (action === "retire") retire();
else if (action === "audit") audit();
else if (action === "list") list();
else if (action === "show") show();
else {
  console.error(`Unknown action: ${action}`);
  usage();
  process.exit(1);
}
