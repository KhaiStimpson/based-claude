#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, resolveRoot, walk, exists, readText, ensureDir, today } = require("./_lib");

// Broad, cross-stack default. Covers WebForms/.NET (aspx, ascx, master, ashx,
// asmx, cshtml, razor, cs, vb), server templates (php, erb, ejs, hbs), and
// JS/SPA surfaces. It is only a triage aid for the "Discovered Candidates"
// list; the real feature enumeration is done by reading the files. Override
// with --ext (both surfaces) or --component-ext (the "after" surface only)
// when your stack uses extensions this misses.
const DEFAULT_SOURCE_EXT = new Set([
  ".aspx", ".ascx", ".master", ".ashx", ".asmx", ".asax", ".cshtml", ".razor", ".vbhtml",
  ".cs", ".vb", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte", ".astro",
  ".php", ".rb", ".py", ".go", ".java", ".kt", ".html", ".htm", ".erb", ".ejs", ".hbs",
]);

function parseExtSet(value, fallback) {
  if (!value || value === true) return fallback;
  const set = new Set(
    String(value)
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .map((e) => (e.startsWith(".") ? e : `.${e}`))
  );
  return set.size ? set : fallback;
}

function scanSurfaces(root, dirs, exts, cap) {
  const out = [];
  for (const dir of dirs) {
    const abs = path.resolve(root, dir);
    if (!exists(abs)) {
      out.push({ dir, missing: true, files: [] });
      continue;
    }
    const files = walk(abs, { maxFiles: 4000, maxDepth: 6 })
      .filter((rel) => exts.has(path.extname(rel).toLowerCase()))
      .map((rel) => `${dir.replace(/\/+$/, "")}/${rel}`)
      .sort();
    out.push({ dir, missing: false, files: files.slice(0, cap) });
  }
  return out;
}

// --rows "feature|legacy source|new component|status|notes ; feature|..."
function parseRows(value) {
  if (!value || value === true) return [];
  return String(value)
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [feature, source, component, status, notes] = chunk.split("|").map((f) => (f || "").trim());
      const mapped = component || "";
      const rowStatus = status || (mapped ? "mapped" : "unmapped");
      return { feature, source, component: mapped || "—", status: rowStatus, notes: notes || "" };
    })
    .filter((row) => row.feature);
}

const PARITY_STATUS = new Set(["unmapped", "mapped", "in-slice", "migrated", "verified", "dropped"]);
function parityStatusFor(row) {
  if (PARITY_STATUS.has(row.status)) return row.status;
  return row.component && row.component !== "—" ? "mapped" : "unmapped";
}

function commentList(surfaces, emptyNote) {
  const lines = [];
  for (const s of surfaces) {
    if (s.missing) {
      lines.push(`- \`${s.dir}\` — path not found from the migration root; check the value.`);
      continue;
    }
    if (!s.files.length) {
      lines.push(`- \`${s.dir}\` — ${emptyNote}`);
      continue;
    }
    lines.push(`- \`${s.dir}\`:`);
    for (const file of s.files) lines.push(`  - ${file}`);
  }
  return lines.length ? lines.join("\n") : "- None discovered. Enumerate by hand.";
}

function renderComponentMap({ page, legacyPaths, newPaths, rows, legacySurfaces, newSurfaces }) {
  const bodyRows = rows.length
    ? rows.map((r) => `| ${r.feature} | ${r.source || "—"} | ${r.component} | ${r.status} | ${r.notes || ""} |`)
    : ["| _first legacy feature_ | _legacy source_ | _new component or —_ | unmapped | fill in |"];
  return `# Component Map — ${page}

<!-- Legacy (before): ${legacyPaths.join(", ") || "unspecified"} -->
<!-- New (after): ${newPaths.join(", ") || "unspecified"} -->
<!-- Human-maintained. Anyone can add or correct a row. -->
<!-- Status: unmapped | mapped | migrated | verified | dropped (dropped needs an approved reason). -->

| Legacy feature | Legacy source | New component | Status | Notes |
| --- | --- | --- | --- | --- |
${bodyRows.join("\n")}

## Discovered Candidates (triage into the table above, then delete)

### Legacy surfaces (before)

${commentList(legacySurfaces, "no source files found in the scan window.")}

### New surfaces (after)

${commentList(newSurfaces, "no source files found in the scan window.")}
`;
}

function renderParity({ page, legacyPaths, rows }) {
  const bodyRows = rows.length
    ? rows.map((r, i) => `| ${i + 1} | ${r.feature} | — | ${parityStatusFor(r)} | — | — |`)
    : ["| 1 | _first legacy feature_ | — | unmapped | _equivalence to assert_ | — |"];
  return `# Feature Parity — ${page}

Legacy source of truth: ${legacyPaths.join(", ") || "unspecified"}. Enumerated: ${today()}.

Statuses run unmapped → mapped → in-slice → migrated → verified (plus dropped with a recorded reason). The migration is complete only when every row is verified or dropped. \`migrated\` means the code exists; \`verified\` means it behaves like the legacy feature.

| # | Legacy feature | Slice | Status | Parity assertion | Evidence |
| --- | --- | --- | --- | --- | --- |
${bodyRows.join("\n")}
`;
}

function writeFile(target, body, force) {
  if (exists(target) && readText(target).trim() && !force) {
    return { path: target, skipped: true };
  }
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, body, "utf8");
  return { path: target, skipped: false };
}

const STATUS_ORDER = ["unmapped", "mapped", "in-slice", "migrated", "verified", "dropped"];

// Parse the parity ledger table: | # | feature | slice | status | assertion | evidence |
function parseLedger(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed.slice(1, trimmed.endsWith("|") ? -1 : undefined).split("|").map((c) => c.trim());
    if (cells.length < 4) continue;
    if (/^-{2,}$/.test(cells[0].replace(/\s/g, "")) || cells.every((c) => /^-*$/.test(c))) continue;
    if (cells[1].toLowerCase() === "legacy feature" || cells[0] === "#") continue;
    const status = cells[3].toLowerCase();
    rows.push({ feature: cells[1], slice: cells[2], status });
  }
  return rows;
}

function summarize(rows) {
  const counts = {};
  for (const key of STATUS_ORDER) counts[key] = 0;
  let other = 0;
  for (const row of rows) {
    if (Object.prototype.hasOwnProperty.call(counts, row.status)) counts[row.status] += 1;
    else other += 1;
  }
  const total = rows.length;
  const done = counts.verified + counts.dropped;
  return { total, counts, other, done, complete: total > 0 && done === total };
}

function runStatus(root, args) {
  const dir = path.resolve(root, args.dir || path.join(".migrato", "migration"));
  const parityPath = path.join(dir, "parity.md");
  if (!exists(parityPath)) {
    console.error(`No parity ledger at ${path.relative(root, parityPath)}. Run: migrato-migrate init --write`);
    process.exit(1);
  }
  const rows = parseLedger(readText(parityPath));
  const s = summarize(rows);

  if (args.json) {
    console.log(JSON.stringify({ total: s.total, done: s.done, complete: s.complete, counts: s.counts, other: s.other }, null, 2));
    return;
  }

  const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
  console.log(`# Migration Parity — ${path.relative(root, parityPath)}`);
  console.log("");
  console.log(`Progress: ${s.done}/${s.total} features verified or dropped (${pct}%).`);
  console.log("");
  for (const key of STATUS_ORDER) console.log(`- ${key}: ${s.counts[key]}`);
  if (s.other) console.log(`- other (unrecognized status): ${s.other}`);
  console.log("");
  if (s.total === 0) {
    console.log("Ledger has no feature rows yet. Enumerate the legacy features first.");
  } else if (s.complete) {
    console.log("Complete: every feature is verified or dropped.");
  } else {
    const remaining = s.total - s.done;
    console.log(`Not complete: ${remaining} feature(s) still short of verified/dropped. \`migrated\` is not \`verified\` — verify against observed legacy behavior.`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "init";
  const root = resolveRoot(args);

  if (command === "status") {
    runStatus(root, args);
    return;
  }
  if (command !== "init") {
    console.error(`Unknown command '${command}'. Supported: init, status.`);
    process.exit(1);
  }

  const page = String(args.page || args.title || "the page").replace(/\s+/g, " ").trim();
  const legacyPaths = csvPaths(args.legacy);
  const newPaths = csvPaths(args.new);
  const rows = parseRows(args.rows);
  const dir = path.resolve(root, args.dir || path.join(".migrato", "migration"));

  const sourceExts = parseExtSet(args.ext, DEFAULT_SOURCE_EXT);
  const componentExts = args["component-ext"] ? parseExtSet(args["component-ext"], DEFAULT_SOURCE_EXT) : sourceExts;
  const legacySurfaces = scanSurfaces(root, legacyPaths, sourceExts, 40);
  const newSurfaces = scanSurfaces(root, newPaths, componentExts, 40);

  const componentMap = renderComponentMap({ page, legacyPaths, newPaths, rows, legacySurfaces, newSurfaces });
  const parity = renderParity({ page, legacyPaths, rows });

  if (!args.write) {
    process.stdout.write(`--- component-map.md ---\n${componentMap}\n--- parity.md ---\n${parity}`);
    return;
  }

  const results = [
    writeFile(path.join(dir, "component-map.md"), componentMap, args.force),
    writeFile(path.join(dir, "parity.md"), parity, args.force),
  ];
  for (const r of results) {
    console.log(`${r.skipped ? "exists, skipped" : "wrote"}: ${path.relative(root, r.path)}`);
  }
  if (results.some((r) => r.skipped)) {
    console.log("Re-run with --force to overwrite existing files.");
  }
}

function csvPaths(value) {
  if (!value || value === true) return [];
  return String(value).split(",").map((v) => v.trim()).filter(Boolean);
}

main();
