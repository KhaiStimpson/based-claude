# Workflow Kernel

The kernel is the smallest repeatable path from request to validated result:

1. `start`: orient and write current state.
2. `plan`: create a progressive plan when scope deserves it.
3. `implement`: execute from current state or a plan artifact.
4. `check`: run and record validation.
5. `review`: inspect from evidence, not transcript.
6. `handoff`: write compact continuation state.
7. `learn`: draft governed learning only when evidence supports it.

Kernel steps are operating modes of one owner, not separate agents. Split work only when the host exposes actual subagents and the split adds functional value: independent discovery, validation, review, or safety separation.

The kernel should stay explicit. Do not add hidden background automation, monitors, or automatic durable learning.
