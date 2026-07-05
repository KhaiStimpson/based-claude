const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function findClaude() {
  if (process.env.CLAUDE_CLI) return process.env.CLAUDE_CLI;
  const probe = spawnSync(process.platform === "win32" ? "where" : "which", ["claude"], { encoding: "utf8" });
  if (probe.status === 0) return probe.stdout.split(/\r?\n/).filter(Boolean)[0];
  return null;
}

function runClaude(claudeBin, args, options = {}) {
  return spawnSync(claudeBin, args, {
    cwd: options.cwd,
    encoding: "utf8",
    timeout: options.timeout || 600000,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, ...(options.env || {}) },
    shell: process.platform === "win32",
  });
}

function parseStreamJson(stdout) {
  const events = [];
  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // Partial or non-JSON line in the stream; grading only needs whole events.
    }
  }

  const init = events.find((event) => event.type === "system" && event.subtype === "init") || null;
  const result = events.find((event) => event.type === "result") || null;

  const skillInvocations = [];
  for (const event of events) {
    const content = event.message && event.message.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block.type === "tool_use" && block.name === "Skill" && block.input && block.input.skill) {
        skillInvocations.push(String(block.input.skill));
      }
    }
  }

  return { events, init, result, skillInvocations };
}

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

function setupFixture(fixtureDir) {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "claudius-eval-"));
  fs.cpSync(fixtureDir, workDir, { recursive: true });
  git(workDir, "init", "-q");
  git(workDir, "config", "user.email", "eval@local");
  git(workDir, "config", "user.name", "claudius-eval");
  git(workDir, "add", ".");
  git(workDir, "commit", "-qm", "fixture baseline");
  return workDir;
}

function changedPaths(workDir) {
  const status = git(workDir, "status", "--porcelain");
  return status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replace(/^"|"$/g, ""));
}

function runCommand(command, cwd, timeout) {
  const [bin, ...args] = command.split(/\s+/);
  return spawnSync(bin, args, {
    cwd,
    encoding: "utf8",
    timeout: timeout || 120000,
    shell: process.platform === "win32",
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

module.exports = {
  findClaude,
  runClaude,
  parseStreamJson,
  git,
  setupFixture,
  changedPaths,
  runCommand,
  readJson,
  nowStamp,
};
