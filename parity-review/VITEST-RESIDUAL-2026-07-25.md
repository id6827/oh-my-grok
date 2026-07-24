# Full vitest residual tracker (2026-07-25)

## Baseline → after residual fix commit `d159cf7`

| Metric | Value | Source |
|--------|------:|--------|
| Prior full run | ~721 fail / ~10783 pass | parity REPORT |
| Residual review (earlier) | 628 fail / 10802 pass | residual-mcp-vitest artifact |
| **After d159cf7 (JSON reporter)** | **248 fail / 11000 pass** (11514 total) | `vitest --reporter=json` 2026-07-25 |
| Core gate | **217/217 green** | `npm run test:vitest:core` |
| Three-axis | **green on macOS** | `5ee02cf` |

**Delta:** roughly **−380 to −470 failures** from parity baseline after mode-state/workflow/installer + rename/hook fixes.

## Clusters (fix order)

1. **OMC→Grok contract lag** — mangled renames (`AskUserQuestion` mid-identifier), CLAUDE paths, agent counts  
   - Fixed: `recordMergeReadinessAskUserQuestionResult`; bulk notification renames; bridge dual-accept `ask_user_question`  
2. **Hook manifest contracts** — timeouts, registered hooks  
   - Fixed: SessionEnd primary **30s**; **persistent-mode** on Stop timeout 10  
   - Documented: Windows patch only find-node (test soft-aligned)  
3. **Workflow-profile Linux-only** — skipIf non-linux (done)  
4. **mode-state emergency journal macOS** — hex processStart (done)  
5. **Installer/shipping** — Grok packaging (mostly done)  

### Top remaining fail files (post-`d159cf7` inventory)

| ~Fails | File | Likely cause |
|-------:|------|----------------|
| 27 | `doctor-conflicts.test.ts` | legacy CLAUDE.md corpus / OMC→OMG guide classification |
| 16 | `generated-artifact-authorization.test.ts` | authorization digest/count closure drift |
| 16 | `cli/team.test.ts` | team api JSON envelope / flaky cwd |
| 15 | `npm-package-bin-surface.test.ts` | package.bin / ship surface expectations |
| 12 | `skills.test.ts` | skill catalog count/names |
| 11 | `persistent-mode/stop-hook-blocking.test.ts` | Stop hook ordering after persistent-mode insert |
| 9 | run-cjs / setup-claude-md / session-start-template / launch / planning | path & packaging lag |

6. **Remaining bulk** — openclaw, HUD, feature engines, tsx child spawns, etc.

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
