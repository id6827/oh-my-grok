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

### MCP state tools

Plugin `.mcp.json` exposes **omg-state**: `state_list_active`, `state_read`, `state_write`, `state_clear`.

### Local CLI helpers

```bash
node bin/omg.js version
node bin/omg.js status      # file HUD + threshold
node bin/omg.js state list
node bin/omg.js doctor
npm test
```

### Similarity

Flow-weighted OMC parity target **≥80%** — see [docs/SIMILARITY.md](docs/SIMILARITY.md).

## Parity layers

| Layer | Status in v0.1 |
|-------|----------------|
| **A. Behavioral / prompts** | Agents + skills ported |
| **B. Runtime** (keyword detector, Stop gates, HUD, tmux team, full MCP) | Minimal SessionStart only; more in later versions |

See [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md).

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
