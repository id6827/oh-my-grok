# Bridge artifacts (OMG)

OMC ships prebuilt `*.cjs` bundles under `bridge/` (mcp-server, cli, team, …).

**OMG policy:** do not commit multi‑MB Claude-era bundles. Build from TypeScript instead:

```bash
npm run build
# future: npm run build:bridge  (scripts/build-*.mjs when wired)
```

| OMC file | OMG path |
|----------|----------|
| mcp-server.cjs | `dist/mcp/standalone-server.js` or `mcp/omg-state-server.mjs` |
| cli.cjs | `bin/omg.js` + `dist/cli` |
| team*.cjs / team.js | `src/team` + `omg team` |
| runtime-cli.cjs | `dist/` CLI modules |
| gyoshu_bridge.py | kept (optional / N/A on Grok) |
| run-mcp-server.sh | kept, points at Grok-friendly entry |

See `docs/OMC-PORT-STATUS.md` and `docs/PORT-ARCHITECTURE.md`.
