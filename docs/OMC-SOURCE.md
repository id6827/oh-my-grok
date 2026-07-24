# OMC Source Pin

Pinned source for the oh-my-grok (OMG) TypeScript runtime and surface port.

## Primary source (local marketplace cache)

| Field | Value |
|-------|--------|
| **Path** | `~/.grok/marketplace-cache/6c258a25db310b8a/` |
| **Resolved** | `/Users/sa/.grok/marketplace-cache/6c258a25db310b8a` |
| **npm `name`** | `oh-my-claude-sisyphus` |
| **npm `version`** | `4.15.7` |
| **Git commit** | `41a4c0f77144c5beb5f5f000a89cff379c680606` |
| **Commit date** | 2026-07-23 04:44:59 +0000 |
| **Commit subject** | `chore: promote dev to main for v4.15.7 release` |

> Cache hash folders may differ per machine. Prefer the tree whose `package.json` has `name` matching oh-my-claudecode / `oh-my-claude-sisyphus` and version `4.15.7` (or newer pin when intentionally upgraded).

## Remote upstream

| Field | Value |
|-------|--------|
| **URL** | https://github.com/Yeachan-Heo/oh-my-claudecode |
| **License** | MIT |
| **Attribution** | See root `NOTICE` and `LICENSE` |

## Inventory snapshot (at pin)

| Surface | Count / notes |
|---------|----------------|
| `src/**/*.ts` | **1155** files |
| Top-level `src/` modules | 29 dirs + `index.ts` + `AGENTS.md` |
| Largest modules | hooks (287), `__tests__` (248), team (189), features (62), cli (54), hud (47) |
| `bridge/` | mcp-server, team-bridge, team-mcp, team.js, runtime-cli, cli, claude-md-coordinator, gyoshu_bridge.py |
| `scripts/` | ~70 top-level entries / ~90 files |
| `bin/` | `oh-my-claudecode.js` → `bridge/cli.cjs` |
| Build | `tsc` + esbuild bridge scripts (`build-mcp-server`, `build-cli`, …) |
| Test | vitest 4.x |

## How to re-pin

1. Refresh marketplace cache or clone upstream.
2. Record `package.json` version + `git rev-parse HEAD`.
3. Update this file and re-run `node scripts/port-inventory.mjs`.
4. Bump `docs/OMC-PORT-STATUS.md` “source pin” line.

## OMG consumer version (this repo)

| Field | Value |
|-------|--------|
| **package.json / plugin.json** | See repo root (starts at 0.7.0; port may bump toward 0.9.0 / 1.0.0-rc) |
| **State root** | `.omg/` (never write new runtime state under `.omc/`) |
