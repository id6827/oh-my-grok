#!/usr/bin/env bash
# OMG SessionStart: ensure .omg/ tree, refresh HUD, emit banner.
set -euo pipefail

cwd="${GROK_CWD:-${GROK_WORKSPACE_ROOT:-${PWD:-.}}}"
omg_root="${cwd}/.omg"
plugin_root="${GROK_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-}}"

mkdir -p \
  "${omg_root}/specs" \
  "${omg_root}/plans" \
  "${omg_root}/state" \
  "${omg_root}/artifacts" \
  "${omg_root}/skills"

# Refresh file HUD (best-effort)
if [[ -n "${plugin_root}" && -f "${plugin_root}/hooks/scripts/lib/hud.mjs" ]]; then
  node --input-type=module -e "
    import { refreshHud } from 'file://${plugin_root}/hooks/scripts/lib/hud.mjs';
    refreshHud(process.env.CWD || process.cwd(), { last_hook: 'SessionStart' });
  " 2>/dev/null || true
fi
# Fallback: write idle line
if [[ ! -f "${omg_root}/state/hud-status.txt" ]]; then
  echo "OMG idle | session-start" > "${omg_root}/state/hud-status.txt"
fi

hud_line="$(head -1 "${omg_root}/state/hud-status.txt" 2>/dev/null || echo "OMG ready")"

cat <<EOF
OMG ready (v0.5). ${hud_line}
State: .omg/ | MCP: omg-state (state_*) | CLI: omg status|state|doctor
Hooks: keyword+injector+PreToolUse+PostToolUse+Subagent+PreCompact+Stop
Skills: /deep-interview /autopilot /ralph /security-review /code-review /ui-mockup /web-research
EOF

exit 0
