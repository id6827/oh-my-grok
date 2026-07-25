# OMC Port Status

**Source pin:** OMC `4.15.7` @ `41a4c0f77144c5beb5f5f000a89cff379c680606` — see `docs/OMC-SOURCE.md` (upgrade checkpoint)  
**OMG version:** `0.9.0-rc.1`  
**Last updated:** 2026-07-26 (full vitest residual **0 fail / 11225 pass**; product gate remains core+smoke; bridge default builds coordinator/team-bridge/skill-bridge)  
**Legend:** ✅ ported (build-green, usable) · 🟡 partial / intentional reduce · ❌ missing · N/A documented

**Module coverage** (touched = ported+partial): run `node scripts/port-inventory.mjs`  
**Do not merge** with checklist similarity scores (`docs/SIMILARITY.md`).  
**Residual tracker:** `parity-review/VITEST-RESIDUAL-2026-07-25.md` · plan: `.omg/plans/ralplan-omc-omg-parity-gap-2026-07-25.md`

---

## Snapshot

| Metric | Value |
|--------|------:|
| OMC `src/**/*.ts` | ~1155–1176 |
| OMG `src/**/*.ts` (incl. tests) | **~1165** |
| `dist/**/*.js` after build | production tsc (tests excluded) |
| Top-level modules touched | ~100% files present |
| Full vitest residual | **0 fail / 11225 pass** (wave 5) |
| Core / smoke | **217/217** · **green** |
| Stub/shim modules | `src/shims/*`, `src/adapters/grok/*`, `@ast-grep/napi` ambient types |
| Gap review artifact | `.omg/artifacts/code-review/omc-port-gap-2026-07-24.md` |

---

## A. Runtime / core (`src/**`)

| OMC path | OMG path | Status | Notes |
|----------|----------|--------|-------|
| `src/**` (~1155 ts) | `src/` | ✅ | ~1165 files incl. tests; tsc excludes tests |
| dist build pipeline | `tsc` + `build:bridge` | ✅ | esbuild wired; cjs gitignored |
| bin omc aliases | `bin/omg.js` + package.bin `omg`/`omc`/`oh-my-grok` | ✅ | |
| better-sqlite3 | optionalDep + shim + job-state-db dynamic import | 🟡 | intentional optional native |
| `src/types`…`src/openclaw` (all modules) | `src/*` | ✅ | production + tests present |
| `src/__tests__` | `src/__tests__` | ✅ | full suite green (2026-07-25 wave 5) |
| `src/adapters/grok` | OMG-only | ✅ | models, tools, plugin-root |
| `src/shims` | OMG-only | ✅ | claude-agent-sdk, better-sqlite3 |

## B. Bridge / MCP / CLI

| Surface | Status | Notes |
|---------|--------|-------|
| bridge/mcp-server full tools | ✅ | **Grok default:** `.mcp.json` → `mcp/run-tools-server.mjs` → `bridge/mcp-server.cjs` (~54 tools) |
| bridge/team-mcp, team.js, runtime-cli, cli | ✅ | default `npm run build:bridge` |
| bridge/team-bridge.cjs | ✅ | built by default `build:bridge` (OMC-compat standalone); product team path remains TS + `bin/omg.js` |
| claude-md-coordinator.cjs | ✅ | default `build:bridge`; gitignored; release-boundary requires it in pack |
| dist/hooks/skill-bridge.cjs | ✅ | default `build:bridge` |
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
| permission-handler | ✅ registered (PermissionRequest) |
| project-memory-* | ✅ registered (SessionStart / PostToolUse / PreCompact) |
| wiki-session-* | ✅ registered (SessionStart/End / PreCompact) |
| context-guard-stop | ✅ registered (Stop) |
| context-safety | 🟡 | compat helper; not a standalone hooks.json entry |
| persistent-mode | ✅ | product Stop: `hooks/scripts/persistent-mode.mjs` |
| review-gate, verify-deliverables | ✅ registered (Stop); risk-assess is helper |
| workflow-drift-guard | 🟡 | file present, **not** registered (intentional omit until OMC event map proven) |
| setup-init, setup-maintenance | ✅ registered (SessionStart matchers) |
| cleanup-orphans | ✅ registered (SessionEnd) |
| session-summary / status | 🟡 | CLI/HUD spawn, not hooks.json |
| post-tool-rules-injector | ✅ registered (PostToolUse) |
| named autopilot + flock / macOS lock | 🟡 | **Linux full gate**; macOS soft skip (host N/A) |
| SessionEnd primary timeout | ✅ | `session-end.mjs` timeout ≥30s |
| Windows find-node → run.cjs patch | 🟡 | rewrites **find-node.sh** launchers only |

See also `docs/HOOKS-PARITY.md`.

## D. Team / HUD

| Surface | Status |
|---------|--------|
| live tmux multi-provider | ✅ | works when tmux present (`dry_run:false`); smoke covers live path |
| autopilot `execution` solo/team | ✅ | config documented README + settings-schema |
| heartbeat / orphan cleanup | 🟡 | TS present; cleanup registered on SessionEnd |
| HUD statusline + presets | 🟡 | watch + basic; presets in `src/hud` |

## E. Features / modes

| Surface | Status |
|---------|--------|
| ultragoal / autoresearch / ralph / ralplan / ultraqa | 🟡 | TS + skills + persistent-mode; Grok product surface = skill+hooks (not OMC host UI) |
| verification gates | 🟡 | TS |
| notifications config | 🟡 | TS + skill |
| openclaw | N/A / 🟡 | code present |
| skillify/learner engine | 🟡 | skill + simplified injector; full skill-bridge built for installer |
| deepinit / wiki engine | ✅ | hooks registered + skills |

## F. Repo / quality / packaging

| Surface | Status |
|---------|--------|
| benchmarks/missions/geobench | ✅ trees ported |
| examples/seminar/research/shellmark | ✅ ported |
| eslint/prettier/vitest | ✅ core **217**; full suite **0 residual fails** |
| CI workflows | ✅ smoke+core+bridge+`plugin:shipping:verify` |
| plugin shipping verify | ✅ coordinator handshake when built; skip if absent on clean tsc-only trees |
| tmux live team | ✅ smoke + live create/shutdown |
| i18n READMEs | ✅ |
| CONTRIBUTING, SECURITY | ✅ |
| MIT NOTICE | ✅ |

## Stub ratio (public)

| Kind | Paths |
|------|--------|
| Intentional shims | `src/shims/claude-agent-sdk.ts`, `src/shims/better-sqlite3.ts`, `src/shims/ast-grep.ts` |
| Ambient types | `src/types/ast-grep-napi.d.ts` |
| Host adapters | `src/adapters/grok/**` |
| Estimated stub share of production TS | **&lt; 2%** of production files |

## How to refresh

```bash
node scripts/port-inventory.mjs
npm run build && npm test
npm run test:vitest:core
npm run build:bridge
npm run plugin:shipping:verify
```
