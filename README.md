# oh-my-grok (OMG)

**Multi-agent orchestration for [Grok Build](https://x.ai) / Grok CLI.**

Ported from [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) with Grok-native upgrades: **real-time web/X search**, **Image Gen UI mockups**, and **Vision UI QA**.

> Don't learn the harness. Just use OMG.

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

## Recommended pipeline

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  implement → QA → multi-agent validation
```

Cancel anytime with `/cancel`. State lives under **`.omg/`** (not `.omc/`).

## Autopilot execution: `solo` vs `team`

`/autopilot` always orchestrates **agents + skills**. How the **implementation stage** runs depends on config — pick what matches your taste.

| Mode | Config | How work runs | What you see |
|------|--------|---------------|--------------|
| **`solo`** (default) | omit `execution`, or `"solo"` | In-session `spawn_subagent` + skill routing | Same Grok chat; **no** tmux panes |
| **`team`** | `"execution": "team"` | Implementation via `omg team` CLI workers | **tmux** sessions (`omg-omg-team-…`); HUD `team:…` |

### Configure (project or user)

**Project** (recommended for one repo): `.grok/omg.jsonc`  
**User** (all projects): `~/.config/grok-omg/config.jsonc`  
Project wins over user. Full keys: [docs/settings-schema.md](docs/settings-schema.md).

```jsonc
// .grok/omg.jsonc — default mental model: stay in this Grok session
{
  "autopilot": {
    "execution": "solo"
  }
}
```

```jsonc
// .grok/omg.jsonc — OMC-like multi-CLI workers in tmux
{
  "autopilot": {
    "execution": "team",
    "team": {
      // one or more: grok | cursor | codex | claude | gemini | antigravity | executor
      "agentTypes": ["grok"]
    }
  }
}
```

### Watch team workers (when `execution: "team"`)

Grok’s chat UI does **not** auto-open OMC-style side panes. That is expected: process teams are **tmux-backed**.

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

### Which should you use?

| Prefer **solo** when… | Prefer **team** when… |
|----------------------|------------------------|
| Day-to-day coding in one Grok window | You want visible CLI workers in **tmux** |
| You don’t want to install/use tmux | Mixing **cursor / codex / gemini** workers |
| Fast feedback in the same transcript | Long parallel implementers isolated from the orchestrator |
| macOS laptop, minimal setup | CI/server or multi-provider execution |

**Opinion / default:** keep **`solo`** unless you already live in tmux or need multi-CLI isolation. Solo is the lower-friction Grok-native path; team is the power path when you want process-level workers and OMC-like pane visibility via `tmux attach`.

## What you get

| Surface | Count | Notes |
|---------|------:|-------|
| Agents | 20 | OMC 19 + `visual-designer` |
| Skills | 43 | OMC 41 (omc→omg rename) + `ui-mockup` + `web-research` |
| Hooks | SessionStart | Ensures `.omg/` tree |

### Grok exclusives

- **`/web-research`** — live docs, releases, issues, X signal → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → approval → Vision brief → code → Vision QA
- **Search-on-fail** — core skills instruct `web_search` before blind retries

### Review modes (OMC keyword parity)

- **`/security-review`** — or say `security review` / `보안 리뷰` → security-reviewer agent
- **`/code-review`** — or say `code review` / `review this PR` → code-reviewer agent

### Core skills (OMC parity)

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, …

### Hooks (Layer B, v0.5)

`SessionStart` · `UserPromptSubmit` (keyword + skill-injector) · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · cancel clears `.omg/state`

### MCP tools (`omg-tools`)

Plugin `.mcp.json` default server id **`omg-tools`** → `mcp/run-tools-server.mjs` → full tools (~54: LSP, AST, wiki, notepad, `state_*`, …).

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
node bin/omg.js state list
node bin/omg.js doctor
npm test
```

### Similarity (Strict)

**Each layer A/B/C/D must be ≥90** (not just a weighted average).
v0.7: **A93 / B91 / C90 / D90** — see [docs/SIMILARITY.md](docs/SIMILARITY.md).

## Parity layers (v0.7)

| Layer | Score (Strict ≥90) |
|-------|-------------------:|
| A Prompt/skills | 93 |
| B Hooks | 91 |
| C Runtime/team/MCP | 90 |
| D HUD | 90 |

See [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md), [docs/SIMILARITY.md](docs/SIMILARITY.md).

## Project layout

```text
agents/           # subagent definitions
skills/*/SKILL.md # slash skills
hooks/            # hooks.json + scripts
docs/             # architecture, parity, migration
scripts/          # port + validate + smoke
plugin.json       # Grok plugin manifest
```

## Development

```bash
node scripts/validate-parity.mjs
./scripts/smoke-skills.sh
grok plugin validate .
# re-port helpers after refreshing OMC cache:
# node scripts/port-from-omc.mjs
```

## License

MIT. Includes original copyright for oh-my-claudecode (Yeachan Heo and contributors) plus oh-my-grok contributors. See [LICENSE](LICENSE).

## Credits

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) — orchestration design, agents, and skill protocols
- xAI Grok Build — plugin/skills/hooks runtime
