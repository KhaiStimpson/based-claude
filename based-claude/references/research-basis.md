# Based Claude Research Basis

This reference distills the local MAS Research Wiki as inspected on 2026-06-27. Treat it as design guidance for the plugin, not as live proof about a target repository.

## Core Thesis

Production coding agents are not just code-writing prompts. They are tool-using systems with context budgets, action boundaries, observable state, validation harnesses, memory policies, repair loops, and review checkpoints. A good developer experience keeps the machinery light until the work justifies it.

## Design Rules

1. Scaffold choice is part of model performance.
   - The wiki overview treats planner, executor, validator, reviewer, memory, and tool adapters as first-order architecture choices.
   - Do not maximize agent count. Add agents only for context isolation, parallel search, distinct authority boundaries, trust boundaries, or independent review.

2. Context is engineered, not accumulated.
   - `context-engineering` and `progressive-disclosure` favor loading compact routing metadata first, then opening detailed instructions and files just in time.
   - Preserve file paths, artifact IDs, commands, and decisions so later agents can retrieve details without transcript replay.

3. Delegation is state management.
   - `agent-orchestration`, `delegation-intelligence`, and `multi-agent-context-isolation` favor one global owner, explicit delegation rationale, bounded subtasks, and structured return contracts.
   - Subagent results should return action state, evidence, uncertainty, risks, and next action.

4. Diagnose before repairing.
   - `agentic-fault-attribution`, SAFARI, and SHERLOC favor active investigation, ranked hypotheses, and compact diagnostic ledgers over broad file dumps.
   - A useful repair input names the suspected location, failure mechanism, supporting and contradicting evidence, confidence, and the next probe.

5. Validation starts with executable evidence.
   - `agent-evaluation`, `test-oracle-engineering`, `process-level-evaluation`, and `evaluator-reliability` favor deterministic checks first, then evidence-conditioned semantic judgment.
   - Pass rate, agreement, final-answer quality, and coverage are weak standalone metrics.

6. Memory is governed data.
   - `governed-agent-memory`, `structured-memory-cards`, and `agent-memory-architecture` separate session, feature, repo, user, and global scopes.
   - Durable memory requires scope, provenance, supersession, confidence, retirement conditions, leakage tests, and recovery tests.

7. Safety lives at the action boundary.
   - `agent-safety-and-governance`, `agent-trust-layer`, `cooperative-recuse-signals`, and `agent-observability` require action records tied to actor, authority, target, evidence, and outcome.
   - Prompt instructions and scope labels are not hard isolation. Scripts and skills are supply-chain artifacts needing review.

8. Self-improvement must be reversible.
   - `self-improving-agent-loops`, `agent-skills`, and `skill-lifecycle` support promoting validated traces into skills, memories, adapters, or rules.
   - Promotion requires before/after evidence, versioning, rollback, retirement criteria, and independent review for evaluator or safety changes.

9. Minimum code is not minimum engineering.
   - `guarded-code-minimization` supports a ladder: do not build unnecessary work, reuse local code, prefer platform and standard-library features, reuse installed dependencies, then write the smallest new code.
   - This never removes security, data-loss prevention, trust-boundary validation, accessibility, calibration, or explicit requirements.

10. Tool adapters carry domain contracts.
    - `tool-grounding-adapters` and `tool-environment-agent-protocol` favor typed inputs, preconditions, post-action checks, versioning, and replayable traces.

## Wiki Source Pointers

- `wiki/overview.md`
- `wiki/concepts/agent-orchestration.md`
- `wiki/concepts/context-engineering.md`
- `wiki/concepts/progressive-disclosure.md`
- `wiki/concepts/delegation-intelligence.md`
- `wiki/concepts/multi-agent-context-isolation.md`
- `wiki/concepts/agentic-fault-attribution.md`
- `wiki/concepts/harness-engineering.md`
- `wiki/concepts/agent-evaluation.md`
- `wiki/concepts/evaluator-reliability.md`
- `wiki/concepts/test-oracle-engineering.md`
- `wiki/concepts/process-level-evaluation.md`
- `wiki/concepts/governed-agent-memory.md`
- `wiki/concepts/structured-memory-cards.md`
- `wiki/concepts/agent-safety-and-governance.md`
- `wiki/concepts/agent-trust-layer.md`
- `wiki/concepts/agent-observability.md`
- `wiki/concepts/self-improving-agent-loops.md`
- `wiki/concepts/agent-skills.md`
- `wiki/concepts/skill-lifecycle.md`
- `wiki/concepts/guarded-code-minimization.md`
- `wiki/concepts/tool-grounding-adapters.md`
- `wiki/sources/summary-agent-skills-for-context-engineering.md`
- `wiki/sources/summary-what-should-agents-say-action-state-communication-for-efficient-multi-agent-systems.md`
- `wiki/sources/summary-sherloc-structured-diagnostic-localization-for-code-repair-agents.md`
- `wiki/sources/summary-safari-scaling-long-horizon-agentic-fault-attribution-via-active-investigation.md`
- `wiki/sources/summary-dietrichgebert-ponytail.md`

## Delegation Evidence

Read only when changing, reviewing, or defending delegation and workflow policy.

- `agent-orchestration`: multiple agents only when task structure or trust boundaries justify coordination cost; one owner, compact action state, budgets, simpler baselines.
- `delegation-intelligence`: delegation is a decision — is it useful, what context moves, who receives it, how is returned evidence integrated; requires explicit rationale and a return contract.
- `multi-agent-context-isolation`: subagents are primarily context isolation; coordination overhead can erase the benefit.
- `dynamic-agent-topologies`: runtime topology changes only when decisions are observable and budget-aware.
- `workflow-optimization`: judge workflow changes by quality, cost, latency, safety, process traces, and simple baselines.
- `summary-what-should-agents-say-...`: compact action-state transfer beats raw natural-language chatter.

Implications: single-owner default; split for independence, isolation, or trust boundaries rather than role play; transfer action state; make workflow decisions observable through compact traces only when they matter.

## Evidence Boundaries

The wiki mixes papers, repository ingests, and practitioner guidance. Treat repeated patterns across concept pages as stronger evidence than any single reported benchmark. Treat repository-authored quantitative claims as medium confidence unless reproduced in the target environment.
