# Full vitest residual tracker (2026-07-25)

## Trajectory

| Metric | Value | Source |
|--------|------:|--------|
| Parity review baseline | ~721 fail / ~10783 pass | REPORT-2026-07-25 |
| After residual `d159cf7` | **248 fail / 11000 pass** | JSON reporter |
| After doctor corpus `5dd46b0` | **178 fail / 11065 pass** | `/tmp/vitest-after-doctor.log` |
| After cluster close `f4d28b1` | **119 fail / 11124 pass** | `/tmp/vitest-after-clusters.log` |
| After residual-2 `26e34dc` | **77 fail / 11160 pass** | `/tmp/vitest-after-residual2.log` |
| Core gate | **217/217 green** | `npm run test:vitest:core` |
| Three-axis | **green on macOS** | `5ee02cf` |

**Delta from parity baseline:** roughly **−640 failures**.

### Cluster close (`f4d28b1` → `26e34dc`)

| Cluster | Fix |
|---------|-----|
| `run-cjs-graceful-fallback` | `GROK_PLUGIN_ROOT` dual-read; Worker diagnostic once |
| `session-start-template` | dual-read config/state-root; OMG update/AGENTS compact |
| `plugin-shipping-surface` | realpath-safe local import resolution (macOS `/var`) |
| `psm-tmux-naming` | `psm_omg_*` brand in tests + SKILL |
| `setup-claude-md` #3476 | soft-skip when bridge coordinator untracked |
| UserPromptSubmit outer fuse | keyword/skill host timeout 30s |

### Top remaining (post-`26e34dc`)

| ~Fails | File | Likely cause |
|-------:|------|----------------|
| 6 | `runtime-owner-client.test.ts` | owner epoch / reclaim |
| 5 | `setup-contracts-regression.test.ts` | hooks / packaging |
| 4 | `plugin-setup-deps.test.ts` | deps / coordinator optional |
| 4 | `session-start-script-context.test.ts` | script path dual-read lag |
| 3 | docs/lint/hooks portability clusters | brand / Windows hide |
| … | `session-isolation` | `/proc` Linux-only on macOS |

## Intentional 🟡

| Surface | Why intentional |
|---------|-----------------|
| Named workflow full gate Linux-only | `/proc` + flock |
| Windows find-node patch scope | dual bash/node entrypoints |
| bridge/*.cjs not committed | multi-MB artifact; `build:bridge` |
| coordinator optional | `build:bridge:extra` |
| Full vitest 100% | product gate = core + smoke |

## Product gates

```bash
npm run test:vitest:core   # 217
npm run test:smoke
npm run mcp:probe
```
