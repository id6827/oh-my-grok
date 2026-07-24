# Changelog

## 0.9.0-rc.1 — 2026-07-24

### OMC-scale TypeScript runtime port

- **src/**: Product port of OMC `4.15.7` runtime (~539 production `.ts` after transform; `tsc` → `dist/`).
- **Adapters/shims:** `src/adapters/grok/` (models, tools, plugin root), `src/shims/` (claude-agent-sdk, better-sqlite3, ast-grep).
- **Hooks:** Expanded `hooks/hooks.json` + ported OMC scripts (project-memory, wiki, permission, review-gate, …) loading `dist/hooks/*`.
- **CLI:** `omg` / `omc` / `oh-my-grok` bin aliases; `dist/runtime` compat re-exports.
- **Docs:** `OMC-SOURCE.md`, `PORT-ARCHITECTURE.md`, `OMC-PORT-STATUS.md`; SIMILARITY checklist vs module coverage split; README.ko / CONTRIBUTING / SECURITY.
- **Inventory:** `scripts/port-inventory.mjs`, `scripts/port-omc-src.mjs`.

## 0.7.0 — 2026-07-24

### Strict ≥90 epics

- **Runtime:** TypeScript package `runtime/` → `dist/runtime/` (`npm run build`), atomic writes.
- **Hooks:** skill-active-guard; HOOKS-PARITY.md; full lifecycle graph.
- **Team:** `omg team N:agent "task"` with tmux when available, forced dry-run + plan JSON otherwise; team-state schema.
- **HUD:** `omg hud --watch`, `watch-hud.sh`, richer lines (branch/prd/team/agents).
- **SIMILARITY:** A93/B91/C90/D90 (strict min 90).

## 0.6.0 — 2026-07-24

### Strict similarity (each layer ≥80)

- **Policy:** docs/SIMILARITY.md now requires **per-layer ≥80** (not weighted average alone).
- **B:** SessionEnd, PostToolUseFailure; 25 keyword rules; Stop PRD-aware for ralph.
- **C:** MCP tools + `state_get_status` + `omg_info`; session-scoped `omg state --session`; `setup` / `team-help` / worktree-helper.
- **D:** `scripts/hud/omg-hud.mjs` multi-line HUD; `omg hud` / `setup-hud`.
- Scores: A92 / B84 / C82 / D81 (strict min **81**).

## 0.5.0 — 2026-07-24

### Added (Ralph: ≥80% flow-weighted similarity)

- **MCP state server** `mcp/omg-state-server.mjs` + `.mcp.json` (`state_list_active`, `state_read`, `state_write`, `state_clear`).
- **PostToolUse** `post-tool-verifier.mjs` + **SubagentStart/Stop** `subagent-tracker.mjs`.
- **File HUD** `hooks/scripts/lib/hud.mjs` → `.omg/state/hud-status.txt`; `omg status`.
- **Config** `templates/omg.jsonc` + `hooks/scripts/lib/config.mjs` (deepInterview threshold).
- Keywords: `verify`, `analyze …`; slash **commands/** aliases for core skills.
- **docs/SIMILARITY.md** methodology; blended score **80.0** (A92/B78/C58/D52).

## 0.4.0 — 2026-07-24

### Added (Autopilot parity boost from OMC similarity analysis)

- **`scripts/omg-state.mjs`** — list/get/set/clear file state under `.omg/state/` (MCP substitute).
- **`bin/omg.js`** — thin CLI: `version`, `state`, `doctor` (+ `package.json` bin).
- **`pre-tool-enforcer.mjs`** — PreToolUse deny for catastrophic shell patterns.
- **`pre-compact.mjs`** — PreCompact snapshot + active-mode reminder.
- Keyword expansions: `tdd`, `ultrathink`, `deepsearch`, `ai-slop` / deslop.
- **`scripts/tests/test-hooks.mjs`** — unit tests for hooks/state (`npm test`).
- PARITY-MATRIX refreshed; indicative hooks similarity ~55–65%, blended ~70%.

### Non-goals this release

- Git remote deploy/push, full OMC runtime, HUD binary, tmux multi-CLI team.

## 0.3.0 — 2026-07-24

### Added

- `/security-review` skill + keyword (`security review`, `review security`, `보안 리뷰`) → security-reviewer agent.
- `/code-review` skill + keyword (`code review`, `review this PR`, …) → code-reviewer agent.
- `skill-injector.mjs` on UserPromptSubmit: re-injects protocol when modes are active under `.omg/state/`.
- `clear-active-modes.mjs` + cancel keyword path clears active OMG state files.

### Notes

- Still no git remote deploy/push tooling in-scope for this release.
- HUD binary, full OMC pre-tool-enforcer, MCP state_write remain deferred.

## 0.2.0 — 2026-07-24

### Added (Layer B — orchestration hooks)

- `UserPromptSubmit` **keyword-detector**: routes `deep-interview`, `autopilot`, `ralph`, `ulw`/`ultrawork`, `ralplan`, `ultraqa`, `ui-mockup`, `web-research`, `cancelomg` via `additionalContext` and seeds `.omg/state/*-state.json`.
- `Stop` **stop-continuation**: blocks end-of-turn while an OMG mode is `active` under `.omg/state/` (deep-interview / autopilot / ralph / …), with fail-open guards.
- Shared hook helpers in `hooks/scripts/lib/hook-io.mjs`.

### Notes

- Simplified vs full OMC hook graph (no skill-injector MCP, no HUD binary, no flock workflows).
- Keyword activation does not overwrite rich deep-interview state files that already contain `interview_id` / rounds.

## 0.1.0 — 2026-07-24

### Added

- Initial Grok Build plugin scaffold (`plugin.json`, hooks, docs).
- Port of 19 OMC agents to Grok tool/path conventions + `visual-designer`.
- Port of 41 OMC skills (omc-* → omg-*) with `.omg/` state contract.
- Grok-exclusive skills: `ui-mockup`, `web-research`.
- SessionStart hook ensuring `.omg/` directories.
- Scripts: `port-from-omc.mjs`, `validate-parity.mjs`, `smoke-skills.sh`.
- Documentation: GETTING-STARTED, PARITY-MATRIX, TOOL-MAPPING, MIGRATION, ARCHITECTURE.

### Notes

- Layer B runtime (keyword detector, Stop gates, HUD binary, tmux team CLI) deferred.
- Derived from oh-my-claudecode under MIT.
