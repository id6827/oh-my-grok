<!-- Ported from oh-my-claudecode (MIT) — see NOTICE. -->

## Install / Upgrade

The npm CLI and the Grok Build marketplace/plugin are separate install tracks, not either/or replacements. Update whichever track you use; if you have both installed, update both. CLI-dependent skill paths such as `ask`, `ccg`, and CLI-backed `team` require the `omg` CLI from the npm package.

**CLI / runtime:**

```bash
npm i -g oh-my-grok@{{VERSION}}
```

**Grok Build plugin:**

```text
/plugin marketplace update omg
```

> **Package naming note:** the repo, plugin, and commands are branded **oh-my-grok**, but the published npm package name remains [`oh-my-grok`](https://www.npmjs.com/package/oh-my-grok).
