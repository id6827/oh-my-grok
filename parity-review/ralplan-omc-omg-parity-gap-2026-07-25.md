# Ralplan — OMC ↔ OMG parity gap close (2026-07-25 → 2026-07-26)

**Status:** in progress (vitest residual closed; packaging/docs wave active)  
**Sources:** `parity-review/REPORT-2026-07-25.md`, `parity-review/VITEST-RESIDUAL-2026-07-25.md`, `docs/OMC-PORT-STATUS.md`  
**Pin:** OMC 4.15.7 @ `41a4c0f` · OMG `0.9.0-rc.1`

---

## Goal

Move from **NO — near-complete** toward an accurate product-parity claim:

1. Full vitest residual green **or** accurately classified  
2. Stale residual docs eliminated  
3. Bridge/coordinator packaging policy explicit  
4. Remaining 🟡 either promoted with evidence or frozen as Grok product subset

---

## Done

| Item | Evidence |
|------|----------|
| Full vitest residual **0 fail / 11225 pass** | Wave 5 `d4b0211`; `parity-review/VITEST-RESIDUAL-2026-07-25.md` |
| Core 217 + smoke green | product gates |
| MCP 54 tools | `mcp:probe` |
| Live tmux team | smoke + prior live checklist |
| Wave 5 production dual-reads | omg team guard, OMG_SESSION_ID, keyword `/oh-my-grok:`, tmux prefixes |
| Default `build:bridge` includes team-bridge + skill-bridge + coordinator | `package.json` (this wave) |
| PORT-STATUS + HOOKS registration accuracy | this wave |

---

## In this wave (progressable)

| # | Work | Status |
|---|------|--------|
| 1 | Merge `build:bridge:extra` into default `build:bridge` | ✅ |
| 2 | CI assert new bridge artifacts | ✅ |
| 3 | Refresh `docs/OMC-PORT-STATUS.md` residual + hooks registration | ✅ |
| 4 | Refresh residual code-review artifact | ✅ |
| 5 | REPORT addendum: vitest axis ✅ | ✅ |
| 6 | Keep shipping coordinator optional-when-absent (clean CI) | ✅ keep |
| 7 | Release.yml: `build:bridge` + inject gitignored bridge into stage pack | ✅ |

---

## Remaining (next; not blocking product gates)

| # | Work | Priority | Notes |
|---|------|----------|-------|
| A | ~~Release pack build:bridge~~ | done | release.yml injects REQUIRED_ENTRYPOINTS |
| B | Decide Grok product subset freeze for feature engines (ultragoal/autoresearch/…) | P2 | TS+skill may be enough for “Grok product done” |
| C | HUD preset smoke + promote or freeze 🟡 | P2 | |
| D | `workflow-drift-guard` register vs intentional omit | P3 | file present, not in hooks.json |
| E | skill-injector → skill-bridge wiring if full learner product needed | P3 | Grok injector is simplified |
| F | named workflow flock — freeze host N/A (Linux full) | P3 | already intentional |

---

## Explicit non-goals this wave

- Bulk OMC re-port  
- Score inflation of SIMILARITY checklist  
- Committing multi-MB `bridge/*.cjs`  
- Claiming YES 100% without release-pack + product-subset freeze

---

## Acceptance for “docs accurate near-complete”

- [x] Vitest residual tracker shows 0 fail  
- [x] OMC-PORT-STATUS residual number matches suite  
- [x] Bridge default build produces coordinator + team-bridge + skill-bridge  
- [ ] Release pipeline packs coordinator (follow-up)  
- [ ] Product subset freeze published (follow-up)

## Commands

```bash
npm run test:vitest:core
npm run test:smoke
npm run build:bridge
npm run plugin:shipping:verify
npm run mcp:probe
```
