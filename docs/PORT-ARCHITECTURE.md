# Port Architecture — OMC → OMG

Architecture contract for product-level port of oh-my-claudecode (OMC) into oh-my-grok (OMG).

## Goals

1. **Single TypeScript runtime** under repo-root `src/` → `dist/` (OMC-scale).
2. **Thin wrappers** for hooks/MCP/bin that call built runtime where possible.
3. **Grok Build contracts** for host APIs; Claude-only paths isolated in adapters/shims.
4. **State root `.omg/`** only; `.omc` is read-migrate only.

## Module map

```
oh-my-grok/
  src/                    # Ported OMC runtime (source of truth)
    index.ts              # Public library entry
    adapters/grok/        # Grok host adapters (tools, models, plugin root)
    shims/                # Claude-only SDK / native optional stubs
    constants/ config/ platform/ shared/ types/ utils/ lib/
    hooks/ features/ mcp/ team/ hud/ cli/ commands/
    agents/ skills/       # Metadata loaders (content lives in agents/ skills/)
    ralphthon/ ultragoal/ planning/ verification/ …
  dist/                   # tsc (+ later esbuild bridge bundles)
  runtime/                # LEGACY thin TS (pre-port); re-export or migrate into src/
  hooks/scripts/          # Thin mjs wrappers → prefer dist hooks over time
  mcp/                    # MCP entry (mjs or dist)
  bin/omg.js              # CLI surface (omg ≡ omc)
  agents/ skills/         # Prompt content (not duplicated into src/)
  .omg/                   # Runtime state, PRD, progress, artifacts
```

## State root

| Path | Role |
|------|------|
| `.omg/` | **Canonical** project state, mode files, team, HUD, PRD |
| `.omg/state/` | Mode/session state |
| `.omg/state/sessions/{id}/` | Session-scoped PRD/state |
| `.omc/` | **Legacy only** — read + one-shot migrate util; never write new |

Env resolution (planned parity with OMC):

1. `OMG_STATE_DIR` / `OMC_STATE_DIR` (compat)
2. Workspace `.omg-workspace` marker (multi-repo)
3. Git root / cwd → `.omg`

## Global rename rules

| OMC | OMG |
|-----|-----|
| `.omc` | `.omg` |
| `OMC` / `omc` | `OMG` / `omg` |
| `oh-my-claudecode` | `oh-my-grok` |
| `CLAUDE_PLUGIN_ROOT` | `GROK_PLUGIN_ROOT` (**alias**: still accept `CLAUDE_PLUGIN_ROOT`) |
| `CLAUDE_PLUGIN_DATA` | `GROK_PLUGIN_DATA` (alias) |
| `CLAUDE_CONFIG_DIR` | `GROK_CONFIG_DIR` (alias) |
| `~/.claude/` | `~/.grok/` |
| Task / Skill / AskUserQuestion | `spawn_subagent` / skill / `ask_user_question` |
| models opus/sonnet/haiku | `inherit` or map table in `src/adapters/grok/models.ts` |

Implemented transform: `scripts/port-from-omc.mjs` (prompt content) + `scripts/port-omc-src.mjs` (TS bulk).

## Grok adapter boundary

```
src/adapters/grok/
  models.ts          # Claude model ids → Grok inherit / slug map
  plugin-root.ts     # GROK_PLUGIN_ROOT with CLAUDE_PLUGIN_ROOT fallback
  tools.ts           # Tool name mapping for prompts & enforcers
  host.ts            # Host capability flags (image_gen, web_search, …)

src/shims/
  claude-agent-sdk.ts   # Stub/interface for @anthropic-ai/claude-agent-sdk
  better-sqlite3.ts     # Optional native or pure JSON/SQLite fallback
  ast-grep.ts           # Optional @ast-grep/napi
```

**Rule:** Do not delete Claude-only capabilities without either (a) a Grok-equivalent path or (b) explicit N/A + replacement in `docs/OMC-PORT-STATUS.md`.

## Collision points (existing OMG)

| Existing OMG | Port strategy |
|--------------|----------------|
| `runtime/src/{atomic-write,state,team}.ts` | Absorb into `src/lib` / `src/team` / `src/features`; keep `dist/runtime` re-export during transition |
| `bin/omg.js` | Keep surface; gradually delegate to `dist/cli` |
| `hooks/scripts/*.mjs` | Keep until TS hook runners ready; then thin wrappers |
| `mcp/omg-state-server.mjs` | Absorb into `src/mcp` standalone; mjs becomes launcher |
| `scripts/hud/*` | Align with `src/hud` |
| Prompt `agents/` `skills/` | **Keep**; runtime loaders point at these dirs |

## Build pipeline (target)

| Stage | OMC | OMG (target) |
|-------|-----|--------------|
| tsc | `src` → `dist` | same |
| bridge esbuild | mcp-server, cli, team, runtime-cli | port needed build scripts only |
| test | vitest | vitest or node:test; keep existing mjs smoke tests |
| plugin | Claude plugin root | `plugin.json` + `grok plugin validate` |

## Dependencies policy

| Package | Policy |
|---------|--------|
| `@modelcontextprotocol/sdk`, `commander`, `chalk`, `zod`, `ajv`, `jsonc-parser`, `safe-regex` | Port as real deps when modules need them |
| `@anthropic-ai/claude-agent-sdk` | **Shim** — no hard runtime dep |
| `better-sqlite3` | **optionalDependency** + pure JS fallback for swarm.db-like features |
| `@ast-grep/napi` | optional; tools degrade gracefully |
| `vscode-languageserver-protocol` | only if LSP tools ported |

## Entry points

| Surface | Entry |
|---------|--------|
| Library | `dist/index.js` |
| CLI | `bin/omg.js` → future `dist/cli` |
| MCP | `.mcp.json` → node launcher → `dist/mcp` or bridge |
| Hooks | `hooks/hooks.json` → scripts → prefer `dist/hooks/*` over time |
| HUD | `omg hud` / `scripts/hud/omg-hud.mjs` → `src/hud` |

## Slice order (Phase 2)

1. types, constants, utils, lib, shared  
2. config, platform  
3. hooks (TS body)  
4. features / state  
5. mcp  
6. team  
7. hud  
8. cli, commands  
9. skills/agents loaders  
10. ralphthon, ultragoal, planning, verification, goal-workflows, autoresearch  
11. providers, interop, tools, notifications  
12. installer  
13. tests green  

Each slice: **build green + tests for that area + PORT-STATUS update**.

## Non-goals (architecture)

- Forking Claude Code binary  
- Full OpenClaw clone (webhook adapter or N/A)  
- Checklist-only score inflation without module coverage  
