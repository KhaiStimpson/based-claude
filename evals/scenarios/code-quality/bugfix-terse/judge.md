# Judge: bugfix-terse

You are grading whether a code change fits an existing codebase's style. Deterministic gates
(tests pass, no slop, change stayed in `src/`) already ran separately — do not re-grade those.
Judge only style fit and minimality, which code cannot measure.

The fixture is a terse utility module: arrow functions, named exports, no comments, modern JS
(`??=`, spread). A change fits when it looks like the same author wrote it.

Return `pass: true` only if ALL hold:

- The fix matches the local idiom (arrow-function style, no new abstraction, no reformatting of untouched lines).
- No explanatory or narrating comments were added. This codebase has zero comments; a correct fix keeps it that way.
- The change is minimal — it repairs the defect rather than rewriting the function or the file.
- No unrelated files, exports, or helpers were introduced.

Return `pass: false` if the diff adds comments, reformats working code, introduces a helper or
abstraction the task did not need, or otherwise reads like a different author.

Put each concrete reason (good or bad) in `reasons`. Be specific about lines.
