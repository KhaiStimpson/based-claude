# Opt-In Phase Gates (Deterministic Hooks)

This plugin ships no hooks and installs nothing automatically. CLAUDE.md-style
instructions, skills, and agent prompts are probabilistic control: they rely on the model
following them, which can fail under pressure, ambiguity, or prompt injection. Claude Code
hooks and managed settings are deterministic control: they run as code and enforce
regardless of what the model decides. Use this reference only when a user explicitly asks
to add hooks, or a safety review recommends one and the user approves it. Never add a hook
as a silent side effect of another task.

## When A Prompt-Level Rule Is Not Enough

Prefer a hook over a prompt instruction when the failure mode is a single catastrophic
miss rather than an average-case improvement — the same test the best-practices guidance
uses: "if Claude already does something correctly without the instruction, delete it or
convert it to a hook." Candidates from this plugin's own policy surfaces:

| Existing prompt-level rule | Reference | Deterministic upgrade |
| --- | --- | --- |
| "Do not weaken tests, validators, rubrics, or safety checks to make work pass." | `system-contract.md` | `PreToolUse` guard rejecting edits to designated test/validator/policy paths without an explicit flag |
| "Do not perform deployment, destructive git, credential handling... without explicit user approval." | `system-contract.md` | `PreToolUse` guard blocking a denylist of destructive command patterns |
| Handoffs and traces should exist before context is lost | `handoff-template.md`, `trace-schema.md` | `PreCompact` hook that writes a handoff snapshot before compaction runs |
| "Do not silently write durable memory." | `safety-policy.md` | `PreToolUse` guard on writes under `.based/memory/cards/active/` outside of `based-memory promote` |
| Show evidence rather than asserting success | `validation-ladder.md` | `Stop` hook that blocks turn completion when no validation record was produced for a task tagged as needing one |

## Structural Preference

Per `tool-adapter-safety.md`, prefer controls below the prompt layer: read-only by
construction, writes disabled by default, fail closed, audit the actor/target/outcome.
Hooks are how Claude Code exposes that layer to a project; use it the same way this plugin
already asks live tool adapters to behave.

## Templates (copy into your own project, do not auto-install)

These are illustrative starting points for a project's own `.claude/settings.json` (or
`~/.claude/settings.json` for a personal-scope gate). They are not shipped as
`hooks/hooks.json` in this plugin — a plugin-shipped hook file merges into every session
where the plugin is enabled, which would break the plugin's no-always-on-hooks posture for
every user. Copy only the gate you want, scope it narrowly, and test it before relying on
it.

### Destructive-command guard (`PreToolUse`)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/deny-destructive.js"
          }
        ]
      }
    ]
  }
}
```

`deny-destructive.js` reads the tool input from stdin as JSON, checks the command string
against a project-defined denylist (e.g. `rm -rf`, `git push --force` to a protected
branch, `git reset --hard`, credential-file writes), and exits non-zero with a message to
block. Keep the denylist short and specific; broad regexes produce false positives that
train users to bypass the gate.

### Evidence gate before stopping (`Stop`)

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/require-evidence.js"
          }
        ]
      }
    ]
  }
}
```

`require-evidence.js` checks whether the turn's transcript or a project-defined signal
(e.g. a fresh entry in `.based/traces/actions.jsonl` with `validation: pass|fail`) exists
before allowing the stop; if not, it exits non-zero with a message asking Claude to run
the check and show the result. Advisory by default is safer than a hard block — see the
[presence project](https://github.com/sara-star-quant/presence) for a worked example of
this pattern with tiered strictness presets. Claude Code overrides a Stop hook and ends
the turn after 8 consecutive blocks, so this cannot loop forever even if misconfigured.

### Handoff snapshot before compaction (`PreCompact`)

```json
{
  "hooks": {
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/snapshot-handoff.js"
          }
        ]
      }
    ]
  }
}
```

`snapshot-handoff.js` writes a `handoff-template.md`-shaped file to a project log location
(not `.based/handoffs/` by default, to avoid colliding with an explicit `based-handoff
--write` from the session) so a compacted session's action state survives even if the
agent did not explicitly call `based-handoff` first.

## Review Boundary

Any hook a user adds is still a supply-chain artifact: review it per `safety-policy.md`
(hidden execution paths, credential access, host-specific assumptions) and
`tool-adapter-safety.md` (fail closed, audit records, disable/rollback path) before
recommending it stays enabled long-term.
