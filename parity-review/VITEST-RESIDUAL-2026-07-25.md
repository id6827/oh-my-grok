# Full vitest residual tracker (2026-07-25)

## Trajectory

| Metric | Value | Source |
|--------|------:|--------|
| Parity review baseline | ~721 fail / ~10783 pass | REPORT-2026-07-25 |
| After residual `d159cf7` | **248 fail / 11000 pass** | JSON reporter |
| After doctor corpus `5dd46b0` | **178 fail / 11065 pass** | `/tmp/vitest-after-doctor.log` |
| Core gate | **217/217 green** | `npm run test:vitest:core` |
| Three-axis | **green on macOS** | `5ee02cf` |

**Cluster close (this session, post-doctor remeasure):**

| Cluster | Fix | Est. fails closed |
|---------|-----|------------------:|
| `generated-artifact-authorization` | recompute delta sha256 (`094b6aa`) | 15 |
| `state-root.cjs` + `persistent-mode.cjs` brand | `.omg` + `GROK_PLUGIN_ROOT` + cancel path | 10 |
| `planning/artifacts` launch hints | `om[cgx]` regex (was omc/omx only) | 8 |
| `cli/launch` dual-read | GROK+CLAUDE forward; default ~/.grok | 8 |
| `cli/team` spy pollution | `vi.restoreAllMocks` in afterEach (+ hint fix) | 15 |

Targeted re-run after these fixes: **345/345** green on the five files above. Full suite remeasure pending.

## Intentional 🟡 (do not “fix” by deleting tests)

| Surface | Why intentional | User impact |
|---------|-----------------|-------------|
| Named workflow full gate Linux-only | `/proc` + system flock | Use legacy autopilot on macOS; Ubuntu CI owns full axis |
| Windows patch ≠ rewrite bash `.sh` hooks | dual bash/node entrypoints | Windows still needs bash or later `.sh` → `.mjs` port |
| HUD presets partial | host UI differences | Basic HUD works (`omg hud`) |
| Full vitest 100% | large OMC suite lag | **Product gate = core + smoke**, not full suite |
| bridge/*.cjs not always committed | multi-MB build artifact | `npm run build:bridge` or dist fallback |
| better-sqlite3 optional | optionalDep + shim | advanced wiki/db features |
| scripts/persistent-mode.cjs vs hooks mjs | product Stop uses `hooks/scripts/persistent-mode.mjs` | cjs kept for legacy tests / dual surface |

## Next actions

1. Full `npx vitest run --exclude tests/perf/**` remeasure after this commit  
2. Attack next largest remaining clusters from remeasure  
3. Keep smoke + vitest:core green always  
