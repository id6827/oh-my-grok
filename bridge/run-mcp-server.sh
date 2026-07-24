#!/bin/bash
# Launch full OMG tools MCP (or thin state fallback).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

GLOBAL_NPM_ROOT="$(npm root -g 2>/dev/null)"
if [ -n "$GLOBAL_NPM_ROOT" ]; then
  export NODE_PATH="${GLOBAL_NPM_ROOT}:${NODE_PATH:-}"
fi

export GROK_PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-$ROOT}"
export CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$GROK_PLUGIN_ROOT}"

# Preferred: launcher (builds bridge if needed, stdio MCP)
if [ -f "$ROOT/mcp/run-tools-server.mjs" ]; then
  exec node "$ROOT/mcp/run-tools-server.mjs" "$@"
fi
if [ -f "$ROOT/bridge/mcp-server.cjs" ]; then
  exec node "$ROOT/bridge/mcp-server.cjs" "$@"
fi
if [ -f "$ROOT/dist/mcp/standalone-server.js" ]; then
  exec node "$ROOT/dist/mcp/standalone-server.js" "$@"
fi
if [ -f "$ROOT/mcp/omg-state-server.mjs" ]; then
  exec node "$ROOT/mcp/omg-state-server.mjs" "$@"
fi

echo "No MCP entry found. Run: npm run build && npm run build:bridge" >&2
exit 1
