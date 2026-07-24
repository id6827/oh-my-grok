#!/usr/bin/env bash
set -euo pipefail

cwd="${GROK_CWD:-${GROK_WORKSPACE_ROOT:-${PWD:-.}}}"
omg_root="${cwd}/.omg"
plugin_root="${GROK_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-}}"

mkdir -p \
  "${omg_root}/specs" \
  "${omg_root}/plans" \
  "${omg_root}/state" \
  "${omg_root}/state/sessions" \
  "${omg_root}/artifacts" \
  "${omg_root}/skills"

if [[ -n "${plugin_root}" && -f "${plugin_root}/scripts/hud/omg-hud.mjs" ]]; then
  GROK_WORKSPACE_ROOT="${cwd}" node "${plugin_root}/scripts/hud/omg-hud.mjs" 2>/dev/null \
    | head -3 > "${omg_root}/state/hud-status.txt" || true
fi

if [[ ! -s "${omg_root}/state/hud-status.txt" ]]; then
  echo "[OMG] idle | session-start" > "${omg_root}/state/hud-status.txt"
fi

hud_line="$(head -1 "${omg_root}/state/hud-status.txt" 2>/dev/null || echo "OMG ready")"

cat <<EOF
OMG ready (v0.6 STRICT). ${hud_line}
Layers: docs/SIMILARITY.md requires A/B/C/D each ≥80
Hooks: full lifecycle | MCP: 6 state tools | CLI: omg status|hud|setup|doctor
EOF

exit 0
