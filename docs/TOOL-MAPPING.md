# Tool & API Mapping (OMC → OMG)

## Invocation

| OMC | OMG |
|-----|-----|
| `Task(subagent_type="oh-my-claudecode:architect", ...)` | `spawn_subagent` with agent type `architect` (plugin agent) |
| `Skill("oh-my-claudecode:autopilot")` | `/autopilot` skill |
| `AskUserQuestion` | `ask_user_question` |
| `state_write` / `state_read` MCP | Read/write `.omg/state/*.json` with file tools (v0.1) |

## Filesystem tools

| Claude Code | Grok |
|-------------|------|
| Read | read_file |
| Write / Edit / MultiEdit | search_replace (and write paths as instructed by harness) |
| Grep | grep |
| Glob / LS | list_dir |
| Bash | run_terminal_command |
| TodoWrite | todo_write |
| WebSearch | web_search |
| WebFetch | web_fetch / open_page |

## Grok-only

| Capability | Tool |
|------------|------|
| Image generation | image_gen, image_edit |
| Vision (screenshots/mockups) | read_file on image paths |
| X / Twitter research | x_keyword_search, x_semantic_search, x_thread_fetch |

## Env vars (hooks)

| OMC | OMG |
|-----|-----|
| CLAUDE_PLUGIN_ROOT | GROK_PLUGIN_ROOT (Claude alias may still be set by harness) |
| CLAUDE_PLUGIN_DATA | GROK_PLUGIN_DATA |

## Models

OMC frontmatter `opus` / `sonnet` / `haiku` → OMG `model: inherit` (use session model). Document preferred reasoning effort in skill text when needed.
