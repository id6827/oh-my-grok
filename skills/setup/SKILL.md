---
name: setup
description: Use first for install/update routing — sends setup, doctor, or MCP requests to the correct OMG setup flow
---

# Setup

Use `/setup` as the unified setup/configuration entrypoint.

## Usage

```bash
/setup                # full setup wizard
/setup doctor         # installation diagnostics
/setup mcp            # MCP server configuration
/setup wizard --local # explicit wizard path
```

## Routing

Process the request by the **first argument only** so install/setup questions land on the right flow immediately:

- No argument, `wizard`, `local`, `global`, or `--force` -> route to `/omg-setup` with the same remaining args
- `doctor` -> route to `/omg-doctor` with everything after the `doctor` token
- `mcp` -> route to `/mcp-setup` with everything after the `mcp` token

Examples:

```bash
/setup --local          # => /omg-setup --local
/setup doctor --json    # => /omg-doctor --json
/setup mcp github       # => /mcp-setup github
```

## Notes

- `/omg-setup`, `/omg-doctor`, and `/mcp-setup` remain valid compatibility entrypoints.
- Prefer `/setup` in new documentation and user guidance.

Task: {{ARGUMENTS}}


## Grok Capability Extensions

- On build/test failures: use `web_search` / `web_fetch` for latest fixes and community issues before inventing workarounds.
- On UI work without a design: prefer the `/ui-mockup` skill (Image Gen → Vision analysis → code → Vision QA).
- For live docs/API research: use `/web-research` or call `web_search` directly.
- Prefer `spawn_subagent` with `isolation: "worktree"` for parallel executors when mutating code.
- Persist orchestration state under `.omg/` only (never `.omc/`).
- Use `ask_user_question` for structured one-at-a-time questions (not multi-question dumps).
