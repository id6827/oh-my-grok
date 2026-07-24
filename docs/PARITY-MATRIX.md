# OMC ↔ OMG Parity Matrix

OMC reference version: **4.15.7** (marketplace cache).  
OMG version: **0.4.0**.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Supported |
| 🟡 | Partial / simplified |
| ❌ | Deferred or N/A on Grok |
| ⭐ | Grok-only (beyond OMC) |

## Similarity snapshot (indicative)

| Layer | ~Similarity | Notes |
|-------|------------:|-------|
| Prompt / agents / skills | 85–90% | Full agent set + skill inventory |
| Hooks / mode hold | **55–65%** | v0.4: keywords, injector, Stop, PreToolUse, PreCompact, state CLI |
| Runtime / CLI / MCP / team tmux | 20–30% | Thin `omg` CLI + file state; no full TS runtime |
| UX / HUD | 30–45% | Harness-dependent |
| **Blended (flow-weighted)** | **~70%** | Up from ~65% at v0.3 |

## Orchestration modes

| Feature | OMC | OMG v0.4 |
|---------|-----|----------|
| Deep Interview | ✅ | ✅ + ⭐ web hints |
| Ralplan / plan consensus | ✅ | ✅ |
| Autopilot | ✅ | ✅ + ⭐ search-on-fail |
| Ralph | ✅ | ✅ |
| Ultrawork | ✅ | ✅ |
| UltraQA | ✅ | ✅ |
| Ultragoal | ✅ | 🟡 prompt port |
| Team (in-session) | ✅ | 🟡 `spawn_subagent` / worktree |
| `omc team` tmux multi-CLI | ✅ | ❌ deferred |
| Named autopilot `--workflow` + flock | ✅ Linux | 🟡 docs only |
| Keyword magic triggers | ✅ | 🟡 expanded (review, tdd, ultrathink, deepsearch, deslop, …) |
| Security review | ✅ keyword | ✅ skill + keyword + agent |
| Code review | ✅ keyword | ✅ skill + keyword + agent |
| Stop continuation | ✅ | 🟡 simplified |
| Skill injector | ✅ | 🟡 simplified |
| PreToolUse enforcer | ✅ | 🟡 catastrophic-shell deny |
| PreCompact awareness | ✅ | 🟡 snapshot + reminder |
| HUD statusline | ✅ | 🟡 skill text only |
| Skillify / learner | ✅ | ✅ prompts |
| OpenClaw | ✅ | ❌ N/A |
| Claude Agent Teams env | ✅ | ❌ → Grok subagents |
| UI mockup + Vision QA | ❌ | ⭐ `/ui-mockup` |
| Real-time web/X research | limited | ⭐ `/web-research` |
| State CLI | MCP tools | 🟡 `omg state` / `scripts/omg-state.mjs` |

## Agents (19 + 1)

All OMC agents + ⭐ `visual-designer`.

## Skills

| OMC | OMG |
|-----|-----|
| `omc-*` | `omg-*` |
| keyword security/code review | `/security-review`, `/code-review` skills |
| — | ⭐ `ui-mockup`, `web-research` |

## State paths

| OMC | OMG |
|-----|-----|
| `.omc/**` | `.omg/**` |

## Runtime (Layer B)

| Component | OMG v0.4 |
|-----------|----------|
| SessionStart | ✅ |
| keyword-detector | 🟡 expanded |
| skill-injector | 🟡 |
| clear-active-modes / cancel | 🟡 |
| pre-tool-enforcer | 🟡 shell danger deny |
| PreCompact | 🟡 |
| stop continuation | 🟡 |
| File state CLI | 🟡 `omg state` |
| Thin `omg` bin | 🟡 version/state/doctor |
| MCP state_write server | ❌ |
| Full HUD / omc TS runtime | ❌ |
| tmux multi-CLI team | ❌ |

## Acceptance checklist

- [x] 19 OMC agents + visual-designer
- [x] Core + extended skill inventory
- [x] Grok exclusives
- [x] Layer B keyword + Stop + injector
- [x] Security/code-review skills
- [x] pre-tool-enforcer (simplified)
- [x] PreCompact hook
- [x] `omg` / `omg-state` CLI helpers
- [x] Automated hook unit tests (`npm test`)
- [ ] Full HUD parity
- [ ] MCP state server
- [ ] tmux `omg team` multi-provider
- [ ] GitHub marketplace publish (out of band)
