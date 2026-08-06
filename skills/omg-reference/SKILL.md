---
name: omg-reference
description: OMG agent catalog, available tools, team pipeline routing, commit protocol, and skills registry. Auto-loads when delegating to agents, using OMG tools, orchestrating teams, making commits, or invoking skills.
user-invocable: false
---

# OMG Reference

Use this built-in reference when you need detailed OMG catalog information that does not need to live in every `CLAUDE.md` session.

## Agent Catalog

Prefix: `oh-my-grok:`. See `agents/*.md` for full prompts.

- `explore` (LOW) — fast codebase search and mapping
- `analyst` (HIGH) — requirements clarity and hidden constraints
- `planner` (HIGH) — sequencing and execution plans
- `architect` (HIGH) — system design, boundaries, and long-horizon tradeoffs
- `debugger` (MEDIUM) — root-cause analysis and failure diagnosis
- `executor` (MEDIUM) — implementation and refactoring
- `verifier` (MEDIUM) — completion evidence and validation
- `tracer` (MEDIUM) — trace gathering and evidence capture
- `security-reviewer` (MEDIUM) — trust boundaries and vulnerabilities
- `code-reviewer` (HIGH) — comprehensive code review
- `test-engineer` (MEDIUM) — testing strategy and regression coverage
- `designer` (MEDIUM) — UX and interaction design
- `writer` (LOW) — documentation and concise content work
- `qa-tester` (MEDIUM) — runtime/manual validation
- `scientist` (MEDIUM) — data analysis and statistical reasoning
- `document-specialist` (MEDIUM) — SDK/API/framework documentation lookup
- `git-master` (MEDIUM) — commit strategy and history hygiene
- `code-simplifier` (HIGH) — behavior-preserving simplification
- `critic` (HIGH) — plan/design challenge and review

## Model Routing (Grok Build)

Complexity tiers are **intent labels**, not Claude host slugs. Prefer omitting `model` on `spawn_subagent` (inherit host). Safe explicit slug today: **`grok-4.5` only**.

| Complexity | When to use | Host today |
|------------|-------------|------------|
| LOW | Quick lookups, lightweight inspection, narrow docs work | omit or `grok-4.5` (`OMG_MODEL_LOW`) |
| MEDIUM | Standard implementation, debugging, and review | omit or `grok-4.5` (`OMG_MODEL_MEDIUM`) |
| HIGH | Architecture, deep analysis, consensus planning, high-risk review | omit or `grok-4.5` (`OMG_MODEL_HIGH`) |

Claude-era aliases (`haiku`/`sonnet`/`opus`) map via `mapModel` in code if passed, but skills must not instruct agents to pass them as Grok host slugs.

## Tools Reference

### External AI / orchestration
- `/team N:executor "task"`
- `omg team N:codex|gemini|antigravity "..."`
- `omg ask <claude|codex|gemini|antigravity>`
- `/ccg`

### OMG state
- `state_read`, `state_write`, `state_clear`, `state_list_active`, `state_get_status`

### Team orchestration
- Grok Build 2.1.178+ uses one implicit agent team per session. Spawn teammates directly with Agent/Task using distinct `name` values; do not call removed `TeamCreate`/`TeamDelete` tools or rely on `team_name` for native routing.
- Use todo_write or the available task-list surface for tracking only. Task-list tools do not create native teams.
- Legacy OMG tmux/CLI teams are separate: use `/team` or `omg team` plus OMG state/API commands for external worker runs.

### Notepad
- `notepad_read`, `notepad_write_priority`, `notepad_write_working`, `notepad_write_manual`

### Project memory
- `project_memory_read`, `project_memory_write`, `project_memory_add_note`, `project_memory_add_directive`

### Code intelligence
- LSP: `lsp_hover`, `lsp_goto_definition`, `lsp_find_references`, `lsp_diagnostics`, and related helpers
- AST: `ast_grep_search`, `ast_grep_replace`
- Utility: `python_repl`

## Skills Registry

Invoke built-in workflows via `/<name>`.

### Workflow skills
- `autopilot` — full autonomous execution from idea to working code
- `ralph` — persistence loop until completion with verification
- `ultrawork` — high-throughput parallel execution
- `visual-verdict` — structured visual QA verdicts
- `team` — coordinated team orchestration
- `orchestration` — main orchestrator: worktree-per-task, ralplan→impl→review→PR; lead never implements
- `ccg` — Codex + Gemini + Claude synthesis lane
- `ultraqa` — QA cycle: test, verify, fix, repeat
- `omg-plan` — planning workflow and `/plan`-safe alias
- `ralplan` — consensus planning workflow
- `sciomc` — science/research workflow
- `external-context` — external docs/research workflow
- `web-research` — topic research brief (Grok web/X)
- `deepinit` — hierarchical AGENTS.md generation
- `deep-interview` — Socratic ambiguity-gated requirements workflow
- `ai-slop-cleaner` — regression-safe cleanup workflow

### Utility skills
- `ask`, `cancel`, `note`, `skillify`, `learner` (deprecated alias), `omg-setup`, `mcp-setup`, `hud`, `omg-doctor`, `trace`, `release`, `project-session-manager`, `skill`, `writer-memory`, `configure-notifications`

### Keyword triggers kept compact in CLAUDE.md
- `"autopilot"→autopilot`
- `"ralph"→ralph`
- `"ulw"→ultrawork`
- `"ccg"→ccg`
- `"ralplan"→ralplan`
- `"orchestration" / "orchestrate"→orchestration`
- `"deep interview"→deep-interview`
- `"deslop" / "anti-slop"→ai-slop-cleaner`
- `"deep-analyze"→analysis mode`
- `"tdd"→TDD mode`
- `"deepsearch"→codebase search`
- `"ultrathink"→deep reasoning`
- `"cancelomc"→cancel`
- Team orchestration is explicit via `/team`.

## Team Pipeline

Stages: `team-plan` → `team-prd` → `team-exec` → `team-verify` → `team-fix` (loop).

- Use `team-fix` for bounded remediation loops.
- `team ralph` links the team pipeline with Ralph-style sequential verification.
- Prefer team mode when independent parallel lanes justify the coordination overhead.

## Commit Protocol

Use git trailers to preserve decision context in every commit message.

### Format
- Intent line first: why the change was made
- Optional body with context and rationale
- Structured trailers when applicable

### Common trailers
- `Constraint:` active constraint shaping the decision
- `Rejected:` alternative considered | reason for rejection
- `Directive:` forward-looking warning or instruction
- `Confidence:` `high` | `medium` | `low`
- `Scope-risk:` `narrow` | `moderate` | `broad`
- `Not-tested:` known verification gap

### Example
```text
feat(docs): reduce always-loaded OMG instruction footprint

Move reference-only orchestration content into a native Claude skill so
session-start guidance stays small while detailed OMG reference remains available.

Constraint: Preserve CLAUDE.md marker-based installation flow
Rejected: Sync all built-in skills in legacy install | broader behavior change than issue requires
Confidence: high
Scope-risk: narrow
Not-tested: End-to-end plugin marketplace install in a fresh Claude profile
```


## Grok Capability Extensions

- On build/test failures: use `web_search` / `web_fetch` for latest fixes and community issues before inventing workarounds.
- On UI work without a design: prefer the `/ui-mockup` skill (Image Gen → Vision analysis → code → Vision QA).
- For live docs/API research: use `/web-research` or call `web_search` directly.
- Prefer `spawn_subagent` with `isolation: "worktree"` for parallel executors when mutating code.
- Persist orchestration state under `.omg/` only (never `.omc/`).
- Use `ask_user_question` for structured one-at-a-time questions (not multi-question dumps).
- **Imagine video + ZDR:** Zero Data Retention teams need a video byte sink (`output_path` / `output_upload_url` once the host supports them). Until then `image_to_video` may 400. See `docs/IMAGINE-VIDEO-ZDR.md` and host contract `docs/design/imagine-video-zdr-host-contract.md`. Content-studio / IF peaks should land under `public/videos/` when shipping product assets.
