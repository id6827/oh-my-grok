# oh-my-grok project rules

## Identity

This repository is the **oh-my-grok (OMG)** Grok Build plugin: multi-agent orchestration ported from OMC with Grok web search, image gen, and vision QA.

## State contract

- All runtime state, specs, plans, and artifacts go under **`.omg/`**.
- Never write OMC paths (`.omc/`) in new code or prompts.
- `.omg/skills/**` may be committed; other `.omg/**` is local (see `.gitignore`).

## Tool conventions (Grok)

| Prefer | Avoid (Claude-era) |
|--------|--------------------|
| `spawn_subagent` | `Task(...)` |
| `ask_user_question` | `AskUserQuestion` |
| `read_file` / `grep` / `list_dir` / `run_terminal_command` | Read / Grep / Glob / Bash |
| `search_replace` | Edit / Write / MultiEdit |
| `web_search` / `web_fetch` | undocumented search |
| `image_gen` / `image_edit` | external mockup-only tools |

## Orchestration defaults

1. Vague product ideas → `/deep-interview` before code.
2. Spec ready → `/ralplan` for consensus, then explicit approval for execution.
3. Execution → `/autopilot` or `/ralph` / `/team` as appropriate.
4. UI without design → `/ui-mockup`.
5. Ecosystem unknowns → `/web-research`.

## Plugin packaging

- Manifest: root `plugin.json` (no fake `entry` fields).
- Skills: `skills/<name>/SKILL.md`.
- Agents: `agents/<name>.md`.
- Hooks: `hooks/hooks.json`.
- Install: `grok plugin install <path-or-repo> --trust` (there is no `plugin publish` / `plugin link`).

## When editing prompts

- Preserve OMC behavioral contracts (ambiguity gates, approval bridges, phase order).
- Keep MIT attribution when copying OMC-derived text.
- After bulk OMC refresh, run `node scripts/port-from-omc.mjs` then `node scripts/validate-parity.mjs`.
