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
| optional `build:bridge:extra` | bridge-entry, skill-bridge, claude-md-coordinator |

## Runtime entries (product)

| Surface | Path |
|---------|------|
| **Plugin MCP (default)** | `mcp/omg-state-server.mjs` via `.mcp.json` |
| MCP wrapper | `bridge/run-mcp-server.sh` → prefers `mcp/omg-state-server.mjs`, then `dist/mcp/standalone-server.js`, then local `mcp-server.cjs` if built |
| CLI | `bin/omg.js` (not `bridge/cli.cjs` for Grok plugin install) |
| Team | `omg team` via `bin/omg.js` + `src/team` |

## Policy

- **Do not commit** `bridge/*.cjs` / `bridge/team.js` (gitignore).
- Keep: `README.md`, `run-mcp-server.sh`, optional `gyoshu_bridge.py` (N/A on Grok).
- See `docs/OMC-PORT-STATUS.md` §B and `docs/PORT-ARCHITECTURE.md`.
