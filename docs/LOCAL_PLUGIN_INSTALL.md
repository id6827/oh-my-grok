<!-- Ported from oh-my-claudecode docs (MIT) — see NOTICE. Adapted for oh-my-grok / Grok Build. -->

# Local Plugin Installation

How to install oh-my-grok from a local development directory as a Grok Build plugin.

## When to use this guide

Use this document for **local development checkouts and git worktrees** where you want Grok Build to load the plugin from your current repo state.

- **Marketplace/plugin users**: prefer the README quick-start flow
- **npm users**: prefer `npm i -g oh-my-grok@latest`; npm installs expose both `oh-my-grok` and `omg` command aliases
- **Local-dev/worktree users**: use this guide so the installed plugin matches the branch/worktree you are editing

## Quick Install

```bash
# 1. Add local directory as a marketplace
claude plugin marketplace add /path/to/oh-my-grok

# 2. Install the plugin from the local marketplace
claude plugin install oh-my-grok@oh-my-grok

# 3. Re-run setup inside Grok Build so CLAUDE.md / skills reflect this checkout
/setup

# 4. Restart Grok Build to pick up the plugin
```

## Commands Reference

```bash
# List configured marketplaces
claude plugin marketplace list

# Update marketplace (re-read from source)
claude plugin marketplace update oh-my-grok

# Update the installed plugin
claude plugin update oh-my-grok@oh-my-grok

# List installed plugins
claude plugin list

# Uninstall
claude plugin uninstall oh-my-grok@oh-my-grok

# Remove marketplace
claude plugin marketplace remove oh-my-grok
```

## Plugin Structure

The plugin requires a `plugin.json` manifest:

```json
{
  "name": "oh-my-grok",
  "version": "3.4.0",
  "description": "Multi-agent orchestration system for Grok Build",
  "hooks": {
    "PreToolUse": ["scripts/pre-tool-enforcer.mjs"],
    "PostToolUse": ["scripts/post-tool-verifier.mjs"],
    "SessionStart": ["scripts/session-start.mjs"]
  },
  "agents": ["agents/*.md"],
  "commands": ["commands/**/*.md"],
  "skills": ["skills/*.md"]
}
```

## Development Workflow

> **Hot reload caveat**: `claude plugin marketplace add <local-folder>` copies/caches plugin contents under `~/.grok/plugins/cache/` — it does **not** watch your checkout. Every edit to agents, skills, or commands requires the explicit `marketplace update` + `plugin update` + re-run setup dance below. For a no-cache dev loop where changes are picked up without marketplace refresh, use the `--plugin-dir` flow in the [Alternative section](#alternative---plugin-dir-no-marketplace) instead.

After making changes to the plugin (including from a linked git worktree):

```bash
# 1. Build (if TypeScript changes)
npm run build

# 2. Update the marketplace cache
claude plugin marketplace update oh-my-grok

# 3. Update the installed plugin
claude plugin update oh-my-grok@oh-my-grok

# 4. Re-run setup in Grok Build so prompts/skills match the refreshed plugin
/setup

# 5. Restart Grok Build session
```

## Vs. npm Global Install

| Method | Command | Files Location |
|--------|---------|----------------|
| Plugin | `claude plugin install` | `~/.grok/plugins/cache/` |
| npm global | `npm install -g` | `~/.grok/agents/`, `~/.grok/commands/` |

**Plugin mode is preferred** - it keeps files isolated and uses the native Grok Build plugin system with `${GROK_PLUGIN_ROOT}` variable for path resolution.

## Alternative: `--plugin-dir` (no marketplace)

If you prefer not to use the marketplace system, you can launch Grok Build directly with `--plugin-dir`:

```bash
export OMC_PLUGIN_ROOT=/path/to/oh-my-grok
claude --plugin-dir /path/to/oh-my-grok
omg setup --plugin-dir-mode
```

Or use the npm CLI shim (`omg`, or `oh-my-grok` if you prefer the long alias) which handles `--plugin-dir` automatically:

```bash
omg --plugin-dir /path/to/oh-my-grok setup --plugin-dir-mode
# Equivalent long alias:
oh-my-grok --plugin-dir /path/to/oh-my-grok setup --plugin-dir-mode
```

**Key differences from marketplace:**
- Plugin is loaded directly from your filesystem (no cache)
- Changes to agent/skill files take effect after re-running `omg setup`
- No marketplace update step needed — just rebuild and re-run setup
- Requires manual `OMC_PLUGIN_ROOT` export if using `claude` directly (the `omg` / `oh-my-grok` shims set it for you)

For the full decision matrix and authoritative plugin-dir documentation, see the [Plugin directory flags section in REFERENCE.md](./REFERENCE.md#plugin-directory-flags).

## Troubleshooting

**Plugin not loading:**
- Restart Grok Build after installation
- Check `claude plugin list` shows status as "enabled"
- Verify plugin.json exists and is valid JSON

**Old version showing:**
- The cache directory name may show old version, but the actual code is from latest commit
- Run `claude plugin marketplace update` then `claude plugin update`

**Using `--plugin-dir` or `--plugin-dir-mode`?**
- Verify `OMC_PLUGIN_ROOT` is set: `echo $OMC_PLUGIN_ROOT`
- If using `claude --plugin-dir` directly (not `omg --plugin-dir`), export `OMC_PLUGIN_ROOT` manually
- Run `omg doctor --plugin-dir /path/to/oh-my-grok` (or `oh-my-grok doctor --plugin-dir /path/to/oh-my-grok`) to diagnose issues
