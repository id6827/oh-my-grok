# OMC ↔ OMG Parity Matrix

OMC reference: **4.15.7**. OMG: **0.5.0**.

**Blended similarity (flow-weighted): ≥ 80%** — see [SIMILARITY.md](./SIMILARITY.md) for method and scores (A92 / B78 / C58 / D52 → **80.0**).

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Supported |
| 🟡 | Partial / simplified |
| ❌ | Deferred or N/A |
| ⭐ | Grok-only |

## Similarity snapshot

| Layer | Weight | Score | Notes |
|-------|-------:|------:|-------|
| Prompt / agents / skills | 50% | 92 | Full agent set + skills |
| Hooks / session hold | 25% | 78 | Full lifecycle set (v0.5) |
| Runtime / CLI / MCP | 15% | 58 | MCP state + omg CLI |
| UX / HUD | 10% | 52 | File HUD + omg status |
| **Blended** | 100% | **80** | Target ≥80 met |

## Orchestration

| Feature | OMC | OMG v0.5 |
|---------|-----|----------|
| Deep Interview | ✅ | ✅ + config template |
| Ralplan / Autopilot / Ralph / Ultrawork / UltraQA | ✅ | ✅ |
| Keywords (modes + review + tdd/think/search/verify/analyze) | ✅ | 🟡 broad set |
| Stop / injector / PreTool / PostTool / Subagent / PreCompact | ✅ | 🟡 simplified implementations |
| MCP state_* tools | ✅ | ✅ `omg-state` server |
| File + CLI state | ✅ | ✅ `omg state` / MCP |
| HUD | ✅ binary | 🟡 file HUD + skill |
| Team tmux multi-CLI | ✅ | ❌ |
| OpenClaw / Claude Teams env | ✅ | ❌ N/A |
| UI mockup / web-research | ❌ | ⭐ |

## Runtime checklist

- [x] Agents 20 + skills 45
- [x] Keyword + injector + Stop
- [x] PreToolUse enforcer
- [x] PostToolUse verifier
- [x] Subagent tracker
- [x] PreCompact
- [x] MCP state server (`.mcp.json`)
- [x] `omg` CLI status/state/doctor
- [x] File HUD
- [x] `templates/omg.jsonc`
- [x] `docs/SIMILARITY.md` ≥80%
- [ ] Full statusline binary HUD
- [ ] tmux multi-provider team
- [ ] Full OMC TypeScript runtime
