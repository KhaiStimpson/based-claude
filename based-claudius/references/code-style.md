# Code Style Contract

How code delivered by this plugin should read. The bar: a maintainer opens the diff and cannot tell a machine wrote it — the change looks like the codebase grew it.

## First Rule: The Codebase Wins

Existing local conventions outrank this file, training defaults, and personal aesthetics. Before writing, read neighboring files for naming, module layout, error-handling posture, import style, test shape, and comment culture — then match them, even when you would choose differently. A beautiful change in the wrong dialect is a defect.

When local convention and this contract conflict (for example, a codebase that documents every public symbol), the local convention wins and the rest of this contract still applies to everything it does not cover.

## Comments

Code says what; a comment exists only for why the code cannot say itself.

- Comment only non-obvious invariants, workarounds for external bugs (link the issue), tricky domain rules, or decisions a future reader would reasonably get wrong.
- Never narrate (`// increment the counter`), restate a signature, or add section banners over ten-line functions.
- No TODO, FIXME, HACK, or placeholder comments in delivered work. Finish the work or name the gap in the report instead of embedding it.
- Keep enforced doc conventions (public-API JSDoc, docstrings, rustdoc) where the codebase or its tooling requires them, written in the register of the neighboring ones.
- Do not strip existing comments the change did not require touching.

## Shape

- Make the smallest change that solves the problem in the local idiom. Follow `research-basis.md` rule 9: reuse local code, then platform features, then installed dependencies, before writing new code.
- No speculative abstraction: no interface with one implementation, no configuration for a value that never varies, no helper extracted for a single call site unless it names a real domain concept.
- No defensive handling for states that cannot occur. Guard actual trust boundaries; do not wrap internal calls in try/catch that only re-throws or logs.
- Names carry the meaning comments would otherwise carry. Avoid `handler`, `manager`, `util`, `helper`, `data`, `result2` unless local convention uses them.
- Delete dead code; never leave it commented out. Version control is the archive.
- Match the codebase's error posture exactly: if it returns errors, return errors; if it throws typed exceptions, throw them; do not introduce a second style.
- No formatting churn on lines the change does not need. Diff noise is review cost.

## Tests

- Test names state the behavior under test, not the method name.
- Assert observable behavior, not implementation details that break on refactor.
- Reuse the project's existing fixtures, factories, and helpers before inventing new ones.
- A generated test must fail on the pre-change bug it claims to cover (see `validation-ladder.md`).

## AI Tells — Never Ship

- Narrating comments or a comment-per-block rhythm.
- Emoji in code, comments, commit messages, or docs, unless the project already uses them.
- Filler prose in docs or comments: "Note that", "It's worth noting", "Certainly", "simply", "In this function we".
- Boilerplate module headers ("This module is responsible for...").
- Unrequested README or doc edits riding along with a code change.
- Example blocks, console.log debugging, or scaffold remnants left in delivered paths.
- Symmetric filler (a getter for every setter, an interface for every class) added for uniformity rather than need.

## Enforcement

`claudius-slop-check` runs the mechanical pass over a diff or file set (comment density, narration patterns, placeholder debris, AI-tell phrases) — advisory by default, `--strict` for CI. `review-policy.md` carries the reviewer's judgment-level categories for what the mechanical pass cannot see: style mismatch with the codebase, speculative abstraction, and defensive noise.
