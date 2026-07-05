const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function tempRoot(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix || "based-claude-test-"));
}

function runScript(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(__dirname, script), ...(args || [])], {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    timeout: options.timeout || 15000,
  });
}

module.exports = { tempRoot, runScript };
