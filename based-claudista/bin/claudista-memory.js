#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, rootFromArgs, ensureDir, slugify, csv, containsSensitiveText, readText } = require("./_lib");

const args = parseArgs(process.argv.slice(2));
const action = args._[0] || "audit";
const root = rootFromArgs(args);
const memoryDir = path.join(root, ".based-claudista", "memory", "cards");

function cardPath(title) {
  return path.join(memoryDir, `${slugify(title)}.md`);
}

if (action === "new") {
  const title = args.title || "Untitled memory";
  const body = [
    "---",
    `title: "${title.replace(/"/g, "'")}"`,
    `scope: ${args.scope || "repo"}`,
    `confidence: ${args.confidence || "medium"}`,
    `created: ${new Date().toISOString().slice(0, 10)}`,
    "writer: based-claudista",
    `allowed_readers: [${csv(args.readers || "repo").map((item) => `"${item}"`).join(", ")}]`,
    "supersedes: []",
    "superseded_by: \"\"",
    `retirement_condition: "${String(args.retirement || "When contradicted or stale.").replace(/"/g, "'")}"`,
    "---",
    "",
    "# Claim",
    "",
    args.claim || "",
    "",
    "# Provenance",
    "",
    ...csv(args.evidence).map((item) => `- ${item}`),
    "",
    "# Leakage Notes",
    "",
    args["leakage-notes"] || "No sensitive data intended.",
    "",
  ].join("\n");
  if (!args.claim || !args.evidence) {
    console.error("Memory cards require --claim and --evidence.");
    process.exit(1);
  }
  if (containsSensitiveText(body)) {
    console.error("Memory card appears to contain sensitive text. Refusing to write.");
    process.exit(1);
  }
  ensureDir(memoryDir);
  const file = cardPath(title);
  fs.writeFileSync(file, body, "utf8");
  console.log(`Wrote ${file}`);
  process.exit(0);
}

const files = fs.existsSync(memoryDir) ? fs.readdirSync(memoryDir).filter((name) => name.endsWith(".md")) : [];
const findings = [];
for (const name of files) {
  const file = path.join(memoryDir, name);
  const text = readText(file);
  for (const marker of ["scope:", "confidence:", "allowed_readers:", "retirement_condition:", "# Provenance"]) {
    if (!text.includes(marker)) findings.push(`${name} missing ${marker}`);
  }
  if (containsSensitiveText(text)) findings.push(`${name} appears to contain sensitive text`);
}
console.log("# Claudista Memory Audit");
console.log("");
console.log(`Cards: ${files.length}`);
if (findings.length) findings.forEach((item) => console.log(`- ${item}`));
else console.log("No issues found.");
process.exit(findings.length ? 1 : 0);
