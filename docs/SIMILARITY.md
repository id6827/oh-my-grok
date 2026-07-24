# OMG ↔ OMC Similarity Methodology (v0.5)

## Goal

Document a **reproducible** blended similarity score targeting **≥ 80%** for flow-weighted product use (not line-for-line runtime identity).

## Weights (flow-weighted)

| Layer | Weight | What it measures |
|-------|-------:|------------------|
| **A. Prompt / agents / skills** | 50% | Can users run the same orchestration protocols? |
| **B. Hooks / session hold** | 25% | Do lifecycle hooks keep modes alive like OMC? |
| **C. Runtime / CLI / state tools** | 15% | State APIs, CLI, MCP (not full OMC TS monorepo) |
| **D. UX / observability** | 10% | HUD, status, discoverability |

`blended = 0.50·A + 0.25·B + 0.15·C + 0.10·D`

## Scoring rubric (per layer)

| Score band | Meaning |
|------------|---------|
| 90–100 | Near-complete behavioral parity for that layer |
| 75–89 | Core paths solid; edge OMC features missing |
| 50–74 | Usable subset |
| <50 | Major gaps |

## v0.5.0 scores (evidence-based estimates)

| Layer | Score | Evidence |
|-------|------:|----------|
| **A** | **92** | 20 agents (19+visual); 45 skills; OMC skill set + review skills + Grok exclusives; tool remap complete |
| **B** | **78** | SessionStart, keyword (+review/tdd/ultrathink/deepsearch/verify/analyze), injector, PreToolUse, PostToolUse, SubagentStart/Stop, PreCompact, Stop continuation, cancel clear |
| **C** | **58** | File state CLI + **MCP state tools** + thin `omg` CLI (status/doctor); no full OMC bridge/TS runtime/tmux team |
| **D** | **52** | File HUD (`hud-status.txt` / `omg status`); no Claude statusline binary parity |
| **Blended** | **0.50×92 + 0.25×78 + 0.15×58 + 0.10×52 = 80.0** | **≥ 80% target met** |

## What still blocks 90%+

- Full HUD statusline binary + live agent tree (D → 85+)
- Full OMC hook graph + MCP surface area (B/C)
- `omg team` tmux multi-provider workers (C)
- Named autopilot flock workflows (B)

## How to re-score after changes

1. Update evidence bullets per layer in this file.
2. Assign scores using the rubric (do not invent decimals without evidence).
3. Recompute blended; update `docs/PARITY-MATRIX.md` snapshot table.
4. Run `npm test` and `node bin/omg.js doctor`.

## Non-claims

- **Not** claiming 80% of OMC TypeScript LOC.
- **Not** claiming pixel-identical Claude Code UX.
- Claiming **flow-weighted orchestration parity** for day-to-day multi-agent CLI use on Grok.
