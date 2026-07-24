#!/usr/bin/env bash
# OMG SessionStart: ensure .omg/ state tree exists and emit a short banner.
set -euo pipefail

cwd="${GROK_CWD:-${PWD:-.}}"
omg_root="${cwd}/.omg"

mkdir -p \
  "${omg_root}/specs" \
  "${omg_root}/plans" \
  "${omg_root}/state" \
  "${omg_root}/artifacts" \
  "${omg_root}/skills"

# Hooks may print additional context for the agent on stdout.
cat <<EOF
OMG ready. State root: .omg/ | skills: /deep-interview /ralplan /autopilot /ui-mockup /web-research
EOF

exit 0
