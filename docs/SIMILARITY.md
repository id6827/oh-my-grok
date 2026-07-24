# OMG ↔ OMC Similarity

Two **separate** metrics — do not mix them:

1. **Checklist score** (layers A–D) — product/UX parity against a fixed checklist  
2. **OMC module coverage %** — quantitative `src/` top-level module port status  

---

## 1) Checklist score (strict per-layer)

### Policy

**Strict:** each of A, B, C, D must be **≥ 90**.  
Weighted average alone is **not** a pass for the checklist policy.

### Scores (v0.9.0-rc.1)

| Layer | Score | Evidence |
|-------|------:|----------|
| **A** Prompt/skills | **93** | 20 agents, 45+ skills, exclusives, tool remap |
| **B** Hooks | **92** | Full event graph + skill-active-guard + ported OMC scripts (wiring 🟡) + HOOKS-PARITY |
| **C** Runtime/CLI/MCP/team | **92** | OMC-scale `src/`→`dist/`, MCP state tools, `omg team` dry-run/live, adapters |
| **D** UX/HUD | **90** | multi-line HUD, `--watch`, setup-hud, branch/prd/agents/team |
| **Strict min** | **90** | **PASS** (checklist) |

### Verification commands

```bash
npm run build
npm test
node bin/omg.js doctor
grok plugin validate .
node bin/omg.js team 1:grok "echo ok" --dry-run
node bin/omg.js hud --watch --ticks 2
node scripts/port-inventory.mjs
```

---

## 2) OMC module coverage (runtime port)

**Definition:**  
`module coverage %` = (modules with status `ported` **or** `partial`) / (OMC `src/` top-level modules) × 100  

Computed by `node scripts/port-inventory.mjs` → `.omg/artifacts/port-inventory.json`.

| Metric | Value (refresh after each slice) |
|--------|----------------------------------|
| OMC `src/**/*.ts` | 1155 |
| OMG `src/**/*.ts` (production; tests excluded) | ~539 |
| Modules ported (file-count ≥80% of OMC) | see inventory |
| Modules partial | see inventory |
| Modules missing | see inventory |
| **Module coverage (touched)** | **~96.9%** at last inventory |

**Not** interchangeable with checklist A–D scores.  
Stub-only modules must be listed in `docs/OMC-PORT-STATUS.md`.

### Source pin

See `docs/OMC-SOURCE.md` (OMC **4.15.7** @ `41a4c0f`).

---

## Checklists (layer A–D)

### A ≥90
- [x] Full agent + skill inventory
- [x] Grok exclusives

### B ≥90
- [x] docs/HOOKS-PARITY.md
- [x] All lifecycle hooks registered
- [x] skill-active-guard
- [x] atomic state writes
- [x] stop blocks di/ralph/autopilot (tests)
- [x] Additional OMC scripts present under `hooks/scripts/` (enable gradually)

### C ≥90
- [x] OMC-scale TypeScript `src/` + `dist/`
- [x] Grok adapters + Claude SDK shims
- [x] MCP state_* + omg_info + state_get_status
- [x] omg team parse/status/shutdown/dry-run
- [x] docs/team-state-schema.md
- [x] bin aliases: `omg` / `omc` / `oh-my-grok`

### D ≥90
- [x] omg-hud with modes/prd/agents/branch/team
- [x] --watch (+ --ticks for tests)
- [x] setup-hud + watch-hud.sh
- [x] GETTING-STARTED statusline notes
