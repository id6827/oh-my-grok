# OMC Source Pin

Pinned source for the oh-my-grok (OMG) TypeScript runtime and surface port.

**This pin is the upgrade checkpoint:** when bringing a newer OMC, re-diff from the commit below, then advance the table in the same change.

Also surfaced in the root [`README.md`](../README.md) under **OMC source pin**.

## Primary pin (do not drift silently)

| Field | Value |
|-------|--------|
| **npm `name`** | `oh-my-claude-sisyphus` |
| **npm `version`** | **`4.15.7`** |
| **Git commit (full)** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Git commit (short)** | **`41a4c0f`** |
| **Commit date** | 2026-07-23 04:44:59 +0000 |
| **Commit subject** | `chore: promote dev to main for v4.15.7 release` |
| **GitHub** | https://github.com/Yeachan-Heo/oh-my-claudecode/commit/41a4c0f77144c5beb5f5f000a89cff379c680606 |

```bash
# Verify a local OMC tree matches this pin
git -C <omc-root> rev-parse HEAD
# expect: 41a4c0f77144c5beb5f5f000a89cff379c680606
```

## Primary source (local marketplace cache)

| Field | Value |
|-------|--------|
| **Path** | `~/.grok/marketplace-cache/6c258a25db310b8a/` |
| **Resolved (example)** | `/Users/sa/.grok/marketplace-cache/6c258a25db310b8a` |

> Cache hash folders may differ per machine. Prefer the tree whose `package.json` has `name` matching oh-my-claudecode / `oh-my-claude-sisyphus` and version **`4.15.7`** (or the new pin when intentionally upgraded), and whose `git rev-parse HEAD` matches the table above.

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

## How to re-pin (upgrade checkpoint workflow)

1. Note the **previous** pin (`41a4c0f` / `4.15.7`) — that is the diff base until you replace it.
2. Refresh marketplace cache or clone upstream; check out the target OMC commit.
3. Record new `package.json` version + `git rev-parse HEAD` in this file (and README pin table).
4. Re-run `node scripts/port-inventory.mjs`.
5. Bump `docs/OMC-PORT-STATUS.md` “source pin” line and residual notes as needed.
6. Prefer `node scripts/port-from-omc.mjs` / validate helpers after bulk refresh; keep MIT attribution.

## OMG consumer version (this repo)

| Field | Value |
|-------|--------|
| **package.json / plugin.json** | **`0.9.0-rc.1`** |
| **State root** | `.omg/` (never write new runtime state under `.omc/`) |
| **Config dir dual-read** | `GROK_CONFIG_DIR` → `CLAUDE_CONFIG_DIR` → `~/.grok` |
