#!/usr/bin/env bash
# Watch OMG HUD (refresh every 500ms by default)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
INTERVAL="${OMG_HUD_INTERVAL:-500}"
exec node "$ROOT/scripts/hud/omg-hud.mjs" --watch --interval "$INTERVAL" "$@"
