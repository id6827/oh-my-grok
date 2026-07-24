# OMC Port Status

**Source pin:** OMC `4.15.7` @ `41a4c0f` — see `docs/OMC-SOURCE.md`  
**OMG version:** `0.9.0-rc.1`  
**Last updated:** 2026-07-24 (residual close: build:bridge + vitest:core + CI)
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
| bridge/mcp-server full tools | 🟡 | **generate** via `npm run build:bridge` → gitignored `bridge/*.cjs`; plugin default remains `mcp/omg-state-server.mjs` |
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
| persistent-mode | 🟡 file ported |
| review-gate, risk-assess, verify-deliverables | 🟡 file ported |
| workflow-drift-guard | 🟡 file ported |
| setup-init, setup-maintenance | 🟡 file ported |
| cleanup-orphans, session-summary, status | 🟡 file ported |
| post-tool-rules-injector | 🟡 file ported |
| named autopilot + flock / macOS lock | 🟡 | skill + mode-state-io flock helpers |

## D. Team / HUD

| Surface | Status |
|---------|--------|
| live tmux multi-provider | 🟡 | dry-run default without tmux |
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
| eslint/prettier/vitest | 🟡 vitest installed; `test:vitest:core` **217 green**; broader suite residual (mode-state flock/linux) |
| CI workflows | ✅ `ci.yml` OMG smoke+core vitest+bridge job; release guarded |
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
