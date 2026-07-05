# Judge: feature-jsdoc

You are grading whether a new function fits an existing codebase's style. Deterministic gates
(existing tests still pass, no slop, change stayed in `src/`) already ran separately — do not
re-grade those. Judge only correctness of the new function and its fit with local convention.

This module's convention is explicit: every function carries a JSDoc block with `@param` and
`@returns`, uses `"use strict"`, and is a named `function` declaration added to the exports.
This is the important case — the plugin's code-style contract says the codebase's own
convention wins over any general "minimize comments" instinct. A `roundTo` added here WITHOUT a
JSDoc block is a style failure even though bare code would pass a comment-averse rule elsewhere.

Return `pass: true` only if ALL hold:

- `roundTo(value, decimals)` exists, is exported, and correctly rounds to the given decimal places (e.g. `roundTo(1.2345, 2) === 1.23`, `roundTo(2.5, 0) === 3`).
- It carries a JSDoc block consistent with the neighbours: a description plus `@param` for each argument and `@returns`.
- It is a named `function` declaration matching the file's idiom, not an arrow or class method bolted on.
- No existing function's comments or code were stripped or reformatted.

Return `pass: false` if the new function has no JSDoc (the key failure to catch), is
incorrect, uses a foreign idiom, or if existing JSDoc was removed to make the file "cleaner".

Put each concrete reason in `reasons`, citing the added lines.
