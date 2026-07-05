#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  findClaude,
  runClaude,
  parseStreamJson,
  git,
  setupFixture,
  changedPaths,
  runCommand,
  readJson,
  nowStamp,
} = require("./_lib");

const PLUGIN_DIR = path.resolve(__dirname, "..", "based-claudius");
const SLOP_CHECK = path.join(PLUGIN_DIR, "bin", "claudius-slop-check.js");
const SCENARIOS_DIR = path.join(__dirname, "scenarios");
const REPORTS_DIR = path.join(__dirname, "reports");

const JUDGE_SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    pass: { type: "boolean" },
    reasons: { type: "array", items: { type: "string" } },
  },
  required: ["pass", "reasons"],
});

function parseCliArgs(argv) {
  const args = { dryRun: false, keep: false, family: null, scenario: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--keep") args.keep = true;
    else if (argv[i] === "--family") args.family = argv[++i];
    else if (argv[i] === "--scenario") args.scenario = argv[++i];
    else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  return args;
}

function sessionArgs(extra) {
  const args = [...extra, "--plugin-dir", PLUGIN_DIR];
  if (!process.env.CLAUDIUS_EVAL_NO_BARE) args.push("--bare");
  if (process.env.CLAUDIUS_EVAL_MODEL) args.push("--model", process.env.CLAUDIUS_EVAL_MODEL);
  return args;
}

function extractModels(result) {
  if (!result) return [];
  if (result.modelUsage && typeof result.modelUsage === "object") return Object.keys(result.modelUsage);
  if (result.model) return [String(result.model)];
  return [];
}

function verifyPluginLoaded(init, record) {
  if (!init) {
    record.notes.push("no system/init event observed; cannot confirm plugin load");
    return true;
  }
  if (Array.isArray(init.plugin_errors) && init.plugin_errors.length) {
    record.notes.push(`plugin_errors: ${JSON.stringify(init.plugin_errors)}`);
    return false;
  }
  if (Array.isArray(init.plugins) && !init.plugins.some((p) => p.name === "based-claudius")) {
    record.notes.push("based-claudius absent from loaded plugins");
    return false;
  }
  return true;
}

function gate(record, name, ok, detail) {
  record.gates.push({ name, ok, detail });
  if (!ok) record.status = "FAIL";
}

function checkBaseline(scenario, workDir, record) {
  if (!scenario.baseline || !scenario.gates.tests) return true;
  const result = runCommand(scenario.gates.tests, workDir);
  const testsPass = result.status === 0;
  const expected = scenario.baseline === "tests-pass";
  if (testsPass !== expected) {
    gate(record, "baseline", false, `expected fixture baseline ${scenario.baseline}, tests ${testsPass ? "pass" : "fail"}`);
    return false;
  }
  gate(record, "baseline", true, scenario.baseline);
  return true;
}

function runJudge(claudeBin, scenario, workDir, record) {
  const rubric = fs.readFileSync(path.join(scenario.dir, scenario.judge), "utf8");
  const diff = git(workDir, "diff", "--cached");
  const prompt = [
    rubric,
    "",
    "## Task the agent was given",
    "",
    scenario.task,
    "",
    "## Diff produced by the agent",
    "",
    "```diff",
    diff,
    "```",
  ].join("\n");

  const result = runClaude(
    claudeBin,
    sessionArgs([
      "-p", prompt,
      "--output-format", "json",
      "--json-schema", JUDGE_SCHEMA,
      "--permission-mode", "dontAsk",
      "--max-turns", "4",
    ]),
    { cwd: workDir, timeout: 300000 }
  );
  if (result.status !== 0) {
    record.status = record.status === "FAIL" ? "FAIL" : "UNSTABLE";
    record.notes.push(`judge session failed: ${(result.stderr || "").slice(0, 400)}`);
    return;
  }
  let payload;
  try {
    payload = JSON.parse(result.stdout);
  } catch {
    record.status = record.status === "FAIL" ? "FAIL" : "UNSTABLE";
    record.notes.push("judge output was not parseable JSON");
    return;
  }
  const verdict = payload.structured_output;
  record.judge = {
    pass: Boolean(verdict && verdict.pass),
    reasons: (verdict && verdict.reasons) || [],
    models: extractModels(payload),
    cost_usd: payload.total_cost_usd,
    independent: true,
  };
  if (!verdict) {
    record.status = record.status === "FAIL" ? "FAIL" : "UNSTABLE";
    record.notes.push("judge returned no structured_output");
  } else if (!verdict.pass) {
    record.status = "FAIL";
  }
}

function runCodeQualityScenario(claudeBin, scenario, cli) {
  const record = {
    family: "code-quality",
    name: scenario.name,
    status: "PASS",
    gates: [],
    judge: null,
    models: [],
    cost_usd: null,
    duration_ms: 0,
    notes: [],
  };
  const workDir = setupFixture(path.join(scenario.dir, "fixture"));
  const started = Date.now();

  try {
    if (!checkBaseline(scenario, workDir, record)) return record;
    if (cli.dryRun) {
      record.status = "DRY";
      record.notes.push("dry run: fixture baseline verified, session skipped");
      return record;
    }

    const allowed = ["Skill", ...(scenario.allowedTools || [])].join(",");
    const session = runClaude(
      claudeBin,
      sessionArgs([
        "-p", scenario.task,
        "--output-format", "stream-json",
        "--verbose",
        "--permission-mode", "acceptEdits",
        "--max-turns", String(scenario.maxTurns || 25),
        "--allowedTools", allowed,
      ]),
      { cwd: workDir, timeout: Number(process.env.CLAUDIUS_EVAL_TIMEOUT_MS) || 600000 }
    );
    if (session.status !== 0) {
      record.status = "UNSTABLE";
      record.notes.push(`session exited ${session.status}: ${(session.stderr || "").slice(0, 400)}`);
      return record;
    }
    const parsed = parseStreamJson(session.stdout);
    if (!verifyPluginLoaded(parsed.init, record)) {
      record.status = "UNSTABLE";
      return record;
    }
    record.models = extractModels(parsed.result);
    record.cost_usd = parsed.result ? parsed.result.total_cost_usd : null;

    const changed = changedPaths(workDir);
    git(workDir, "add", "-A");

    if (scenario.gates.tests) {
      const tests = runCommand(scenario.gates.tests, workDir);
      gate(record, "tests", tests.status === 0, scenario.gates.tests);
    }
    if (scenario.gates.slopStrict) {
      const slop = runCommand(`node ${SLOP_CHECK} --root . --staged --strict`, workDir);
      gate(record, "slop-check", slop.status === 0, slop.status === 0 ? "clean" : slop.stdout.split(/\r?\n/).slice(-3).join(" "));
    }
    if (scenario.gates.allowedPaths) {
      const outside = changed.filter(
        (file) => !scenario.gates.allowedPaths.some((prefix) => file.startsWith(prefix))
      );
      gate(record, "allowed-paths", outside.length === 0, outside.length ? `outside scope: ${outside.join(", ")}` : "all changes in scope");
    }
    if (scenario.gates.mustChange) {
      const missing = scenario.gates.mustChange.filter(
        (prefix) => !changed.some((file) => file.startsWith(prefix))
      );
      gate(record, "must-change", missing.length === 0, missing.length ? `untouched: ${missing.join(", ")}` : "expected surfaces touched");
    }

    if (scenario.judge && record.status === "PASS") {
      runJudge(claudeBin, scenario, workDir, record);
    }
    return record;
  } finally {
    record.duration_ms = Date.now() - started;
    if (cli.keep) record.notes.push(`workdir kept: ${workDir}`);
    else fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function matchesExpectation(invocations, expect) {
  const normalized = invocations.map((name) => name.includes(":") ? name.split(":").pop() : name);
  const claudiusInvoked = invocations.filter(
    (name) => !name.includes(":") || name.startsWith("based-claudius:")
  );
  if (!expect.length) return claudiusInvoked.length === 0;
  return expect.some((wanted) => {
    const suffix = wanted.includes(":") ? wanted.split(":").pop() : wanted;
    return normalized.includes(suffix);
  });
}

function runActivationRow(claudeBin, row, index, cli) {
  const record = {
    family: "skill-activation",
    name: `row-${index + 1}`,
    prompt: row.prompt,
    expect: row.expect,
    status: "PASS",
    invoked: [],
    models: [],
    cost_usd: null,
    duration_ms: 0,
    notes: [],
  };
  if (cli.dryRun) {
    record.status = "DRY";
    return record;
  }
  const workDir = setupFixture(path.join(SCENARIOS_DIR, "skill-activation", "fixture"));
  const started = Date.now();
  try {
    const session = runClaude(
      claudeBin,
      sessionArgs([
        "-p", row.prompt,
        "--output-format", "stream-json",
        "--verbose",
        "--permission-mode", "dontAsk",
        "--max-turns", "3",
      ]),
      { cwd: workDir, timeout: 240000 }
    );
    if (session.status !== 0) {
      record.status = "UNSTABLE";
      record.notes.push(`session exited ${session.status}: ${(session.stderr || "").slice(0, 300)}`);
      return record;
    }
    const parsed = parseStreamJson(session.stdout);
    if (!verifyPluginLoaded(parsed.init, record)) {
      record.status = "UNSTABLE";
      return record;
    }
    record.invoked = parsed.skillInvocations;
    record.models = extractModels(parsed.result);
    record.cost_usd = parsed.result ? parsed.result.total_cost_usd : null;
    if (!matchesExpectation(parsed.skillInvocations, row.expect)) {
      record.status = row.advisory ? "ADVISORY" : "FAIL";
      record.notes.push(`expected ${JSON.stringify(row.expect)}, invoked ${JSON.stringify(parsed.skillInvocations)}`);
    }
    return record;
  } finally {
    record.duration_ms = Date.now() - started;
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function discoverCodeQuality(cli) {
  const familyDir = path.join(SCENARIOS_DIR, "code-quality");
  return fs
    .readdirSync(familyDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(familyDir, entry.name);
      const scenario = readJson(path.join(dir, "scenario.json"));
      scenario.dir = dir;
      return scenario;
    })
    .filter((scenario) => !cli.scenario || scenario.name === cli.scenario);
}

function writeReport(records) {
  const stamp = nowStamp();
  const outDir = path.join(REPORTS_DIR, stamp);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(records, null, 2), "utf8");

  const lines = ["# Claudius Eval Report", "", `Run: ${stamp}`, ""];
  for (const record of records) {
    lines.push(`## ${record.family} / ${record.name} — ${record.status}`);
    if (record.prompt) lines.push("", `Prompt: ${record.prompt}`, `Expected: ${JSON.stringify(record.expect)}`, `Invoked: ${JSON.stringify(record.invoked)}`);
    for (const g of record.gates || []) lines.push(`- gate ${g.name}: ${g.ok ? "ok" : "FAIL"} (${g.detail})`);
    if (record.judge) {
      lines.push(`- judge: ${record.judge.pass ? "pass" : "FAIL"} (models: ${record.judge.models.join(", ") || "unknown"}, independent: yes)`);
      for (const reason of record.judge.reasons) lines.push(`  - ${reason}`);
    }
    for (const note of record.notes || []) lines.push(`- note: ${note}`);
    if (record.models && record.models.length) lines.push(`- session models: ${record.models.join(", ")}`);
    if (record.cost_usd != null) lines.push(`- cost: $${Number(record.cost_usd).toFixed(4)}`);
    lines.push("");
  }
  fs.writeFileSync(path.join(outDir, "report.md"), lines.join("\n"), "utf8");
  return outDir;
}

function main() {
  const cli = parseCliArgs(process.argv.slice(2));
  const claudeBin = cli.dryRun ? null : findClaude();
  if (!cli.dryRun && !claudeBin) {
    console.error("claude CLI not found. Install Claude Code or set CLAUDE_CLI to the binary path.");
    process.exit(2);
  }
  if (!cli.dryRun && !process.env.CLAUDIUS_EVAL_NO_BARE && !process.env.ANTHROPIC_API_KEY) {
    console.error("Bare mode needs ANTHROPIC_API_KEY. Export it, or set CLAUDIUS_EVAL_NO_BARE=1 to use your interactive auth (other installed plugins may then interfere with activation grading).");
    process.exit(2);
  }

  const records = [];
  if (!cli.family || cli.family === "code-quality") {
    for (const scenario of discoverCodeQuality(cli)) {
      console.log(`running code-quality/${scenario.name} ...`);
      records.push(runCodeQualityScenario(claudeBin, scenario, cli));
    }
  }
  if (!cli.family || cli.family === "skill-activation") {
    const table = readJson(path.join(SCENARIOS_DIR, "skill-activation", "activation.json"));
    table.rows.forEach((row, index) => {
      if (cli.scenario && cli.scenario !== `row-${index + 1}`) return;
      console.log(`running skill-activation/row-${index + 1} ...`);
      records.push(runActivationRow(claudeBin, row, index, cli));
    });
  }

  const outDir = writeReport(records);
  const counts = records.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});
  console.log("");
  for (const record of records) console.log(`${record.status.padEnd(9)} ${record.family}/${record.name}`);
  console.log("");
  console.log(`Summary: ${JSON.stringify(counts)} — report: ${path.relative(process.cwd(), outDir)}`);

  if (counts.FAIL) process.exit(1);
  if (counts.UNSTABLE) process.exit(3);
  // ADVISORY and DRY never fail the suite; they are visible in the report only.
}

main();
