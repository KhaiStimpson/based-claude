# Loop Case Fixture

Use this folder for future loop-mode regression tests.

A complete fixture should include:

- an L1 report-only task that may write state and reports but cannot edit product files;
- an L2 assisted-fix task with protected paths, validation, reviewer separation, human gates, and rollback notes;
- expected trace labels for `decisive_progress`, `useful_exploration`, `no_progress_infrastructure`, and `regression`;
- expected router phases from discover through verify and handoff;
- at least one forbidden action that must route to a safety gate.
