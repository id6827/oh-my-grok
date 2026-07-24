# OMC Port Status

**Source pin:** OMC `4.15.7` @ `41a4c0f` — see `docs/OMC-SOURCE.md`  
**OMG version:** `0.9.0-rc.1`  
**Last updated:** 2026-07-24  
**Legend:** ✅ ported (build-green, usable) · 🟡 partial / intentional reduce · ❌ missing · N/A documented

**Module coverage** (touched = ported+partial): run `node scripts/port-inventory.mjs`  
**Do not merge** with checklist similarity scores (`docs/SIMILARITY.md`).

---

## Snapshot

| Metric | Value |
|--------|------:|
| OMC `src/**/*.ts` | 1155 |
| OMG `src/**/*.ts` (tests pruned from tree) | ~539 |
| `dist/**/*.js` after build | ~547 |
| Top-level modules touched | ~96.9% |
| Stub/shim modules | `src/shims/*`, `src/adapters/grok/*`, `@ast-grep/napi` ambient types |

---

## A. Runtime / core (`src/**`)

| OMC path | OMG path | Status | Notes |
|----------|----------|--------|-------|
| `src/**` (~1155 ts) | `src/` | 🟡 | Bulk port + Grok transform; tests excluded from tree for green tsc |
| dist build pipeline | `tsc` → `dist/` + runtime compat | 🟡 | esbuild bridge bundles not yet fully ported |
| bin omc aliases | `bin/omg.js` + package.bin `omg`/`omc`/`oh-my-grok` | ✅ | |
| better-sqlite3 | optionalDep + shim + job-state-db dynamic import | 🟡 | |
| `src/types` | `src/types` | ✅ | + ambient d.ts |
| `src/constants` | `src/constants` | ✅ | |
| `src/utils` | `src/utils` | ✅ | |
| `src/lib` | `src/lib` | ✅ | + OMG `mode-state.ts` |
| `src/shared` | `src/shared` | ✅ | |
| `src/config` | `src/config` | ✅ | |
| `src/platform` | `src/platform` | ✅ | |
| `src/hooks` | `src/hooks` + `hooks/scripts` | 🟡 | TS body ported; mjs wrappers active |
| `src/features` | `src/features` | ✅ | build-green |
| `src/mcp` | `src/mcp` + `mcp/omg-state-server.mjs` | 🟡 | dual surface |
| `src/team` | `src/team` + `team/plan.ts` | 🟡 | full TS + dry-run plan helper |
| `src/hud` | `src/hud` + `scripts/hud` | 🟡 | |
| `src/cli` | `src/cli` + `bin/omg.js` | 🟡 | |
| `src/commands` | `src/commands` + `commands/` | 🟡 | |
| `src/skills` / `src/agents` | loaders + dirs | 🟡 | content in `agents/` `skills/` |
| `src/ralphthon` | `src/ralphthon` | 🟡 | + skill |
| `src/ultragoal` | `src/ultragoal` | 🟡 | + skill |
| `src/planning` | `src/planning` | ✅ | |
| `src/verification` | `src/verification` | ✅ | |
| `src/goal-workflows` | `src/goal-workflows` | ✅ | |
| `src/autoresearch` | `src/autoresearch` | 🟡 | + skill |
| `src/providers` | `src/providers` | ✅ | |
| `src/interop` | `src/interop` | ✅ | |
| `src/tools` | `src/tools` | 🟡 | AST needs optional @ast-grep/napi |
| `src/notifications` | `src/notifications` | 🟡 | |
| `src/installer` | `src/installer` | 🟡 | + omg-setup skill |
| `src/openclaw` | `src/openclaw` | N/A/🟡 | ported code; product N/A → webhook/docs |
| `src/__tests__` | re-port later | 🟡 | OMC tests not in tree yet; mjs smokes green |
| `src/adapters/grok` | OMG-only | ✅ | models, tools, plugin-root |
| `src/shims` | OMG-only | ✅ | claude-agent-sdk, better-sqlite3 |

## B. Bridge / MCP / CLI

| Surface | Status | Notes |
|---------|--------|-------|
| bridge/mcp-server full tools | 🟡 | `src/mcp` + mjs state server; esbuild bundle TBD |
| bridge/team-bridge, team-mcp, team.js | 🟡 | TS under `src/team` |
| bridge/runtime-cli, cli | 🟡 | `src/cli` + `bin/omg.js` |
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
| benchmarks/missions/geobench | 🟡 minimal benchmarks README |
| examples/seminar | ❌ |
| eslint/prettier/vitest | 🟡 tsc + mjs tests; vitest later |
| CI workflows | ❌ |
| i18n READMEs | 🟡 README.ko.md |
| CONTRIBUTING, SECURITY | ✅ ported/adapted |
| plugin shipping verify | ❌ |
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
