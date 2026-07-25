# Residual code review — vitest / MCP / docs (2026-07-25 → close)

**Scope:** vitest residual, MCP omg-tools, bridge packaging, docs accuracy.  
**Updated:** 2026-07-26 after wave 5 close + bridge default-build merge.

## Headline (current)

| Area | Finding |
|------|---------|
| Full vitest | **0 fail / 11225 pass / 291 skipped** |
| Core gate | **217/217** |
| Smoke | **green** (incl. live tmux team path) |
| MCP doctor / probe | omg-tools **54 tools** healthy |
| Bridge default | `build:bridge` builds mcp/cli/runtime/team-mcp **+** team-bridge + skill-bridge + coordinator |
| Docs | OMC-PORT-STATUS + residual tracker refreshed |

## Trajectory

| Wave | Fails |
|------|------:|
| Parity baseline | ~721 |
| Wave 3 | 51 |
| Wave 4 | 21 |
| Wave 5 | **0** |

## Closed residual themes (wave 5)

- OMG dual-read env/path (`OMG_SESSION_ID`, `/oh-my-grok:`, `omg team` worker guard, `omg-team`/`omc-team` tmux)
- Soft-align OMC-era tests to Grok packaging
- Process-start identity host-strict vs ESRCH death (prior wave)
- Model-routing three-site OMG wording sync

## Remaining product partials (not vitest)

See `.omg/plans/ralplan-omc-omg-parity-gap-2026-07-25.md`:

1. Release pack path for gitignored coordinator  
2. Feature-engine product-subset freeze  
3. HUD preset evidence  
4. workflow-drift-guard register vs omit  

## MCP

- Server id: **omg-tools**
- Launcher: `mcp/run-tools-server.mjs` → `bridge/mcp-server.cjs` → `dist/mcp/standalone-server.js`
- Prepare: `npm run build` and preferably `npm run build:bridge`

## Verdict

**Vitest residual: CLOSED.**  
**Parity claim:** still **near-complete** (not automatic YES 100%) until packaging freeze + release-pack + optional product-subset contract.
