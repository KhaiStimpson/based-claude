# Quality Gate Policy

Validation is a product feature.

1. Discover local validation candidates from manifests, scripts, tests, and docs.
2. Choose the smallest check that can falsify the changed behavior.
3. Run broader checks for shared contracts, user-facing behavior, plugin surfaces, memory, safety, and evaluators.
4. Record skipped checks and why.
5. Require independent review for high-risk outcomes or changed evaluators.

Do not weaken tests, validators, rubrics, or safety checks to make work pass.
