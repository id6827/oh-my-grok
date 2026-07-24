<!-- Ported/adapted from OMC MIT; see NOTICE -->
# Contributing to oh-my-grok

Thank you for your interest in contributing to oh-my-grok (OMG). This guide covers everything from forking to submitting your PR.

## 1. Audience & Prerequisites

Before you start, make sure you have:

- **Node.js** ≥ 20 (required; check with `node --version`)
- **npm** (comes with Node.js)
- **git** (for version control)
- **Grok Build** installed (to test in-session skills and commands)
- Basic familiarity with TypeScript, ESBuild, and git workflows

This guide assumes you're comfortable with terminal commands and git branching.

---

## 2. Fork & Clone

1. **Fork the repository** on GitHub by clicking the "Fork" button at https://github.com/Yeachan-Heo/oh-my-grok

2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/oh-my-grok.git
   cd oh-my-grok
   ```

3. **Add the upstream remote** so you can sync with the main repository:
   ```bash
   git remote add upstream https://github.com/Yeachan-Heo/oh-my-grok.git
   ```

4. **Verify your remotes**:
   ```bash
   git remote -v
   # origin    https://github.com/<your-username>/oh-my-grok.git (fetch)
   # origin    https://github.com/<your-username>/oh-my-grok.git (push)
   # upstream  https://github.com/Yeachan-Heo/oh-my-grok.git (fetch)
   # upstream  https://github.com/Yeachan-Heo/oh-my-grok.git (read-only)
   ```

5. **Check available branches**:
   ```bash
   git branch -r
   # origin/HEAD -> origin/main
   # origin/main
   # upstream/dev
   # upstream/main
   ```

Note: The repo has two main branches:
- **`upstream/dev`** — development branch (default for feature work)
- **`upstream/main`** — release branch (stable, production-ready)

---

## 3. Install & Build

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Understand the build chain** (from `package.json`):
   ```bash
   npm run build            # tsc → dist/ + runtime compat
   npm run build:bridge     # esbuild → bridge/*.cjs (gitignored, local/CI only)
   npm run build:all        # both
   npm run test:smoke       # hooks/team/hud foundation
   npm run test:vitest:core # pure unit slice (utils/config/session-id)
   npm run validate
   ```

   - `tsc` — TypeScript compilation `src/` → `dist/`
   - `build-runtime-compat.mjs` — re-exports under `dist/runtime/`
   - `build:bridge` — esbuild bundles for optional full MCP/CLI CJS (not committed)

3. **Build once**:
   ```bash
   npm run build
   ```

Primary product output is `dist/` + `mcp/omg-state-server.mjs`. Generate `bridge/*.cjs` only when needed; they are **gitignore** (see `bridge/README.md`). CI: `.github/workflows/ci.yml` runs smoke + core vitest + optional bridge build.

---

## 4. Linking Your Checkout as the Active OMG Plugin

Once built, you need to tell Grok Build to use your local checkout. Here are three flows:

### Bootstrap: make the `omg` command available

All three flows below use the `omg` CLI. If you don't have it installed globally (via `npm i -g oh-my-grok`), create a symlink from your checkout:

```bash
# Create ~/.local/bin if it doesn't exist
mkdir -p ~/.local/bin

# Symlink omg to the checkout CLI
ln -sf "$PWD/bin/omg.js" ~/.local/bin/omg

# Verify (you may need ~/.local/bin on your PATH)
omg --version
```

### Flow A: `omg --plugin-dir` + `omg setup --plugin-dir-mode` (recommended — lowest friction)

**Advantages**: Single command, automatic env var handling, matches the OMG philosophy.

```bash
# From your checkout directory
omg --plugin-dir "$PWD" setup --plugin-dir-mode
```

Then launch Grok Build normally — it will use your local checkout.

**Disable the `.mcp.json` server conflict**: The repo ships `.mcp.json` with an MCP server named `"t"` (the OMG bridge). When using `--plugin-dir`, the plugin also registers its own `"t"` server, causing a name collision. To resolve this, add to your `~/.claude/settings.json` (or `$CLAUDE_CONFIG_DIR/settings.json`):

```json
{
  "disabledMcpjsonServers": ["t"]
}
```

This tells Grok Build to ignore the repo's `.mcp.json` entry and use the plugin's version instead.

**Inside Grok Build**:
```bash
/autopilot "your task here"
```

**Rebuilding**: After code changes:
```bash
npm run build
omg setup --plugin-dir-mode  # or just re-run build and restart Grok Build
```

### Flow B: Marketplace lifecycle (if you prefer plugin system isolation)

**Advantages**: Uses Grok Build's native plugin system, marketplace semantics.

```bash
# Add local directory as a marketplace source
claude plugin marketplace add /path/to/oh-my-grok

# Install the plugin
claude plugin install oh-my-grok@oh-my-grok

# Run setup
/setup
```

**Rebuilding**: After code changes:
```bash
npm run build
claude plugin marketplace update oh-my-grok
claude plugin update oh-my-grok@oh-my-grok
/setup
```

### Flow C: `omg setup --no-plugin` (fallback, bundled skills)

**Advantages**: Forces local bundled skills to `~/.claude/skills/`, no plugin system.

```bash
omg --plugin-dir "$PWD" setup --no-plugin
```

This skips the plugin system entirely and installs agents/skills to your home directory.

### Comparison table

| Flow | Command | Plugin system? | Files location | Rebuild cost | Use when |
|------|---------|---|---|---|---|
| **A (recommended)** | `omg --plugin-dir "$PWD" setup --plugin-dir-mode` | Yes, via `--plugin-dir` | Live from checkout | Low (no copy on rebuild) | Developing OMG itself |
| **B** | `claude plugin marketplace add` + `install` | Yes, full marketplace | Plugin cache | Medium (marketplace update) | Testing plugin isolation |
| **C** | `omg setup --no-plugin` | No | `~/.claude/skills/` | Low (direct copy) | Fallback / troubleshooting |

---

## 5. Suggested Shell Aliases (Community, Not Enforced)

Add these to your `.bashrc` / `.zshrc` for a smoother dev workflow:

```bash
# Your OMG dev root (change path as needed)
export OMC_DEV_ROOT="$HOME/_Git/_Claude/oh-my-grok"

# Run OMG from your local checkout
alias omcdev='omg --plugin-dir "$OMC_DEV_ROOT"'

# Build quickly
alias omcbuild='(cd "$OMC_DEV_ROOT" && npm run build)'

# Run tests
alias omctest='(cd "$OMC_DEV_ROOT" && npm run test:run)'

# Full watch mode (tsc + esbuild)
alias omcwatch='(cd "$OMC_DEV_ROOT" && npm run dev:full)'
```

Then you can use:
```bash
omcbuild                                # Rebuild in 10–15 seconds
omcdev setup --plugin-dir-mode          # Link your checkout
omcwatch                                # Auto-rebuild on file changes
omctest                                 # Run test suite
```

---

## 6. Rebuilding After Changes

### TypeScript changes only

If you only edited `.ts` files in `src/` (no agent/skill markdown changes), choose one of:

```bash
# Option A: tsc-only quick feedback (no bundle rebuild)
npm run dev

# Option B: full bundle watch — tsc + esbuild steps in watch mode (recommended)
npm run dev:full
```

**Choose one, not both.** `npm run dev` gives faster feedback for type-checking but does not rebuild bundles under `dist/` or `bridge/`. `npm run dev:full` rebuilds everything on every change — use this when you need the full artifact up to date (e.g., testing the CLI end-to-end).

### Agent, skill, or command changes

After editing markdown files in `agents/`, `skills/`, or `commands/`:

```bash
npm run build
omg setup --plugin-dir-mode
```

The setup command re-reads the markdown files and refreshes the in-session command registry.

### Full build (recommended)

```bash
npm run build
```

Runs the complete pipeline: `tsc` → esbuild bundles → docs composition → all bridge artifacts.

### Generated `dist/` and `bridge/` changes are held

`npm run build` regenerates `dist/` and `bridge/`. **Do not commit these build artifacts in ordinary PRs.** They are gitignored, but tracked `bridge/*.cjs` bundles can appear modified after a rebuild. Committing them inflates the diff, causes merge conflicts, and obscures the source change.

Before committing, restore them:

```bash
git restore dist/ bridge/
```

The ordinary PR **No Committed Build Artifacts** job is a credential-free, candidate-side classifier. It is replaceable by the PR branch, is non-authoritative for every contributor and maintainer, and holds any candidate `dist/` or `bridge/` delta with `OWNER_CONFIRMATION_REQUIRED`; it cannot approve a generated change or authorize a merge.

A generated delta remains held until owners provide protected split-root authorization: workflow root **W** is the reviewed workflow commit on default `main`; verifier/manifest root **B** is the detached protected `dev` event-base commit. The protected evidence must bind the final PR head **H**, its unique merge base, and complete generated delta records, then be evaluated in a fresh eligible event after B exists. Before merge, target-branch governance must remove this ordinary candidate check from required checks or supersede it with the required protected split-root check.

---

## 7. Running Tests & Lint

### Run tests

```bash
# Interactive watch mode
npm test

# Run once and exit
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Run linter

```bash
npm run lint
```

### Format code

```bash
npm run format
```

All of these should pass before you submit a PR. GitHub CI will verify them.

---

## 8. Rebasing onto Upstream

When you're ready to sync with the latest upstream changes:

### For feature branches (target `upstream/dev`)

```bash
# Fetch the latest from upstream
git fetch upstream

# Rebase your branch onto dev
git rebase upstream/dev

# If conflicts: resolve them, then `git rebase --continue`

# Force-push to your fork (safe if no one else is on your branch)
git push --force-with-lease origin <your-branch>

# Re-run tests after rebase
npm run build
npm run test:run
```

### For release branches (target `upstream/main`)

```bash
# Fetch the latest from upstream
git fetch upstream

# Rebase your branch onto main (only if your PR targets main)
git rebase upstream/main

# Force-push to your fork
git push --force-with-lease origin <your-branch>

# Re-run tests
npm run build
npm run test:run
```

**Why `--force-with-lease`?** It's safer than `--force` because it aborts if someone else pushed to your branch since the last fetch.

---

## 9. Submitting a PR

1. **Push your branch** to your fork:
   ```bash
   git push origin <your-branch>
   ```

2. **Open a PR** on GitHub:
   - Go to https://github.com/Yeachan-Heo/oh-my-grok/pulls
   - Click "New pull request"
   - Select your fork and branch
   - Fill in the PR title and description
   - Reference any related issues (e.g., "Fixes #123")

3. **PR templates** (if present):
   - Check `.github/pull_request_template.md` for required sections
   - GitHub will auto-populate the template when you open the PR

4. **Release workflow** (advanced):
   - If your PR should trigger a release, you can invoke the `/oh-my-grok:release` skill
   - This is typically for maintainers; ask in the PR if unsure

5. **What happens next**:
   - GitHub Actions will run tests, linting, and build checks
   - Reviewers will provide feedback
   - Update your PR by pushing more commits to the same branch
   - Once approved, a maintainer will merge your PR

---

## 10. Troubleshooting

### "OMC_PLUGIN_ROOT is not set"

You're using `claude --plugin-dir` directly without the `omg` shim. Export it:

```bash
export OMC_PLUGIN_ROOT=/path/to/oh-my-grok
claude --plugin-dir /path/to/oh-my-grok
```

Or use the `omg` shim which sets it automatically:

```bash
omg --plugin-dir /path/to/oh-my-grok
```

### "Skills/agents not showing up after rebuild"

After `npm run build`, you must re-run setup to refresh the in-session command registry:

```bash
omg setup --plugin-dir-mode
```

Then restart Grok Build.

### Build fails with "esbuild: not found"

```bash
npm install
npm run build
```

If that doesn't work, clear and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests fail after rebase

```bash
# Clear caches and reinstall
npm ci
npm run test:run
```

### Plugin still showing old version

The plugin cache may need a refresh:

```bash
npm run build
omg setup --plugin-dir-mode
# Restart Grok Build
```

### Need more help?

Run the diagnostics tool:

```bash
omg doctor
omg doctor conflicts
omg doctor --plugin-dir /path/to/oh-my-grok
```

Or check the troubleshooting sections in:
- [LOCAL_PLUGIN_INSTALL.md](./docs/LOCAL_PLUGIN_INSTALL.md)
- [REFERENCE.md — Plugin directory flags](./docs/REFERENCE.md#plugin-directory-flags)

---

## Additional Resources

- **Main README**: [README.md](./README.md)
- **Quick Start**: [README.md#quick-start](./README.md#quick-start)
- **Reference Docs**: [docs/REFERENCE.md](./docs/REFERENCE.md)
- **Local Plugin Install**: [docs/LOCAL_PLUGIN_INSTALL.md](./docs/LOCAL_PLUGIN_INSTALL.md)
- **Getting Started**: [docs/GETTING-STARTED.md](./docs/GETTING-STARTED.md)
- **GitHub Issues**: https://github.com/Yeachan-Heo/oh-my-grok/issues
- **Discord Community**: https://discord.gg/jq6jnSGABY

Happy contributing!
