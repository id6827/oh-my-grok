# OMC ↔ OMG Parity Matrix

OMC **4.15.7** · OMG **0.6.0**

## Strict similarity policy

**Each layer A/B/C/D must be ≥80.** Weighted average alone is insufficient.
See [SIMILARITY.md](./SIMILARITY.md).

| Layer | Score | Status |
|-------|------:|--------|
| A Prompt/skills | 92 | ✅ |
| B Hooks | 84 | ✅ |
| C Runtime/MCP/CLI | 82 | ✅ |
| D UX/HUD | 81 | ✅ |
| **Strict (min)** | **81** | **PASS** |

## Feature matrix (summary)

| Feature | OMC | OMG 0.6 |
|---------|-----|---------|
| Agents / skills core | ✅ | ✅ |
| Keyword modes | ✅ | 🟡 25 rules |
| Hook lifecycle graph | ✅ full | 🟡 complete events, simpler scripts |
| MCP state_* | ✅ | ✅ 6 tools |
| CLI | ✅ omc | 🟡 omg thin+state+hud |
| HUD | ✅ | 🟡 file + omg-hud.mjs |
| Team tmux multi-CLI | ✅ | ❌ (team-help + worktree only) |
| UI mockup / web research | ❌ | ⭐ |

## Remaining to 90+ strict

- Port more OMC hook behaviors (delegation enforcer depth)
- Real tmux multi-provider workers
- Live statusline integration in Grok TUI if/when API exists
