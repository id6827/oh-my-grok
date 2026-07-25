# Ralplan — OMC ↔ OMG parity gap close (2026-07-25 → 2026-07-26)

**Status:** **closed for progressable residual** (product-subset freeze published)  
**Sources:** `parity-review/REPORT-2026-07-25.md`, `parity-review/VITEST-RESIDUAL-2026-07-25.md`, `docs/OMC-PORT-STATUS.md`, `docs/GROK-PRODUCT-SUBSET.md`  
**Pin:** OMC 4.15.7 @ `41a4c0f` · OMG `0.9.0-rc.1`

---

## Goal

Move from **NO — near-complete** toward an accurate product-parity claim:

1. Full vitest residual green **or** accurately classified ✅  
2. Stale residual docs eliminated ✅  
3. Bridge/coordinator packaging policy explicit ✅  
4. Remaining 🟡 either promoted with evidence or frozen as Grok product subset ✅  

---

## Done

| Item | Evidence |
|------|----------|
| Full vitest residual **0 fail / 11225 pass** | Wave 5 `d4b0211` |
| Core 217 + smoke green | product gates |
| MCP 54 tools | `mcp:probe` |
| Default `build:bridge` includes team-bridge + skill-bridge + coordinator | `package.json` |
| Release pack injects gitignored bridge entrypoints | `release.yml` |
| PORT-STATUS + residual docs accurate | packaging wave |
| **Grok product subset freeze** | `docs/GROK-PRODUCT-SUBSET.md` |
| **workflow-drift-guard** registered on Stop | `hooks/hooks.json` timeout 3 |
| **HUD presets** promoted ✅ | unit tests + applyPreset evidence |
| **Named workflow flock** frozen host N/A | subset §C + ADR |
| **skill-injector dual-path** frozen | Grok simplified vs skill-bridge OMC path |

---

## Remaining (optional / out of gate)

| # | Work | Notes |
|---|------|-------|
| Z1 | `omg hud --preset` CLI convenience | not required by subset freeze |
| Z2 | Wire Grok UserPromptSubmit to full skill-bridge | product decision only (subset says no) |
| Z3 | Claim YES 100% OMC host clone | not a goal of this freeze |

---

## Acceptance

- [x] Vitest residual 0 fail  
- [x] OMC-PORT-STATUS matches suite + subset  
- [x] Bridge default build + release pack path  
- [x] Product subset freeze published  
- [x] workflow-drift-guard registered  

## Commands

```bash
npm run test:vitest:core
npm run test:smoke
npm run build:bridge
npm run plugin:shipping:verify
npm run mcp:probe
npx vitest run src/hooks/__tests__/workflow-drift-guard-script.test.ts src/__tests__/hud/defaults.test.ts
```
