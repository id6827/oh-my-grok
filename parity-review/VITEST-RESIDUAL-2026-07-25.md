# Full vitest residual tracker (2026-07-25)

## Trajectory

| Metric | Value | Source |
|--------|------:|--------|
| Parity review baseline | ~721 fail | REPORT |
| After cluster wave 1 | **119 fail** | post-doctor + dual-read |
| After wave 2 `26e34dc` | **77 fail / 11160 pass** | run.cjs / shipping / PSM |
| After wave 3 `49ebf5a` | **51 fail / 11186 pass** | owner identity / hooks dual-read / contracts |
| Core gate | **217/217** | `npm run test:vitest:core` |
| Smoke | **green** | `npm run test:smoke` |

**Delta from parity baseline:** roughly **−670 failures**.

### Wave 3 closed (`49ebf5a`)

| Cluster | Fix |
|---------|-----|
| `runtime-owner-client` | accept cross-platform process-start identity prefixes |
| `setup-contracts` | dual-read GROK_PLUGIN_ROOT; SessionEnd async + hooks/scripts path |
| `hook-command-portability` | portable `${GROK_CONFIG_DIR:-${CLAUDE_CONFIG_DIR:-$HOME/.grok}}` |
| `session-start-script-context` | fixtures under `~/.grok` dual-read |
| `session-isolation` | macOS lock owner via `ps lstart` hash (not `/proc`) |
| `windows-hide` | production manifest includes `hooks/scripts` + `scripts` |
| `plugin-setup-deps` | Grok wording; pass-through dual-read hooks |

### Top remaining (~51)

| ~Fails | Area |
|-------:|------|
| 3 | claude-goal-adapter-doc, workflow-drift-guard, autopilot cancel |
| 2 | hooks-command-escaping, manual-compact, npm-package-hook-surface, plugin-skill-budget, release-guidance, tier0-docs, subagent-lock, hook-templates, state-tools |
| … | smaller one-off brand/docs lag |

## Product gates (ship bar)

```bash
npm run test:vitest:core   # 217
npm run test:smoke
npm run mcp:probe
```

Full vitest residual is **not** the ship bar (intentional platform 🟡 + OMC lag).
