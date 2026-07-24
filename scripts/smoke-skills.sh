#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== validate-parity =="
node scripts/validate-parity.mjs

echo "== grok plugin validate =="
grok plugin validate .

echo "== inventory =="
echo "agents: $(ls agents/*.md | wc -l | tr -d ' ')"
echo "skills: $(find skills -name SKILL.md | wc -l | tr -d ' ')"

echo "SMOKE OK (install separately: grok plugin install \"$ROOT\" --trust)"
