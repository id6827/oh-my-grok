# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Multi-agent orchestration for [Grok Build](https://x.ai) / Grok CLI.**

Port of [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) onto Grok, with Grok-native upgrades: **real-time web/X search**, **Image Gen UI mockups**, and **Vision UI QA**.

| | |
|--|--|
| **OMG version** | `0.9.0-rc.1` |
| **State root** | `.omg/` (never `.omc/`) |
| **OMC pin** | `4.15.7` @ `41a4c0f` (see below) |
| **Product gates** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Parity label** | **Near-complete** product transfer (not 100% Claude host clone) |

> Don't learn the harness. Just use OMG.

### Status snapshot (2026-07)

| Axis | Status |
|------|--------|
| Module inventory vs OMC pin | **100%** modules touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** / ~11225 pass — [`parity-review/VITEST-RESIDUAL-2026-07-25.md`](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Grok product subset | frozen — [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` protocol | same as OMC (Planner/Architect/Critic + gate); host tools renamed for Grok |

Optional checks: `npm run test:optional` (HUD `--preset`, release-pack dry-run, skill + drift-guard smokes).

---

## OMC source pin (upstream checkpoint)

OMG tracks a **pinned OMC commit** so future ports can re-diff from a known baseline. Full detail: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Field | Value |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm package** | `oh-my-claude-sisyphus` |
| **Pinned version** | **`4.15.7`** |
| **Pinned commit** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Commit subject** | `chore: promote dev to main for v4.15.7 release` |
| **Commit date** | 2026-07-23 04:44:59 +0000 |
| **Short form** | `4.15.7` @ `41a4c0f` |

When you upgrade OMC intentionally:

1. Check out / cache the new upstream tree.
2. Record `version` + `git rev-parse HEAD` in [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).
3. Re-run `node scripts/port-inventory.mjs` and update [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md).
4. Diff OMG against the **previous pin** (`41a4c0f…`) as the checkpoint, then advance the pin.

Local cache tip: marketplace trees under `~/.grok/marketplace-cache/*` — pick the folder whose `package.json` matches `oh-my-claude-sisyphus@4.15.7` (or the new pin).

---

## Install

```bash
# From GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# From a local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Verify discovery:

```bash
grok plugin details oh-my-grok
grok inspect
```

In a Grok session, try:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Recommended pipeline

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  implement → QA → multi-agent validation
```

Cancel anytime with `/cancel`. Runtime state lives under **`.omg/`**.

Vague product ideas → `/deep-interview` before code. Spec ready → `/ralplan` for consensus, then explicit approval before execution. UI without design → `/ui-mockup`. Ecosystem unknowns → `/web-research`.

---

## Autopilot execution: `solo` vs `team`

`/autopilot` always orchestrates **agents + skills**. How the **implementation stage** runs depends on config.

| Mode | Config | How work runs | What you see |
|------|--------|---------------|--------------|
| **`solo`** (default) | omit `execution`, or `"solo"` | In-session `spawn_subagent` + skill routing | Same Grok chat; **no** tmux panes |
| **`team`** | `"execution": "team"` | Implementation via `omg team` CLI workers | **tmux** sessions (`omg-omg-team-…`); HUD `team:…` |

### Configure (project or user)

**Project** (recommended): `.grok/omg.jsonc`  
**User** (all projects): `~/.config/grok-omg/config.jsonc`  
Project wins over user. Schema: [`docs/settings-schema.md`](docs/settings-schema.md).

```jsonc
// .grok/omg.jsonc — stay in this Grok session
{
  "autopilot": {
    "execution": "solo"
  }
}
```

```jsonc
// .grok/omg.jsonc — multi-CLI workers in tmux
{
  "autopilot": {
    "execution": "team",
    "team": {
      // grok | cursor | codex | claude | gemini | antigravity | executor
      "agentTypes": ["grok"]
    }
  }
}
```

### Watch team workers (when `execution: "team"`)

Grok’s chat UI does **not** auto-open OMC-style side panes. Process teams are **tmux-backed**.

```bash
node bin/omg.js team status          # or: omg team status
tmux ls                              # look for omg-omg-team-*
tmux attach -t <tmux_session>        # live worker pane (detach: Ctrl-b then d)
node bin/omg.js hud                  # one-line: team:name(Nxagent)
cat .omg/state/team-state.json
```

Manual team without full autopilot:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| Prefer **solo** when… | Prefer **team** when… |
|----------------------|------------------------|
| Day-to-day coding in one Grok window | Visible CLI workers in **tmux** |
| No tmux install/setup | Mixing **cursor / codex / gemini** workers |
| Fast feedback in the same transcript | Long parallel implementers isolated from the orchestrator |

**Default recommendation:** keep **`solo`** unless you already live in tmux or need multi-CLI isolation.

---

## What you get

| Surface | Count | Notes |
|---------|------:|-------|
| Agents | 20 | OMC set + `visual-designer` |
| Skills | 45 | omc→omg renames + `ui-mockup` + `web-research` + extras |
| MCP tools | ~54 | `omg-tools` via plugin `.mcp.json` |
| State | `.omg/` | specs, plans, artifacts, mode state |

### Grok exclusives

- **`/web-research`** — live docs, releases, issues, X signal → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → approval → Vision brief → code → Vision QA
- **Search-on-fail** — core skills prefer `web_search` before blind retries

### Review modes

- **`/security-review`** — or say `security review` / `보안 리뷰`
- **`/code-review`** — or say `code review` / `review this PR`

### Core skills (highlights)

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` (keyword + skill-injector) · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` (persistent-mode) · `SessionEnd` · cancel clears `.omg/state`

### MCP tools (`omg-tools`)

Plugin default server id **`omg-tools`** → `mcp/run-tools-server.mjs` → full tools (~54: LSP, AST, wiki, notepad, `state_*`, …).

```bash
npm run build && npm run build:bridge   # preferred CJS bundle
npm run mcp:probe                       # expect ~54 tools
```

Fallback if bridge missing: `dist/mcp/standalone-server.js` (after `npm run build`).  
Thin state-only server: `mcp/omg-state-server.mjs` (manual/debug, not default).

### Local CLI helpers

```bash
node bin/omg.js version
node bin/omg.js status      # file HUD + threshold
node bin/omg.js hud --preset focused   # persist omcHud.preset then render
node bin/omg.js state list
node bin/omg.js doctor
node bin/omg.js team status
npm test                    # smoke (build + foundation + hooks + team + hud)
npm run test:vitest:core    # product vitest gate (217)
npm run test:optional       # release dry-run + feature/drift smokes
```

---

## Project layout

```text
agents/           # subagent definitions
skills/*/SKILL.md # slash skills
hooks/            # hooks.json + scripts
src/              # TypeScript runtime (OMC-scale port)
dist/             # tsc output
bridge/           # esbuild CJS bundles (mcp-server, cli, team, …)
mcp/              # MCP launchers
bin/omg.js        # CLI entry (aliases: omg, omc, oh-my-grok)
docs/             # architecture, OMC pin, port status, migration
parity-review/    # evidence-based parity notes (not a product gate)
plugin.json       # Grok plugin manifest
```

---

## Development

```bash
npm run build
npm run build:bridge          # mcp/cli/runtime/team + team-bridge + skill-bridge + coordinator
npm run test:vitest:core      # product unit gate (217)
npm run test:smoke            # build + foundation + hooks + team + hud
npm run test:optional         # release pack dry-run + skill/drift smokes
npm run mcp:probe
node scripts/validate-parity.mjs
node scripts/port-inventory.mjs
node bin/omg.js doctor
grok plugin validate .
```

Re-port helpers after refreshing the OMC cache (see pin above):

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Product quality bar:** core vitest + smoke + MCP probe.  
**Full suite:** `npm run test:vitest` residual is **closed (0 fail)** as of 2026-07 — see [`parity-review/VITEST-RESIDUAL-2026-07-25.md`](parity-review/VITEST-RESIDUAL-2026-07-25.md).  
**Grok “done” vs Claude host clone:** [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md) · surface matrix: [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md).

### Docs map

| Doc | Purpose |
|-----|---------|
| [`docs/IMAGINE-VIDEO-ZDR.md`](docs/IMAGINE-VIDEO-ZDR.md) | ZDR video gen matrix + agent sink params |
| [`docs/design/imagine-video-zdr-host-contract.md`](docs/design/imagine-video-zdr-host-contract.md) | Host tool contract for platform P0 |
| [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md) | **Upstream pin / re-pin checklist** |
| [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md) | Surface-by-surface port status + intentional 🟡 |
| [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md) | What “done on Grok” means (not full host clone) |
| [`docs/HOOKS-PARITY.md`](docs/HOOKS-PARITY.md) | Hooks registration vs OMC |
| [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md) | First-run guide |
| [`docs/settings-schema.md`](docs/settings-schema.md) | Config keys (`autopilot.execution`, team, …) |
| [`docs/PARITY-MATRIX.md`](docs/PARITY-MATRIX.md) | Layer checklist |
| [`parity-review/`](parity-review/) | Evidence notes, residual close, optional wave 1–4 |

---

## License

MIT. Includes original copyright for oh-my-claudecode (Yeachan Heo and contributors) plus oh-my-grok contributors. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Credits

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — orchestration design, agents, skills, and runtime protocols
- xAI Grok Build — plugin / skills / hooks / MCP host runtime
