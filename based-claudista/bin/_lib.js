const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  ".cache",
  ".next",
  ".nuxt",
  ".turbo",
  "__pycache__",
  "target",
  "bin",
  "obj",
]);

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) {
      args._.push(item);
      continue;
    }
    const raw = item.slice(2);
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

function rootFromArgs(args) {
  return path.resolve(args.root || process.cwd());
}

function exists(file) {
  return fs.existsSync(file);
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    return { __error: error.message };
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJsonl(file, record) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, "utf8");
}

function readJsonl(file) {
  if (!exists(file)) return [];
  return readText(file)
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
  const maxDepth = options.maxDepth || 6;
  const maxFiles = options.maxFiles || 8000;
  const out = [];
  function visit(dir, depth) {
    if (depth > maxDepth || out.length >= maxFiles) return;
    for (const entry of safeReaddir(dir)) {
      if (out.length >= maxFiles) return;
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) visit(full, depth + 1);
      } else if (entry.isFile()) {
        out.push(rel);
      }
    }
  }
  visit(root, 0);
  return out;
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

function wordCount(text) {
  return String(text || "").split(/\s+/).filter(Boolean).length;
}

function csv(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function slugify(input) {
  return String(input || "record")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "record";
}

function timestampId(prefix) {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
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

function needsWindowsShell(command) {
  if (process.platform !== "win32") return false;
  const lower = String(command || "").toLowerCase();
  return ["npm", "pnpm", "yarn", "bun"].includes(lower) || /\.(cmd|bat)$/.test(lower);
}

function runCommandString(command, cwd, options = {}) {
  const raw = String(command || "").trim();
  if (!raw) return { status: 1, stdout: "", stderr: "empty command", error: "empty command" };
  if (commandNeedsShell(raw) && !options.allowShell) {
    const message = `Command requires shell syntax. Review it and rerun with --allow-shell: ${raw}`;
    return { status: 1, stdout: "", stderr: message, error: message, blocked: true };
  }
  if (options.allowShell) {
    const result = spawnSync(raw, {
      cwd,
      shell: true,
      encoding: "utf8",
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
  const result = spawnSync(executableFor(parts[0]), parts.slice(1), {
    cwd,
    shell: needsWindowsShell(parts[0]),
    encoding: "utf8",
    timeout: options.timeout || 120000,
  });
  return {
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function detectPackageManager(root) {
  if (exists(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (exists(path.join(root, "yarn.lock"))) return "yarn";
  if (exists(path.join(root, "bun.lock")) || exists(path.join(root, "bun.lockb"))) return "bun";
  if (exists(path.join(root, "package.json"))) return "npm";
  return "";
}

function packageCommand(pm, script) {
  if (pm === "pnpm") return `pnpm run ${script}`;
  if (pm === "yarn") return `yarn ${script}`;
  if (pm === "bun") return `bun run ${script}`;
  return `npm run ${script}`;
}

function inspectProject(root) {
  const files = walk(root);
  const packageJson = exists(path.join(root, "package.json")) ? readJson(path.join(root, "package.json")) : {};
  const scripts = packageJson && !packageJson.__error && packageJson.scripts ? packageJson.scripts : {};
  const pm = detectPackageManager(root);
  const validationCandidates = [];
  for (const name of ["check", "test", "test:unit", "typecheck", "type-check", "lint", "build", "format:check"]) {
    if (scripts[name]) validationCandidates.push({ name, command: packageCommand(pm || "npm", name), reason: `package.json script '${name}'` });
  }
  if (files.includes("Cargo.toml")) validationCandidates.push({ name: "cargo-test", command: "cargo test", reason: "Cargo.toml present" });
  if (files.includes("go.mod")) validationCandidates.push({ name: "go-test", command: "go test ./...", reason: "go.mod present" });
  if (files.includes("pyproject.toml") || files.includes("pytest.ini")) validationCandidates.push({ name: "pytest", command: "python -m pytest", reason: "Python test config present" });
  if (files.some((file) => file.endsWith(".sln") || file.endsWith(".csproj"))) validationCandidates.push({ name: "dotnet-test", command: "dotnet test", reason: ".NET project files present" });
  return {
    root,
    timestamp: new Date().toISOString(),
    instructions: files.filter((file) => /(^|\/)(AGENTS|CLAUDE|README)\.md$/i.test(file)).slice(0, 30),
    manifests: files.filter((file) => /(^|\/)(package\.json|Cargo\.toml|go\.mod|pyproject\.toml|requirements\.txt|tsconfig\.json)$/i.test(file)).slice(0, 40),
    tests: files.filter((file) => /(^|\/)(__tests__|tests?|specs?)(\/|$)|\.(test|spec)\./i.test(file)).slice(0, 50),
    validationCandidates,
  };
}

function containsSensitiveText(text) {
  return [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
    /\bsk-[A-Za-z0-9]{20,}\b/,
    /\b(password|passwd|secret|api[_-]?key|access[_-]?token|private[_-]?key)\s*[:=]/i,
  ].some((pattern) => pattern.test(text || ""));
}

module.exports = {
  parseArgs,
  rootFromArgs,
  exists,
  readText,
  readJson,
  ensureDir,
  writeJsonl,
  readJsonl,
  walk,
  parseFrontmatter,
  wordCount,
  csv,
  slugify,
  timestampId,
  runCommandString,
  inspectProject,
  containsSensitiveText,
};
