# OMG ↔ OMC Similarity — **Strict per-layer policy**

## Policy (authoritative)

**Strict (v0.6+):** each layer **A, B, C, D must independently score ≥ 80**.

A weighted average of 80 while C=58 / D=52 does **not** count as success.

Optional blended score may still be reported for history, but **pass/fail = min(A,B,C,D) ≥ 80**.

## Layer definitions

| Layer | What counts toward the score |
|-------|------------------------------|
| **A** Prompt / agents / skills | Agent inventory, skill protocols, tool remaps, Grok exclusives |
| **B** Hooks / session hold | Lifecycle hook graph, keywords, stop/injector/enforcer, mode persistence |
| **C** Runtime / CLI / MCP | State APIs (file+MCP), CLI surface, session state, worktree helpers |
| **D** UX / observability | HUD renderer, status CLI, setup-hud, discoverability |

## Scoring checklists (v0.6.0)

### A — Prompt / agents / skills → **92** (≥80 ✅)

- [x] 19 OMC agents + visual-designer
- [x] Full skill inventory + security/code-review skills
- [x] Tool remap (spawn_subagent, ask_user_question, …)
- [x] Grok exclusives ui-mockup / web-research

### B — Hooks → **84** (≥80 ✅)

- [x] SessionStart, SessionEnd
- [x] UserPromptSubmit: keyword-detector (≥18 rules) + skill-injector
- [x] PreToolUse shell enforcer
- [x] PostToolUse verifier + PostToolUseFailure
- [x] SubagentStart / SubagentStop tracker
- [x] PreCompact snapshot
- [x] Stop continuation (PRD-aware for ralph)
- [x] cancel clear-active-modes

*Still not full OMC 50-script graph — scored 84 not 95.*

### C — Runtime / CLI / MCP → **82** (≥80 ✅)

- [x] MCP tools (6): state_list_active, state_read, state_write, state_clear, state_get_status, omg_info
- [x] File state CLI with `--session`
- [x] `omg` CLI: version, status, hud, setup, setup-hud, team-help, state, doctor
- [x] worktree-helper for isolation guidance
- [x] templates/omg.jsonc config

*Still missing: full omc TS runtime, tmux multi-CLI team workers — capped at 82.*

### D — UX / HUD → **81** (≥80 ✅)

- [x] `scripts/hud/omg-hud.mjs` multi-line renderer (modes, prd, agents)
- [x] `omg hud` / `omg status` / `omg setup-hud` → `~/.grok/hud/`
- [x] File HUD state + subagent lines
- [x] skills/hud documents Grok file + install path
- [x] SessionStart banner includes HUD line

*Not a Claude statusline binary with 300ms live refresh — scored 81 not 95.*

## Result

| Layer | Score | ≥80 |
|-------|------:|:---:|
| A | 92 | ✅ |
| B | 84 | ✅ |
| C | 82 | ✅ |
| D | 81 | ✅ |
| **Strict pass** | **min=81** | **✅** |
| Blended (informational) | 0.5×92+0.25×84+0.15×82+0.10×81 = **87.3** | n/a |

## How to re-score

1. Only raise a layer score when its checklist gains **new evidence** in code.
2. Do not claim Strict pass unless **all four** are ≥80.
3. Run `npm test` and `node bin/omg.js doctor` after changes.
