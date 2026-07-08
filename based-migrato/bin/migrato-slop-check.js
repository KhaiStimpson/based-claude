#!/usr/bin/env node
const path = require("path");
const { spawnSync } = require("child_process");
const { parseArgs, resolveRoot, readText, exists } = require("./_lib");

const SLASH_EXTS = new Set([
  "js", "jsx", "ts", "tsx", "mjs", "cjs", "java", "c", "h", "cpp", "hpp", "cc",
  "cs", "go", "rs", "swift", "kt", "kts", "scala", "php", "dart", "groovy",
]);
const HASH_EXTS = new Set([
  "py", "rb", "sh", "bash", "zsh", "yaml", "yml", "toml", "pl", "pm", "r", "jl", "ex", "exs",
]);
const DASH_EXTS = new Set(["sql", "lua", "hs", "elm"]);

const PLACEHOLDER = /\b(todo|fixme|xxx|hack)\b|your code here|implement me|implementation goes here/i;
const NARRATION_VERB =
  /^(?:now\s+|then\s+|first\s+|next\s+|finally\s+)?(?:we\s+|let'?s\s+|this\s+(?:function\s+|method\s+|block\s+)?)?(?:creates?|gets?|sets?|initiali[sz]es?|init\b|loops?|iterates?|calls?|invokes?|returns?|checks?|defines?|declares?|imports?|increments?|decrements?|adds?|appends?|updates?|prints?|logs?|fetch(?:es)?|parses?|converts?|handles?)\b/i;
const NARRATION_EXEMPT = /\b(because|why|workaround|invariant|note:|see |issue|bug|deliberately|intentionally|otherwise|must )\b/i;
const AI_PHRASES = [
  "as an ai",
  "it's worth noting",
  "it is worth noting",
  "this function is responsible for",
  "this method is responsible for",
  "in this function we",
  "here's how it works",
  "let's dive",
  "certainly!",
];
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F0FF}]/u;
const COMMENTED_CODE =
  /(?:[;{}]\s*$|^(?:const |let |var |function |def |class |if\s*\(|for\s*\(|while\s*\(|return |import |from .+ import |require\())/;

function commentPrefix(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  if (SLASH_EXTS.has(ext)) return "slash";
  if (HASH_EXTS.has(ext)) return "hash";
  if (DASH_EXTS.has(ext)) return "dash";
  return null;
}

function commentText(line, style) {
  const trimmed = line.trim();
  if (style === "slash") {
    if (trimmed.startsWith("//")) return trimmed.slice(2).trim();
    if (trimmed.startsWith("/*")) return trimmed.replace(/^\/\*+/, "").replace(/\*+\/$/, "").trim();
    if (trimmed.startsWith("*")) return trimmed.replace(/^\*+\/?/, "").trim();
    return null;
  }
  if (style === "hash") {
    if (trimmed.startsWith("#") && !trimmed.startsWith("#!")) return trimmed.replace(/^#+/, "").trim();
    return null;
  }
  if (style === "dash") {
    if (trimmed.startsWith("--")) return trimmed.replace(/^-+/, "").trim();
    return null;
  }
  return null;
}

function checkLine(file, lineNumber, line, style, state, findings) {
  const comment = commentText(line, style);
  if (comment === null) {
    state.commentedCodeRun = 0;
    if (line.trim()) state.codeLines += 1;
    if (EMOJI.test(line)) {
      findings.push({ file, line: lineNumber, category: "emoji", text: line.trim() });
    }
    return;
  }

  state.commentLines += 1;
  if (EMOJI.test(comment)) {
    findings.push({ file, line: lineNumber, category: "emoji", text: line.trim() });
  }
  if (PLACEHOLDER.test(comment)) {
    findings.push({ file, line: lineNumber, category: "placeholder", text: line.trim() });
  }
  const lowered = comment.toLowerCase();
  if (AI_PHRASES.some((phrase) => lowered.includes(phrase))) {
    findings.push({ file, line: lineNumber, category: "ai-phrase", text: line.trim() });
  }
  if (comment.length < 70 && NARRATION_VERB.test(comment) && !NARRATION_EXEMPT.test(comment)) {
    findings.push({ file, line: lineNumber, category: "narration", text: line.trim() });
  }
  if (COMMENTED_CODE.test(comment)) {
    state.commentedCodeRun += 1;
    if (state.commentedCodeRun === 2) {
      findings.push({ file, line: lineNumber, category: "commented-code", text: line.trim() });
    }
  } else {
    state.commentedCodeRun = 0;
  }
}

function densityFinding(file, state, minCommentLines) {
  const total = state.commentLines + state.codeLines;
  if (!total || state.commentLines < minCommentLines) return null;
  const ratio = state.commentLines / total;
  if (ratio <= 0.4) return null;
  return {
    file,
    line: 0,
    category: "comment-density",
    text: `${state.commentLines} comment lines vs ${state.codeLines} code lines (${Math.round(ratio * 100)}%)`,
  };
}

function scanFile(root, relFile, findings) {
  const style = commentPrefix(relFile);
  if (!style) return;
  const text = readText(path.join(root, relFile));
  if (!text) return;
  const state = { commentLines: 0, codeLines: 0, commentedCodeRun: 0 };
  const lines = text.split(/\r?\n/);
  let blockEnd = 0;
  while (blockEnd < lines.length && commentText(lines[blockEnd], style) !== null) blockEnd += 1;
  const leadingBlock = lines.slice(0, blockEnd).join("\n");
  const start = /copyright|licen[sc]e|spdx/i.test(leadingBlock) ? blockEnd : 0;
  for (let i = start; i < lines.length; i += 1) {
    checkLine(relFile, i + 1, lines[i], style, state, findings);
  }
  const density = densityFinding(relFile, state, 6);
  if (density) findings.push(density);
}

function scanDiff(root, staged, findings) {
  const gitArgs = ["diff", "--no-color", "--unified=0"];
  if (staged) gitArgs.push("--cached");
  const result = spawnSync("git", gitArgs, { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) {
    console.error(`git diff failed: ${result.error ? result.error.message : result.stderr.trim()}`);
    process.exit(2);
  }
  let file = null;
  let style = null;
  let newLine = 0;
  let state = null;
  const fileStates = new Map();
  for (const line of result.stdout.split(/\r?\n/)) {
    if (line.startsWith("+++ ")) {
      const target = line.slice(4).trim();
      file = target === "/dev/null" ? null : target.replace(/^b\//, "");
      style = file ? commentPrefix(file) : null;
      if (file && style && !fileStates.has(file)) {
        fileStates.set(file, { commentLines: 0, codeLines: 0, commentedCodeRun: 0 });
      }
      state = file && style ? fileStates.get(file) : null;
      continue;
    }
    if (line.startsWith("@@")) {
      const match = /\+(\d+)/.exec(line);
      newLine = match ? Number(match[1]) : 0;
      if (state) state.commentedCodeRun = 0;
      continue;
    }
    if (!file || !style) continue;
    if (line.startsWith("+")) {
      checkLine(file, newLine, line.slice(1), style, state, findings);
      newLine += 1;
    }
  }
  for (const [diffFile, diffState] of fileStates) {
    const density = densityFinding(diffFile, diffState, 8);
    if (density) findings.push(density);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const flag of ["strict", "json", "diff", "staged"]) {
    if (typeof args[flag] === "string") {
      args._.push(args[flag]);
      args[flag] = true;
    }
  }
  const root = resolveRoot(args);
  const findings = [];

  if (args.diff || args.staged) {
    scanDiff(root, Boolean(args.staged), findings);
  } else if (args._.length) {
    for (const target of args._) {
      const rel = path.isAbsolute(target) ? path.relative(root, target) : target;
      if (!exists(path.join(root, rel))) {
        console.error(`Not found: ${rel}`);
        process.exit(2);
      }
      scanFile(root, rel.replace(/\\/g, "/"), findings);
    }
  } else {
    console.log("Usage: migrato-slop-check [--root <dir>] [--strict] [--json] (--diff | --staged | <files...>)");
    console.log("");
    console.log("Mechanical pass for the code-style contract: narration comments, placeholder");
    console.log("debris, AI-tell phrases, emoji in source, commented-out code, comment density.");
    console.log("Advisory by default; --strict exits 1 when findings exist.");
    process.exit(0);
  }

  if (args.json) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    console.log("# Migrato Slop Check");
    console.log("");
    if (!findings.length) {
      console.log("No slop findings.");
    } else {
      let current = null;
      for (const finding of findings) {
        if (finding.file !== current) {
          current = finding.file;
          console.log(`${finding.file}`);
        }
        const location = finding.line ? String(finding.line).padStart(5) : "  file";
        console.log(`  ${location}  ${finding.category.padEnd(15)} ${finding.text}`);
      }
      const counts = {};
      for (const finding of findings) counts[finding.category] = (counts[finding.category] || 0) + 1;
      const summary = Object.entries(counts)
        .map(([category, count]) => `${count} ${category}`)
        .join(", ");
      console.log("");
      console.log(`${findings.length} finding${findings.length === 1 ? "" : "s"}: ${summary}.`);
      console.log("Advisory: verify against local convention before acting (references/code-style.md).");
    }
  }

  process.exit(args.strict && findings.length ? 1 : 0);
}

main();
