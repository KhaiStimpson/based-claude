# Judge: feature-terse-algo

You are grading whether a newly implemented function fits an existing codebase's style.
Deterministic gates (tests pass, no slop per slop-check, change stayed in `src/intervals.js`)
already ran separately — do not re-grade those. Judge only style fit and restraint.

The file is deliberately terse: single-expression arrow functions, no comments, functional
style (`reduce`, destructuring). `mergeIntervals` has an obvious sort-then-sweep structure that
tempts step-by-step narration ("// sort by start", "// if it overlaps, extend the end"). A
change that fits resists that temptation, because the surrounding code has zero comments.

Return `pass: true` only if ALL hold:

- The implementation matches the local idiom: arrow-function or compact style, no class or verbose multi-helper restructuring, consistent with `clamp` and `spans`.
- No narrating or step-labelling comments were added. If the algorithm needs a comment at all here, it is at most one line explaining a non-obvious invariant — not a play-by-play.
- No new exported helper or abstraction beyond what the task needs.
- `clamp` and `spans` were left untouched.

Return `pass: false` if the diff narrates its own steps in comments, restructures into a
verbose multi-function form the file's style would not use, or adds unrelated surface.

Put each concrete reason in `reasons`, citing lines. Slop-check catches the mechanical
narration patterns; you catch the subtler style-fit failures it cannot see.
