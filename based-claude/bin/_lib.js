const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".cache",
  "__pycache__",
  "target",
  "obj",
]);

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) {
      args._.push(part);
      continue;
    }
    const raw = part.slice(2);
    const eq = raw.indexOf("=");
    if (eq >= 0) {
      args[raw.slice(0, eq)] = raw.slice(eq + 1);
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[raw] = next;
      i += 1;
    } else {
      args[raw] = true;
    }
  }
  return args;
}

function resolveRoot(args) {
  return path.resolve(args.root || process.cwd());
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return { __error: error.message };
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJsonl(filePath, record) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

function readJsonl(filePath) {
  if (!exists(filePath)) return [];
  return readText(filePath)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return { __error: error.message, __line: index + 1, raw: line };
      }
    });
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function walk(root, options = {}) {
  const maxFiles = options.maxFiles || 5000;
  const maxDepth = options.maxDepth || 5;
  const files = [];

  function visit(dir, depth) {
    if (files.length >= maxFiles || depth > maxDepth) return;
    for (const entry of safeReaddir(dir)) {
      if (files.length >= maxFiles) return;
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) visit(full, depth + 1);
      } else if (entry.isFile()) {
        files.push(rel);
      }
    }
  }

  visit(root, 0);
  return files;
}

function run(command, args, cwd, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: options.timeout || 10000,
    shell: options.shell || false,
    stdio: options.stdio || "pipe",
  });
  return {
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function commandNeedsShell(command) {
  return /[|&;<>()$`{}\[\]*?\n\r]/.test(command || "");
}

function splitCommand(command) {
  const parts = [];
  const pattern = /"([^"]*)"|'([^']*)'|[^\s]+/g;
  let match;
  while ((match = pattern.exec(command || ""))) {
    parts.push(match[1] ?? match[2] ?? match[0]);
  }
  return parts;
}

function executableFor(command) {
  if (process.platform !== "win32") return command;
  if (["npm", "pnpm", "yarn", "bun"].includes(command)) return `${command}.cmd`;
  return command;
}

function needsWindowsCommandShell(command) {
  if (process.platform !== "win32") return false;
  const lower = String(command || "").toLowerCase();
  return ["npm", "pnpm", "yarn", "bun"].includes(lower) || /\.(cmd|bat)$/.test(lower);
}

function runCommandString(command, cwd, options = {}) {
  const raw = String(command || "").trim();
  if (!raw) {
    return { status: 1, stdout: "", stderr: "empty command", error: "empty command" };
  }
  if (commandNeedsShell(raw) && !options.allowShell) {
    const message = `Command requires shell syntax. Rerun with --allow-shell after review: ${raw}`;
    return { status: 1, stdout: "", stderr: message, error: message, blocked: true };
  }
  if (options.allowShell) {
    const stdio = options.stdio || "pipe";
    const result = spawnSync(raw, {
      cwd,
      shell: true,
      ...(stdio === "pipe" ? { encoding: options.encoding || "utf8" } : {}),
      stdio,
      timeout: options.timeout || 120000,
    });
    return {
      status: typeof result.status === "number" ? result.status : 1,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      error: result.error ? result.error.message : "",
    };
  }
  const parts = splitCommand(raw);
  if (!parts.length) {
    return { status: 1, stdout: "", stderr: "empty command", error: "empty command" };
  }
  const stdio = options.stdio || "pipe";
  const windowsCommandShell = needsWindowsCommandShell(parts[0]);
  const result = spawnSync(executableFor(parts[0]), parts.slice(1), {
    cwd,
    shell: windowsCommandShell,
    ...(stdio === "pipe" ? { encoding: options.encoding || "utf8" } : {}),
    stdio,
    timeout: options.timeout || 120000,
  });
  return {
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function getGitInfo(root) {
  const inside = run("git", ["rev-parse", "--is-inside-work-tree"], root, { timeout: 5000 });
  if (inside.status !== 0 || inside.stdout.trim() !== "true") {
    return {
      isRepository: false,
      branch: "",
      statusShort: [],
      note: inside.error || inside.stderr.trim() || "not a git worktree",
    };
  }
  const branch = run("git", ["branch", "--show-current"], root, { timeout: 5000 });
  const status = run("git", ["status", "--short"], root, { timeout: 5000 });
  return {
    isRepository: true,
    branch: branch.stdout.trim(),
    statusShort: status.stdout.split(/\r?\n/).filter(Boolean),
  };
}

function detectPackageManager(root) {
  if (exists(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (exists(path.join(root, "yarn.lock"))) return "yarn";
  if (exists(path.join(root, "bun.lockb")) || exists(path.join(root, "bun.lock"))) return "bun";
  if (exists(path.join(root, "package-lock.json"))) return "npm";
  if (exists(path.join(root, "package.json"))) return "npm";
  return "";
}

function npmCommand(pm, script) {
  if (pm === "yarn") return `yarn ${script}`;
  if (pm === "bun") return `bun run ${script}`;
  if (pm === "pnpm") return `pnpm run ${script}`;
  return `npm run ${script}`;
}

function detectLanguages(files) {
  const map = new Map();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!ext) continue;
    map.set(ext, (map.get(ext) || 0) + 1);
  }
  const names = {
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".py": "Python",
    ".rs": "Rust",
    ".go": "Go",
    ".cs": "C#",
    ".java": "Java",
    ".kt": "Kotlin",
    ".php": "PHP",
    ".rb": "Ruby",
    ".swift": "Swift",
    ".md": "Markdown",
  };
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([ext, count]) => ({ language: names[ext] || ext.slice(1), files: count }));
}

function findFiles(files, names) {
  const set = new Set(names);
  return files.filter((file) => set.has(path.basename(file)) || set.has(file));
}

function inspectProject(root) {
  const files = walk(root, { maxFiles: 8000, maxDepth: 6 });
  const packageJsonPath = path.join(root, "package.json");
  const packageJson = exists(packageJsonPath) ? readJson(packageJsonPath) : null;
  const scripts = packageJson && !packageJson.__error && packageJson.scripts ? packageJson.scripts : {};
  const pm = detectPackageManager(root);
  const validationCandidates = [];

  const preferredScripts = [
    "check",
    "test",
    "test:unit",
    "test:ci",
    "typecheck",
    "type-check",
    "lint",
    "build",
    "format:check",
  ];

  for (const name of preferredScripts) {
    if (scripts[name]) {
      validationCandidates.push({
        kind: "package-script",
        name,
        command: npmCommand(pm, name),
        reason: `package.json script '${name}'`,
      });
    }
  }

  if (files.includes("Cargo.toml")) {
    validationCandidates.push({ kind: "rust", name: "cargo-test", command: "cargo test", reason: "Cargo.toml present" });
  }
  if (files.includes("go.mod")) {
    validationCandidates.push({ kind: "go", name: "go-test", command: "go test ./...", reason: "go.mod present" });
  }
  if (files.includes("pyproject.toml") || files.includes("pytest.ini") || files.includes("tox.ini")) {
    validationCandidates.push({ kind: "python", name: "pytest", command: "python -m pytest", reason: "Python test config present" });
  }
  if (files.some((file) => file.endsWith(".sln")) || files.some((file) => file.endsWith(".csproj"))) {
    validationCandidates.push({ kind: "dotnet", name: "dotnet-test", command: "dotnet test", reason: ".NET project files present" });
  }

  const instructions = findFiles(files, [
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    ".claude/settings.json",
    ".claude/agents",
    ".claude/skills",
    ".codex",
    ".opencode",
  ]);

  const manifests = findFiles(files, [
    "package.json",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
    "pyproject.toml",
    "requirements.txt",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "settings.gradle",
    "deno.json",
    "turbo.json",
    "tsconfig.json",
  ]);

  const testLocations = files.filter((file) =>
    /(^|\/)(__tests__|tests?|specs?)(\/|$)/i.test(file) ||
    /\.(test|spec)\.(js|jsx|ts|tsx|py|rs|go|cs)$/i.test(file)
  ).slice(0, 50);

  const riskNotes = [];
  if (!instructions.some((file) => /(^|\/)(AGENTS|CLAUDE|README)\.md$/i.test(file))) {
    riskNotes.push("No top-level AGENTS.md, CLAUDE.md, or README.md found in scanned files.");
  }
  if (validationCandidates.length === 0) {
    riskNotes.push("No obvious validation command detected; inspect project docs before editing.");
  }
  if (testLocations.length === 0) {
    riskNotes.push("No obvious test files detected in the scan window.");
  }

  return {
    root,
    timestamp: new Date().toISOString(),
    instructions,
    manifests,
    packageManagers: pm ? [pm] : [],
    languages: detectLanguages(files),
    scripts,
    validationCandidates,
    testLocations,
    riskNotes,
    git: getGitInfo(root),
  };
}

function renderScanMarkdown(scan) {
  const lines = [];
  lines.push("# Based Doctor");
  lines.push("");
  lines.push(`- Root: ${scan.root}`);
  lines.push(`- Timestamp: ${scan.timestamp}`);
  lines.push(`- Git: ${scan.git.isRepository ? `yes (${scan.git.branch || "detached"})` : `no (${scan.git.note})`}`);
  lines.push("");

  lines.push("## Instructions");
  if (scan.instructions.length) scan.instructions.forEach((item) => lines.push(`- ${item}`));
  else lines.push("- None detected.");
  lines.push("");

  lines.push("## Manifests");
  if (scan.manifests.length) scan.manifests.forEach((item) => lines.push(`- ${item}`));
  else lines.push("- None detected.");
  lines.push("");

  lines.push("## Languages");
  if (scan.languages.length) scan.languages.forEach((item) => lines.push(`- ${item.language}: ${item.files}`));
  else lines.push("- None detected.");
  lines.push("");

  lines.push("## Validation Candidates");
  if (scan.validationCandidates.length) {
    scan.validationCandidates.forEach((item) => lines.push(`- \`${item.command}\` (${item.reason})`));
  } else {
    lines.push("- None detected.");
  }
  lines.push("");

  lines.push("## Test Locations");
  if (scan.testLocations.length) scan.testLocations.slice(0, 20).forEach((item) => lines.push(`- ${item}`));
  else lines.push("- None detected.");
  lines.push("");

  lines.push("## Risk Notes");
  if (scan.riskNotes.length) scan.riskNotes.forEach((item) => lines.push(`- ${item}`));
  else lines.push("- None.");

  return lines.join("\n");
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return {};
  const end = text.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = text.slice(3, end).trim();
  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) result[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return result;
}

function replaceFrontmatterField(text, field, value) {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return text;
  const block = text.slice(3, end);
  const body = text.slice(end);
  const pattern = new RegExp(`^${field}:.*$`, "m");
  const line = `${field}: ${value}`;
  const nextBlock = pattern.test(block) ? block.replace(pattern, line) : `${block.trimEnd()}\n${line}\n`;
  return `---${nextBlock}${body}`;
}

function listMarkdownFiles(dir) {
  if (!exists(dir)) return [];
  const out = [];
  function visit(current) {
    for (const entry of safeReaddir(current)) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
    }
  }
  visit(dir);
  return out;
}

function slugify(input) {
  return String(input || "memory-card")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "memory-card";
}

function csv(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function timestampId(prefix) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix || "record"}-${stamp}`;
}

function yamlString(value) {
  return `"${String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n")}"`;
}

function containsSensitiveText(text) {
  const patterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
    /\bsk-[A-Za-z0-9]{20,}\b/,
    /\b(password|passwd|secret|api[_-]?key|access[_-]?token|private[_-]?key)\s*[:=]/i,
  ];
  return patterns.some((pattern) => pattern.test(text || ""));
}

module.exports = {
  parseArgs,
  resolveRoot,
  exists,
  readJson,
  readText,
  ensureDir,
  writeJsonl,
  readJsonl,
  walk,
  run,
  commandNeedsShell,
  splitCommand,
  runCommandString,
  inspectProject,
  renderScanMarkdown,
  parseFrontmatter,
  replaceFrontmatterField,
  listMarkdownFiles,
  slugify,
  csv,
  today,
  timestampId,
  yamlString,
  containsSensitiveText,
};
