# Delegation Evidence Appendix

Read this appendix only when changing, reviewing, or defending delegation and workflow policy.

## Evidence Basis

- `wiki/concepts/agent-orchestration.md` frames orchestration as decomposition, role selection, context movement, validation, recovery, and termination. It supports multiple agents only when task structure or trust boundaries justify coordination cost, with one owner, compact action state, budgets, and simpler baselines.
- `wiki/concepts/delegation-intelligence.md` treats delegation as a decision about whether delegation is useful, what context moves, who receives it, and how returned evidence is integrated. It requires an explicit rationale and return contract.
- `wiki/concepts/multi-agent-context-isolation.md` describes subagents primarily as context isolation. Isolation helps focus and parallelism, but coordination overhead can erase the benefit.
- `wiki/concepts/dynamic-agent-topologies.md` supports runtime topology changes only when decisions are observable and budget-aware. Dynamic routing can cost more than it creates.
- `wiki/concepts/workflow-optimization.md` says workflow changes should account for quality, cost, latency, safety, process traces, and simple baselines.
- `wiki/concepts/context-engineering.md` supports progressive disclosure, compact working state, and retrieval of only the context needed for the current decision.
- `wiki/sources/summary-what-should-agents-say-action-state-communication-for-efficient-multi-agent-systems.md` supports compact action-state transfer over raw natural-language chatter.

## Policy Implications

- Keep single-owner execution as the default baseline.
- Split work for independence, context isolation, or trust boundaries rather than role play.
- Transfer action state: objective, files, commands, decisions, evidence, uncertainty, risks, and next action.
- Make workflow decisions observable through compact traces only when they matter.
- Evaluate workflow changes by whether they improve outcomes after accounting for token, latency, and safety cost.
