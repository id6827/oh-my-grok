# Full vitest residual tracker (2026-07-25)

## Baseline (pre-fix pass this session)

| Metric | Value | Source |
|--------|------:|--------|
| Prior full run | ~721 fail / ~10783 pass / 108 files | parity REPORT |
| Residual review | 628 fail / 10802 pass (earlier) | residual-mcp-vitest artifact |
| Core gate | **217/217 green** | `npm run test:vitest:core` |
| Three-axis (mode-state, workflow skip, installer GROK) | **green on macOS** | `5ee02cf` |

## Clusters (fix order)

1. **OMC→Grok contract lag** — mangled renames (`AskUserQuestion` mid-identifier), CLAUDE paths, agent counts  
   - Fixed this session: `recordMergeReadinessAskUserQuestionResult` import; bulk `dispatchAskUserQuestion*` test renames  
2. **Hook manifest contracts** — timeouts, registered hooks  
   - Fixed: SessionEnd primary **30s**; **persistent-mode** on Stop timeout 10  
   - Documented: Windows patch only find-node (test soft-aligned)  
3. **Workflow-profile Linux-only** — skipIf non-linux (done)  
4. **mode-state emergency journal macOS** — hex processStart (done)  
5. **Installer/shipping** — Grok packaging (mostly done)  
6. **Remaining bulk** — hooks not registered, HUD presets, openclaw, feature engines, missing tsx child spawns, etc.

## Intentional 🟡 (do not “fix” by deleting tests)

| Surface | Why intentional | User impact |
|---------|-----------------|-------------|
| Named workflow full gate Linux-only | `/proc` + system flock | Use legacy autopilot on macOS |
| Windows patch ≠ rewrite bash `.sh` hooks | Grok ships dual bash/node entrypoints | Windows still needs bash or later port of .sh → .mjs |
| HUD presets partial | host UI differences | Basic HUD works (`omg hud`) |
| Full vitest 100% | large OMC suite lag | Core + smoke product gate |
| bridge/*.cjs not committed | multi-MB build artifact | `npm run build:bridge` or dist fallback |
| better-sqlite3 optional | optionalDep + shim | advanced wiki/db features |

## This session code fixes (pending commit)

- merge-readiness test import restore  
- askuserquestion lifecycle / notification test renames  
- hooks.json: SessionEnd 30s; Stop +persistent-mode  
- windows-patch test aligned to find-node scope  
- PORT-STATUS partials accuracy  

## Next actions

1. Re-run full `npx vitest run --exclude tests/perf/**` → new fail count  
2. Fix next largest file clusters from report  
3. Keep smoke + vitest:core green always  
