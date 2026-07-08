#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parseArgs, resolveRoot, walk, exists, readText, ensureDir, today } = require("./_lib");

const SOURCE_EXT = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".php", ".rb", ".py",
  ".cs", ".java", ".go", ".html", ".htm", ".erb", ".ejs", ".hbs", ".astro",
]);

// Files in the "after" tree that read as reusable components.
function isComponentFile(rel) {
  const ext = path.extname(rel).toLowerCase();
  const base = path.basename(rel, ext);
  if ([".vue", ".svelte", ".jsx", ".tsx", ".astro"].includes(ext)) return true;
  if ([".ts", ".js"].includes(ext) && /^[A-Z][A-Za-z0-9]*$/.test(base)) return true;
  return false;
}

function scanSurfaces(root, dirs, filter, cap) {
  const out = [];
  for (const dir of dirs) {
    const abs = path.resolve(root, dir);
    if (!exists(abs)) {
      out.push({ dir, missing: true, files: [] });
      continue;
    }
    const files = walk(abs, { maxFiles: 4000, maxDepth: 6 })
      .filter((rel) => SOURCE_EXT.has(path.extname(rel).toLowerCase()))
      .filter(filter)
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

### New components (after)

${commentList(newSurfaces, "no component-like files found in the scan window.")}
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "init";
  const root = resolveRoot(args);

  if (command !== "init") {
    console.error(`Unknown command '${command}'. Supported: init.`);
    process.exit(1);
  }

  const page = String(args.page || args.title || "the page").replace(/\s+/g, " ").trim();
  const legacyPaths = csvPaths(args.legacy);
  const newPaths = csvPaths(args.new);
  const rows = parseRows(args.rows);
  const dir = path.resolve(root, args.dir || path.join(".migrato", "migration"));

  const legacySurfaces = scanSurfaces(root, legacyPaths, () => true, 40);
  const newSurfaces = scanSurfaces(root, newPaths, isComponentFile, 40);

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
