---
name: omg-setup
description: Install or refresh oh-my-grok for plugin, npm, and local-dev setups from the canonical setup flow
---

# OMG Setup

This is the **only command you need to learn**. After running this, everything else is automatic.

**When this skill is invoked, immediately execute the workflow below. Do not only restate or summarize these instructions back to the user.**

Note: All `~/.grok/...` paths in this guide respect `GROK_CONFIG_DIR` when that environment variable is set.

## Best-Fit Use

Choose this setup flow when the user wants to **install, refresh, or repair OMG itself**.

- Marketplace/plugin install users should land here after `/plugin install oh-my-grok`
- npm users should land here after `npm i -g oh-my-grok@latest`
- local-dev and worktree users should land here after updating the checked-out repo and rerunning setup

## Flag Parsing

Check for flags in the user's invocation:
- `--help` → Show Help Text (below) and stop
- `--local` → Phase 1 only (target=local), then stop
- `--global` → Phase 1 only (target=global), then stop
- `--force` → Skip Pre-Setup Check, run full setup (Phase 1 → 2 → 3 → 4)
- No flags → Run Pre-Setup Check, then full setup if needed

## Help Text

When user runs with `--help`, display this and stop:

```
OMG Setup - Configure oh-my-grok

USAGE:
  /omg-setup           Run initial setup wizard (or update if already configured)
  /omg-setup --local   Configure local project (.claude/CLAUDE.md)
  /omg-setup --global  Configure global settings (~/.grok/CLAUDE.md)
  /omg-setup --force   Force full setup wizard even if already configured
  /omg-setup --help    Show this help

MODES:
  Initial Setup (no flags)
    - Interactive wizard for first-time setup
    - Configures CLAUDE.md (local or global)
    - Sets up HUD statusline
    - Checks for updates
    - Offers MCP server configuration
    - Configures team mode defaults (agent count, type, model)
    - If already configured, offers quick update option

  Local Configuration (--local)
    - Invokes the plugin-local coordinator through `scripts/setup-claude-md.sh`; the shell validates the coordinator response and its exit status before any post-install work
    - Reports coordinator-created byte-identical backups only for files that required mutation
    - Project-specific settings
    - Use this to update project config after OMG upgrades

  Global Configuration (--global)
    - Invokes the plugin-local coordinator through `scripts/setup-claude-md.sh`; the shell validates the coordinator response and its exit status before any post-install work
    - Reports coordinator-created byte-identical backups only for changed global files
    - Default: explicitly overwrites ~/.grok/CLAUDE.md so plain `claude` also uses OMG
    - Optional preserve mode keeps the user's base `CLAUDE.md` and installs OMG into `CLAUDE-omg.md` for `omg` launches
    - Applies to all Grok Build sessions
    - Preserves same-named legacy hook files unless their exact historical contents are independently verified
    - Use this to update global config after OMG upgrades

  Force Full Setup (--force)
    - Bypasses the "already configured" check
    - Runs the complete setup wizard from scratch
    - Use when you want to reconfigure preferences

EXAMPLES:
  /omg-setup           # First time setup (or update CLAUDE.md if configured)
  /omg-setup --local   # Update this project
  /omg-setup --global  # Update all projects
  /omg-setup --force   # Re-run full setup wizard

For more info: https://github.com/Yeachan-Heo/oh-my-grok
```


## Setup Invocation

Do not independently scan plugin cache directories or select a plugin root in this skill. Invoke the setup script from the plugin root supplied by the running plugin environment:

```bash
bash "${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/scripts/setup-claude-md.sh" <local|global> [overwrite|preserve]
```

The script is the sole cache resolver. It accepts only complete plugin roots (canonical `docs/CLAUDE.md`, coordinator artifact, and `omg-reference` skill), chooses a strict full-SemVer cache version, verifies the compiled-source handshake, and fails closed on coordinator protocol or status disagreement. Do not download configuration or mutate `CLAUDE.md` outside that coordinator.

## Pre-Setup Check: Already Configured?

**CRITICAL**: Before doing anything else, check if setup has already been completed. This prevents users from having to re-run the full setup wizard after every update.

```bash
# Check if setup was already completed
CONFIG_FILE="${GROK_CONFIG_DIR:-$HOME/.claude}/.omg-config.json"

if [ -f "$CONFIG_FILE" ]; then
  SETUP_COMPLETED=$(jq -r '.setupCompleted // empty' "$CONFIG_FILE" 2>/dev/null)
  SETUP_VERSION=$(jq -r '.setupVersion // empty' "$CONFIG_FILE" 2>/dev/null)

  if [ -n "$SETUP_COMPLETED" ] && [ "$SETUP_COMPLETED" != "null" ]; then
    echo "OMG setup was already completed on: $SETUP_COMPLETED"
    [ -n "$SETUP_VERSION" ] && echo "Setup version: $SETUP_VERSION"
    ALREADY_CONFIGURED="true"
  fi
fi
```

### If Already Configured (and no --force flag)

If `ALREADY_CONFIGURED` is true AND the user did NOT pass `--force`, `--local`, or `--global` flags:

Use ask_user_question to prompt:

**Question:** "OMG is already configured. What would you like to do?"

**Options:**
1. **Update CLAUDE.md only** - Install the active plugin's canonical CLAUDE.md without re-running full setup
2. **Run full setup again** - Go through the complete setup wizard
3. **Cancel** - Exit without changes

**If user chooses "Update CLAUDE.md only":**
- Detect if local (.claude/CLAUDE.md) or global (~/.grok/CLAUDE.md) config exists
- If local exists, run: `bash "${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/scripts/setup-claude-md.sh" local`
- If only global exists, run: `bash "${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/scripts/setup-claude-md.sh" global`
- Skip all other steps
- Report success and exit

**If user chooses "Run full setup again":**
- Continue with Resume Detection below

**If user chooses "Cancel":**
- Exit without any changes

### Force Flag Override

If user passes `--force` flag, skip this check and proceed directly to setup.

## Resume Detection

Before starting any phase, check for existing state:

```bash
bash "${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/scripts/setup-progress.sh" resume
```

If state exists (output is not "fresh"), use ask_user_question to prompt:

**Question:** "Found a previous setup session. Would you like to resume or start fresh?"

**Options:**
1. **Resume from step $LAST_STEP** - Continue where you left off
2. **Start fresh** - Begin from the beginning (clears saved state)

If user chooses "Start fresh":
```bash
bash "${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/scripts/setup-progress.sh" clear
```

## Phase Execution

### For `--local` or `--global` flags:
Read the file at `${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/skills/omg-setup/phases/01-install-claude-md.md` and follow its instructions.
(The phase file handles early exit for flag mode.)

### For full setup (default or --force):
Execute phases sequentially. For each phase, read the corresponding file and follow its instructions:

1. **Phase 1 - Install CLAUDE.md**: Read `${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/skills/omg-setup/phases/01-install-claude-md.md` and follow its instructions.

2. **Phase 2 - Environment Configuration**: Read `${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/skills/omg-setup/phases/02-configure.md` and follow its instructions. Phase 2 must delegate HUD/statusLine setup to the `hud` skill; do not generate or patch `statusLine` paths inline here.

3. **Phase 3 - Integration Setup**: Read `${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/skills/omg-setup/phases/03-integrations.md` and follow its instructions.

4. **Phase 4 - Completion**: Read `${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/skills/omg-setup/phases/04-welcome.md` and follow its instructions.

## Graceful Interrupt Handling

**IMPORTANT**: This setup process saves progress after each phase via `${OMC_SETUP_PLUGIN_ROOT:-${GROK_PLUGIN_ROOT}}/scripts/setup-progress.sh`. If interrupted (Ctrl+C or connection loss), the setup can resume from where it left off.

## Keeping Up to Date

After installing oh-my-grok updates (via npm or plugin update):

**Automatic**: Just run `/omg-setup` - it will detect you've already configured and offer a quick "Update CLAUDE.md only" option that skips the full wizard.

**Manual options**:
- `/omg-setup --local` to update project config only
- `/omg-setup --global` to update global config only
- `/omg-setup --force` to re-run the full wizard (reconfigure preferences)

This ensures you have the newest features and agent configurations without the token cost of repeating the full setup.


## Grok Capability Extensions

- On build/test failures: use `web_search` / `web_fetch` for latest fixes and community issues before inventing workarounds.
- On UI work without a design: prefer the `/ui-mockup` skill (Image Gen → Vision analysis → code → Vision QA).
- For live docs/API research: use `/web-research` or call `web_search` directly.
- Prefer `spawn_subagent` with `isolation: "worktree"` for parallel executors when mutating code.
- Persist orchestration state under `.omg/` only (never `.omc/`).
- Use `ask_user_question` for structured one-at-a-time questions (not multi-question dumps).
