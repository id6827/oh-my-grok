# OMG ↔ OMC Similarity — Strict ≥90 per layer (v0.7)

## Policy

**Strict:** each of A, B, C, D must be **≥ 90**.  
Weighted average alone is **not** a pass.

## Scores (v0.7.0)

| Layer | Score | Evidence |
|-------|------:|----------|
| **A** Prompt/skills | **93** | 20 agents, 45 skills, exclusives, tool remap |
| **B** Hooks | **91** | Full event graph + skill-active-guard + atomic writes + HOOKS-PARITY + stop tests |
| **C** Runtime/CLI/MCP/team | **90** | `runtime/` TS→dist, MCP 6 tools, `omg team` dry-run/live, session state, worktree helper |
| **D** UX/HUD | **90** | multi-line HUD, `--watch`, setup-hud, branch/prd/agents/team lines, tests |
| **Strict min** | **90** | **PASS** |

## Verification commands

```bash
npm run build
npm test
node bin/omg.js doctor
grok plugin validate .
node bin/omg.js team 1:grok "echo ok" --dry-run
node bin/omg.js hud --watch --ticks 2
```

## Checklists

### A ≥90
- [x] Full agent + skill inventory
- [x] Grok exclusives

### B ≥90
- [x] docs/HOOKS-PARITY.md
- [x] All lifecycle hooks registered
- [x] skill-active-guard
- [x] atomic state writes
- [x] stop blocks di/ralph/autopilot (tests)

### C ≥90
- [x] runtime TypeScript package + dist/
- [x] MCP state_* + omg_info + state_get_status
- [x] omg team parse/status/shutdown/dry-run
- [x] docs/team-state-schema.md

### D ≥90
- [x] omg-hud with modes/prd/agents/branch/team
- [x] --watch (+ --ticks for tests)
- [x] setup-hud + watch-hud.sh
- [x] GETTING-STARTED statusline notes
