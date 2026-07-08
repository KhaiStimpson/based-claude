# Fixture: Slop Lint Behavior

## Invariant

`migrato-slop-check` reports narration comments, placeholder debris, AI-tell phrases,
emoji in source, commented-out code blocks, and excessive comment density — and stays
advisory: exit 0 unless `--strict`. It does not flag why-comments, license headers,
markdown prose, or pre-existing lines outside a `--diff` scope, because a style gate that
cries wolf trains users to bypass it.

## Deterministic proof

`bin/migrato-slop-check.test.js` covers:

- clean idiomatic code with a why-comment produces no findings.
- narration, placeholder, ai-phrase, and emoji each fire on the line that carries them.
- `--strict` exits 1 when findings exist; default exit is 0.
- why-comments (because/workaround/invariant wording) and leading license blocks are exempt.
- commented-out code fires once per consecutive block, not per line.
- comment-heavy files get a single density finding.
- markdown and unknown extensions are skipped entirely.
- `--diff` checks added lines only; pre-existing debt is not reported.

Run: `npm test` (or `node --test bin/migrato-slop-check.test.js`) from the plugin root.
