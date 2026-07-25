# Bridge artifacts (OMG)

OMC ships prebuilt multi‑MB `*.cjs` under `bridge/`. OMG **generates** them locally/CI and **does not commit** fat bundles (see `.gitignore`).

## Generate

```bash
npm run build          # tsc → dist/ + runtime compat
npm run build:bridge   # esbuild → bridge/*.cjs (local only)
npm run build:all      # both
```

| Script | Output |
|--------|--------|
| `scripts/build-mcp-server.mjs` | `bridge/mcp-server.cjs` |
| `scripts/build-cli.mjs` | `bridge/cli.cjs`, `bridge/team.js` |
| `scripts/build-runtime-cli.mjs` | `bridge/runtime-cli.cjs` |
| `scripts/build-team-server.mjs` | `bridge/team-mcp.cjs` |
| `scripts/build-bridge-entry.mjs` | `bridge/team-bridge.cjs` (OMC-compat standalone) |
| `scripts/build-skill-bridge.mjs` | `dist/hooks/skill-bridge.cjs` |
| `scripts/build-claude-md-coordinator.mjs` | `bridge/claude-md-coordinator.cjs` |
| `build:bridge:extra` | alias for the three extra builders only (compat) |

## Runtime entries (product)

| Surface | Path |
|---------|------|
| **Plugin MCP (default)** | `.mcp.json` → `mcp/run-tools-server.mjs` → full tools (~54: LSP/AST/state/wiki/…) |
| Thin state-only fallback | `mcp/omg-state-server.mjs` (debug; not default) |
| MCP wrapper | `bridge/run-mcp-server.sh` → same launcher chain |
| CLI | `bin/omg.js` |
| Team | `omg team` via `bin/omg.js` + `src/team` |

Full tools MCP is **host-agnostic** (standard MCP stdio). Grok Build loads it via `plugin.json` → `.mcp.json` (and/or project `.grok/config.toml`).

**No auto-build on MCP connect** (handshake timeout). Prepare once:

```bash
npm run build            # dist/standalone fallback
npm run build:bridge     # preferred bridge/mcp-server.cjs
```

Launcher order: `bridge/mcp-server.cjs` → `dist/mcp/standalone-server.js` → error.

## Policy

- **Do not commit** `bridge/*.cjs` / `bridge/team.js` (gitignore).
- Keep: `README.md`, `run-mcp-server.sh`, optional `gyoshu_bridge.py` (N/A on Grok).
- See `docs/OMC-PORT-STATUS.md` §B and `docs/PORT-ARCHITECTURE.md`.
