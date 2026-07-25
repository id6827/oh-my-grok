# Grok Product Subset Contract

**Status:** frozen (2026-07-26)  
**Applies to:** oh-my-grok product claim vs oh-my-claudecode host parity  
**Does not replace:** file inventory (`port-inventory`) or checklist scores (`SIMILARITY.md`)

This document freezes what **“done on Grok Build”** means for intentional 🟡 surfaces.  
Product gates remain: `npm run test:vitest:core`, `npm run test:smoke`, `npm run mcp:probe`.

---

## A. Full product (✅)

| Surface | Definition of done |
|---------|-------------------|
| Module inventory | 100% OMC modules touched (rename-accounted) |
| Build + bridge | `build` + `build:bridge` (mcp/cli/runtime/team + team-bridge + skill-bridge + coordinator) |
| Hooks event graph | Registered events in `hooks/hooks.json` (see `HOOKS-PARITY.md`) |
| MCP tools | `omg-tools` ~54 tools via `mcp/run-tools-server.mjs` |
| CLI | `omg` / `omc` / `oh-my-grok` → `bin/omg.js` |
| Team | `omg team` dry-run + live tmux when available |
| Autopilot solo/team | Config `execution`; solo = in-session agents; team = tmux workers |
| Modes via skills + state | ralph, ralplan, ultrawork, ultraqa, deep-interview, cancel, … |
| Full vitest residual | 0 fail (wave 5) |
| Core + smoke | 217 + smoke green |

---

## B. Grok product subset (✅ if contract met; not OMC host clone)

These ship as **TS + skills + hooks/state** on Grok. They are **not** required to mirror Claude Code UI panels or every OMC-only host integration.

| Surface | Product-done contract | Out of subset |
|---------|----------------------|---------------|
| **ultragoal / autoresearch / ralphthon / verification engines** | Skill entry + state under `.omg/` + persistent-mode / keyword activation where wired; unit tests pass | Claude-only host widgets |
| **skillify / learner** | `/skillify` (and `/learner` alias) skill drafts; simplified `hooks/scripts/skill-injector.mjs` mode hints on UserPromptSubmit | Full OMC learner bundle always loaded via skill-bridge in every prompt (skill-bridge still **built** for installer/OMC script path) |
| **HUD** | Statusline + `--watch`; presets `minimal` / `focused` / `full` / `opencode` / `dense` via settings `omcHud.preset` (default `focused`); unit tests | `omg hud --preset` CLI flag (not required) |
| **Notifications** | Config skill + TS providers | Host push guarantees |
| **Wiki / deepinit** | Registered hooks + skills | Full knowledge-base product UI |
| **better-sqlite3** | optionalDependency + shim; job-state dynamic import | Native module required on all hosts |
| **openclaw / gyoshu** | N/A or code present | Product requirement on Grok |

---

## C. Intentional host N/A (🟡 freeze — not defects)

| Surface | Freeze reason |
|---------|---------------|
| **Named autopilot `--workflow` profiles** | Linux + system `flock` + `/proc` only (ADR / settings-schema). Unsupported hosts **reject** named activation before state mutation; **legacy** `/autopilot` remains cross-platform. |
| **Windows find-node** | Rewrites find-node.sh launchers only; bash SessionStart wrappers intentional |
| **Claude Code TeamCreate UI** | Grok uses implicit agent teams + `omg team` tmux |

---

## D. Dual-path skill injectors (explicit)

| Path | Role |
|------|------|
| `hooks/scripts/skill-injector.mjs` | **Grok default** — mode re-injection hints; registered on UserPromptSubmit |
| `scripts/skill-injector.mjs` + `dist/hooks/skill-bridge.cjs` | **OMC-compat / full learner** — built by `build:bridge`; soft-fails without bridge |

Do not force skill-bridge into the Grok UserPromptSubmit path without a product decision to load full learner prompts every turn.

---

## E. How to claim “near-complete product”

1. Axes A/B/D runtime green (build, smoke, MCP, core).  
2. Full vitest residual green or accurately frozen.  
3. This subset document published and `OMC-PORT-STATUS` rows match it.  
4. Remaining 🟡 only = host N/A or explicit out-of-subset (section B/C).

**YES 100% of OMC main** remains a stronger bar (every host surface) and is **not** claimed by this freeze.

## Related

- `docs/OMC-PORT-STATUS.md`  
- `docs/HOOKS-PARITY.md`  
- `parity-review/ralplan-omc-omg-parity-gap-2026-07-25.md`  
- `docs/adr/03487-named-autopilot-stage-profiles.md`
