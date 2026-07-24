#!/bin/bash
# MCP Server wrapper for oh-my-grok.
# Prefer slim state MCP; optional built standalone when present.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

GLOBAL_NPM_ROOT="$(npm root -g 2>/dev/null)"
if [ -n "$GLOBAL_NPM_ROOT" ]; then
  export NODE_PATH="${GLOBAL_NPM_ROOT}:${NODE_PATH:-}"
fi

# Prefer OMG state MCP (always present); fall back to built standalone server
if [ -f "$ROOT/mcp/omg-state-server.mjs" ]; then
  exec node "$ROOT/mcp/omg-state-server.mjs" "$@"
fi
if [ -f "$ROOT/dist/mcp/standalone-server.js" ]; then
  exec node "$ROOT/dist/mcp/standalone-server.js" "$@"
fi
if [ -f "$SCRIPT_DIR/mcp-server.cjs" ]; then
  exec node "$SCRIPT_DIR/mcp-server.cjs" "$@"
fi

echo "No MCP entry found. Run: npm run build  (or ensure mcp/omg-state-server.mjs exists)" >&2
exit 1
