<!-- Ported from oh-my-claudecode docs (MIT) — see NOTICE. Adapted for oh-my-grok / Grok Build. -->

# Settings Schema

This page documents OMG-owned configuration keys in the standard OMG config files:

- Project: `.grok/omg.jsonc`
- User: `~/.config/grok-omg/config.jsonc`

Project config overrides user config.

## `omg.companyContext` / `companyContext`

Issue #2692 and the PR #2694 follow-up review refer to this setting as `omg.companyContext`.
In the current OMG config surface, the same block is written as the top-level
`companyContext` object inside the OMG config files above.

```jsonc
{
  "companyContext": {
    "tool": "mcp__vendor__get_company_context",
    "onError": "warn"
  }
}
```

### Fields

| Field | Type | Required | Default | Meaning |
|-------|------|----------|---------|---------|
| `tool` | `string` | No | none | Full MCP tool name to call, for example `mcp__vendor__get_company_context` |
| `onError` | `"warn" \| "silent" \| "fail"` | No | `"warn"` | How prompt workflows react when the configured company-context tool call fails |

### Behavior

- If `companyContext` is omitted, the feature is off and workflows continue normally.
- If `tool` is configured, supported workflow prompts may call that MCP tool at their documented stage.
- `onError: "warn"` notes the failure and continues.
- `onError: "silent"` continues without an extra note.
- `onError: "fail"` stops and surfaces the tool-call error.

This remains a prompt-level workflow contract, not runtime enforcement. For the
full interface, trust boundary, trigger stages, and residual risk, see
[`company-context-interface.md`](./company-context-interface.md).

## `keywordDetector.disabled`

Opt out of auto-routing for specific keyword-detector skills without turning the
whole hook off. The UserPromptSubmit keyword detector routes shipped skill names
such as `ralph`, `autopilot`, `ralplan`, `deep-interview`, `ai-slop-cleaner`,
`tdd`, `code-review`, `security-review`, `ultrathink`, `deepsearch`, and
`analyze`. List the routed skill names to suppress here.

Read from the OMG config surface above, project `.grok/omg.jsonc` first, then
user `~/.config/grok-omg/config.jsonc` (project takes precedence).

```jsonc
{
  "keywordDetector": {
    // routed skill names to stop auto-routing; "cancel" cannot be disabled
    "disabled": ["deepsearch"]
  }
}
```

### Behavior

- Omitted or empty array: no change, every keyword routes as before.
- A listed skill is dropped before conflict resolution, so neither its magic-keyword invocation nor its mode-injection context is emitted.
- `cancel` is never disableable, even if listed: it is the emergency stop for active modes.
- To disable all keyword routing at once instead, set `OMC_SKIP_HOOKS=keyword-detector`.

## `autopilot.execution` / `autopilot.team`

Controls **how `/autopilot` runs the implementation stage** — not whether agents or
skills are used (they always are).

| Value | Default | Implementation stage | Observation |
|-------|---------|----------------------|-------------|
| `"solo"` | **yes** (when omitted) | In-session `spawn_subagent` + skill routing | Same Grok session; no tmux |
| `"team"` | no | `omg team` / CLI workers in **tmux** | `tmux attach`, `omg team status`, HUD `team:…` |

```jsonc
// Project: .grok/omg.jsonc  |  User: ~/.config/grok-omg/config.jsonc
{
  "autopilot": {
    // "solo" | "team"  — omit for solo
    "execution": "solo"
  }
}
```

```jsonc
{
  "autopilot": {
    "execution": "team",
    "team": {
      // Worker CLIs for implementation (not reviewers). First available type is used
      // when launching a worker pool; list preferred providers for your machine.
      "agentTypes": ["grok"] // or ["cursor"], ["codex"], ["grok", "cursor"], …
    }
  }
}
```

### Fields

| Field | Type | Required | Default | Meaning |
|-------|------|----------|---------|---------|
| `autopilot.execution` | `"solo" \| "team"` | No | `"solo"` | Implementation runtime |
| `autopilot.team.agentTypes` | `string[]` | When `execution` is `"team"` | host-dependent | CLI worker kinds: `grok`, `cursor`, `codex`, `claude`, `gemini`, `antigravity`, `executor` |

### Behavior notes

- **Solo:** planning / QA / validation can still spawn specialist agents in-session; you will not see `omg-omg-team-*` tmux sessions for that path.
- **Team:** needs a working **tmux** (or dry-run only). Workers appear under `.omg/state/team-state.json` and `.omg/state/team-bridge/<name>/`.
- Reviewer roles (architect, critic, security-reviewer, code-reviewer) stay on native OMG agents unless you deliberately run a separate `omg team` for that work.
- Project config overrides user config for these keys.

### Related docs

- [README — Autopilot execution](../README.md#autopilot-execution-solo-vs-team)
- [team-state-schema.md](./team-state-schema.md)
- Skill: `skills/autopilot/SKILL.md` (execution examples)

## `autopilot.workflows`

Define reusable, named fixed-stage profiles for `/autopilot`. A profile is selected
only with `/autopilot --workflow <name> <task>`; names do not create commands,
modes, state files, or plugins.

Runtime support for named profiles requires Linux with the `flock` utility in v1. Unsupported environments reject explicit `--workflow` activation before creating or changing autopilot state; this does not affect legacy autopilot invocations.

```jsonc
{
  "autopilot": {
    "workflows": {
      "plan-build-qa": {
        "version": 1,
        "stages": ["ralplan", "execution", "qa"]
      }
    }
  }
}
```

### Profile contract

- `workflows` is an object map. Names must match `^[a-z][a-z0-9-]{0,62}$` and
  cannot use built-in stage, autopilot, mode, or deprecated alias names (including
  `autopilot`, `ralplan`, `execution`, `ralph`, `qa`, `ultrawork`, and
  `ultrapilot`).
- Each profile has exactly two required fields: `version`, which must be the number
  `1`, and `stages`.
- `stages` must be exactly one of these sequences:
  - `["ralplan", "execution"]`
  - `["ralplan", "execution", "ralph"]`
  - `["ralplan", "execution", "qa"]`
  - `["ralplan", "execution", "ralph", "qa"]`
- Unknown profile fields are rejected. In particular, `stageModels` is not
  supported in v1; workflow-specific model routing, inline execution, arbitrary
  stages, and dynamic commands/modes are intentionally deferred.

### Source and merge behavior

User and project workflow blocks are independently validated before configuration
merge. Errors identify the source (`user` or `project`) and the failing profile
path. Different names compose. When project and user configuration define the same
name, the project profile replaces the entire user profile rather than merging its
fields. Environment variables do not define or replace workflow profiles.

When no profiles are configured, `/autopilot` keeps its existing behavior.
