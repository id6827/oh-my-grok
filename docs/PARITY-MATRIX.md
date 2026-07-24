# OMC ↔ OMG Parity Matrix

OMC reference version: **4.15.7** (marketplace cache).  
OMG version: **0.3.0**.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Supported at prompt/agent level (Layer A) |
| 🟡 | Partial / simplified |
| ❌ | Not in v0.1 (deferred Layer B or N/A) |
| ⭐ | Grok-only (beyond OMC) |

## Orchestration modes

| Feature | OMC | OMG v0.1 |
|---------|-----|----------|
| Deep Interview | ✅ | ✅ + ⭐ web hints |
| Ralplan / plan consensus | ✅ | ✅ |
| Autopilot | ✅ | ✅ + ⭐ search-on-fail |
| Ralph | ✅ | ✅ |
| Ultrawork | ✅ | ✅ |
| UltraQA | ✅ | ✅ |
| Ultragoal | ✅ | 🟡 prompt port; runtime evidence lighter |
| Team (in-session) | ✅ | 🟡 via `spawn_subagent` / worktree |
| `omc team` tmux multi-CLI | ✅ | ❌ deferred (Layer B3) |
| Named autopilot `--workflow` + flock | ✅ Linux | 🟡 documented; flock gate deferred |
| Keyword magic triggers (hooks) | ✅ | 🟡 detector v0.3 (incl. security/code review) |
| Security review mode | ✅ keyword | ✅ `/security-review` + keyword + agent |
| Code review mode | ✅ keyword | ✅ `/code-review` + keyword + agent |
| Stop continuation gates | ✅ | 🟡 simplified Stop gate (v0.2+) |
| Skill injector (active modes) | ✅ | 🟡 simplified (v0.3) |
| HUD statusline | ✅ | 🟡 skill text; no binary HUD |
| Skillify / learner | ✅ | ✅ prompts |
| OpenClaw | ✅ | ❌ N/A |
| Claude Agent Teams env | ✅ | ❌ → Grok subagents |
| UI mockup + Vision QA | ❌ | ⭐ `/ui-mockup` |
| Real-time web/X research | limited | ⭐ `/web-research` |

## Agents (19 + 1)

All OMC agents ported with `model: inherit` and tool-name remaps:

`analyst`, `architect`, `code-reviewer`, `code-simplifier`, `critic`, `debugger`, `designer`, `document-specialist`, `executor`, `explore`, `git-master`, `planner`, `qa-tester`, `scientist`, `security-reviewer`, `test-engineer`, `tracer`, `verifier`, `writer`

⭐ `visual-designer` — Image/Vision specialist

## Skills

| OMC | OMG |
|-----|-----|
| `omc-doctor` | `omg-doctor` |
| `omc-reference` | `omg-reference` |
| `omc-setup` | `omg-setup` |
| `omc-teams` | `omg-teams` |
| others (same slug) | same slug |
| — | ⭐ `ui-mockup`, `web-research` |

## State paths

| OMC | OMG |
|-----|-----|
| `.omc/specs/` | `.omg/specs/` |
| `.omc/plans/` | `.omg/plans/` |
| `.omc/state/` | `.omg/state/` |
| `.omc/artifacts/` | `.omg/artifacts/` |
| `.claude/omc.jsonc` | `.grok/omg.jsonc` (documented) |

## Runtime (Layer B)

| Component | OMG v0.1 |
|-----------|----------|
| SessionStart → ensure `.omg/` | ✅ |
| keyword-detector | 🟡 v0.3 (core modes + security/code review + cancel clear) |
| skill-injector | 🟡 v0.3 simplified |
| clear-active-modes / cancel | 🟡 v0.3 |
| pre-tool-enforcer | ❌ |
| stop continuation | 🟡 v0.2+ simplified |
| MCP state_write server | ❌ (file-based state in prompts) |
| `omg` CLI binary | ❌ |

## Acceptance for claiming “prompt parity”

- [x] 19 OMC agents + visual-designer
- [x] Core pipeline skills present and path-remapped
- [x] Full skill inventory (43) with renames
- [x] Grok exclusives documented
- [ ] Interactive TUI smoke on user machine
- [ ] Layer B keyword/Stop hooks
