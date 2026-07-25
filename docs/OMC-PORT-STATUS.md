# OMC Port Status

**Source pin:** OMC `4.15.7` @ `41a4c0f77144c5beb5f5f000a89cff379c680606` — see `docs/OMC-SOURCE.md` (upgrade checkpoint)  
**OMG version:** `0.9.0-rc.1`  
**Last updated:** 2026-07-25 (README + OMC pin checkpoint; full vitest residual **119 fail** — product gate remains core+smoke)
**Legend:** ✅ ported (build-green, usable) · 🟡 partial / intentional reduce · ❌ missing · N/A documented

**Module coverage** (touched = ported+partial): run `node scripts/port-inventory.mjs`  
**Do not merge** with checklist similarity scores (`docs/SIMILARITY.md`).

---

## Snapshot

| Metric | Value |
|--------|------:|
| OMC `src/**/*.ts` | ~1155–1176 |
| OMG `src/**/*.ts` (incl. tests) | **~1165** (2026-07-24 gap-port) |
| `dist/**/*.js` after build | production tsc (tests excluded) |
| Top-level modules touched | ~100% files present |
| Stub/shim modules | `src/shims/*`, `src/adapters/grok/*`, `@ast-grep/napi` ambient types |
| Gap review artifact | `.omg/artifacts/code-review/omc-port-gap-2026-07-24.md` |

---

## A. Runtime / core (`src/**`)

| OMC path | OMG path | Status | Notes |
|----------|----------|--------|-------|
| `src/**` (~1155 ts) | `src/` | ✅ | ~1165 files incl. tests; tsc excludes tests |
| dist build pipeline | `tsc` + optional `build:bridge` | ✅ | esbuild wired; cjs gitignored |
| bin omc aliases | `bin/omg.js` + package.bin `omg`/`omc`/`oh-my-grok` | ✅ | |
| better-sqlite3 | optionalDep + shim + job-state-db dynamic import | 🟡 | |
| `src/types`…`src/openclaw` (all modules) | `src/*` | ✅ | production + tests present |
| `src/__tests__` | `src/__tests__` | ✅ | ported; vitest optional (`test:vitest`) |
| `src/adapters/grok` | OMG-only | ✅ | models, tools, plugin-root |
| `src/shims` | OMG-only | ✅ | claude-agent-sdk, better-sqlite3 |

## B. Bridge / MCP / CLI

| Surface | Status | Notes |
|---------|--------|-------|
| bridge/mcp-server full tools | ✅ | **Grok default:** `.mcp.json` → `mcp/run-tools-server.mjs` → `bridge/mcp-server.cjs` (~54 tools, MCP stdio; verified listTools+callTool) |
| bridge/team-bridge, team-mcp, team.js | 🟡 | TS under `src/team`; build scripts ported |
| bridge/runtime-cli, cli | 🟡 | `src/cli` + `bin/omg.js`; build-cli.mjs present |
| claude-md-coordinator → AGENTS/omg-setup | 🟡 | `src/cli/claude-md-coordinator.ts` |
| gyoshu_bridge.py | N/A | not required on Grok |
| omg ask / provider advisor | ✅ | `bin/omg.js ask` → `dist/cli/ask.js` + `scripts/run-provider-advisor.js` |
| omg wait (rate limit) | 🟡 | `src/features/rate-limit-wait` |
| omg session / friction / hud CLI | 🟡 | hud via `omg hud` |

## C. Hooks (OMC scripts)

| Script | Status |
|--------|--------|
| keyword-detector, skill-injector, pre-tool-enforcer | ✅ registered |
| post-tool-verifier, post-tool-failure, pre-compact | ✅ registered |
| session-start/end, stop-continuation, subagent-tracker | ✅ registered |
| skill-active-guard | ✅ registered |
| hook-bridge → dist/hooks/bridge.js | ✅ launcher |
| permission-handler | 🟡 file ported, not all registered |
| project-memory-* | 🟡 file ported |
| wiki-session-* | 🟡 file ported |
| context-guard-stop, context-safety | 🟡 file ported |
| persistent-mode | ✅ | product Stop: `hooks/scripts/persistent-mode.mjs`; legacy `scripts/persistent-mode.cjs` dual-surface kept |
| review-gate, risk-assess, verify-deliverables | 🟡 file ported |
| workflow-drift-guard | 🟡 file ported |
| setup-init, setup-maintenance | 🟡 file ported |
| cleanup-orphans, session-summary, status | 🟡 file ported |
| post-tool-rules-injector | 🟡 file ported |
| named autopilot + flock / macOS lock | 🟡 | **Linux full gate** for named workflows; macOS soft skip; mode-state emergency journal green on macOS (`5ee02cf`) |
| persistent-mode Stop hook | ✅ | registered in `hooks/hooks.json` (timeout 10) |
| SessionEnd primary timeout | ✅ | `session-end.mjs` timeout ≥30s |
| Windows find-node → run.cjs patch | 🟡 | rewrites **find-node.sh** launchers only; bash `.sh` SessionStart wrappers remain intentional |

## D. Team / HUD

| Surface | Status |
|---------|--------|
| live tmux multi-provider | 🟡 | **works when tmux present** (`dry_run:false`); default dry-run without tmux |
| autopilot `execution` solo/team | ✅ | config documented README + settings-schema |
| heartbeat / orphan cleanup | 🟡 | TS present; cleanup script ported |
| HUD statusline + presets | 🟡 | watch + basic; presets partial |
| omgHud presets (minimal/focused/full) | 🟡 | in `src/hud` |

## E. Features / modes

| Surface | Status |
|---------|--------|
| ultragoal engine | 🟡 TS + skill |
| autoresearch loop | 🟡 TS + skill |
| ralphthon / planning consensus | 🟡 TS + skill |
| verification gates | 🟡 TS |
| notifications config | 🟡 TS + skill |
| openclaw | N/A / 🟡 code present |
| company-context MCP | 🟡 types in config |
| skillify/learner engine | 🟡 hooks + skill |
| deepinit / wiki engine | 🟡 hooks + skill |

## F. Repo / quality / packaging

| Surface | Status |
|---------|--------|
| benchmarks/missions/geobench | ✅ trees ported |
| examples/seminar/research/shellmark | ✅ ported |
| eslint/prettier/vitest | 🟡 core **217 green**; full suite residual **~119** fails (OMC lag + intentional platform partials — see `parity-review/VITEST-RESIDUAL-2026-07-25.md`) |
| CI workflows | ✅ `ci.yml` OMG smoke+core vitest+bridge+`plugin:shipping:verify`; release guarded |
| plugin shipping verify | ✅ `npm run plugin:shipping:verify` + doctor step; root `plugin.json`; coordinator optional |
| tmux live team | ✅ tmux installed; `dry_run: false` create/shutdown smoke + test-team live path |
| i18n READMEs | ✅ all README.*.md |
| CONTRIBUTING, SECURITY | ✅ ported/adapted |
| OMC `docs/**` product tree | ✅ bulk-ported via `scripts/port-omc-docs.mjs` |
| OMC `scripts/**` / `commands/**` | ✅ bulk-ported (2026-07-24 gap pass) |
| plugin shipping verify | 🟡 script present (`plugin-shipping-surface.mjs`) |
| MIT NOTICE | ✅ |

## Stub ratio (public)

| Kind | Paths |
|------|--------|
| Intentional shims | `src/shims/claude-agent-sdk.ts`, `src/shims/better-sqlite3.ts`, `src/shims/ast-grep.ts` |
| Ambient types | `src/types/ast-grep-napi.d.ts` |
| Host adapters | `src/adapters/grok/**` |
| Estimated stub share of production TS | **&lt; 2%** of ~539 files |

## How to refresh

```bash
node scripts/port-inventory.mjs
npm run build && npm test
```

### MCP on Grok (2026-07-25)

- Protocol: standard MCP stdio (**not Claude-specific**).
- Default server id: `omg-tools` via `mcp/run-tools-server.mjs`.
- Probe: `npm run mcp:probe` (expects ~54 tools when bridge built).
- Thin `mcp/omg-state-server.mjs` remains as manual fallback (state tools only).


### Residual close (Ralph 2026-07-25)

- Docs aligned: README/CONTRIBUTING/bridge → **omg-tools** default
- Path stubs: `docs/CLAUDE.md`, `.claude-plugin/plugin.json`
- Agents: **visual-designer** registered (20)
- Tests: AskUserQuestion→ask_user_question, Skill("oh-my-grok:x")→skill("/x") batch
- tsx installed; mcp server meta name omg-tools
- Full vitest still not 100% (workflow-profile/Linux flock clusters remain)
