# Migration: OMC → OMG

## For users coming from oh-my-claudecode

| OMC habit | OMG equivalent |
|-----------|----------------|
| `/plugin install oh-my-claudecode` | `grok plugin install <owner>/oh-my-grok --trust` |
| `.omc/` directory | `.omg/` directory |
| `/omc-setup` | `/omg-setup` or `/setup` |
| `/omc-doctor` | `/omg-doctor` |
| Claude Code session | Grok Build / `grok` TUI session |
| `omc team N:codex` | Not yet; use `/team` with Grok subagents |

## Copying artifacts

```bash
# Optional one-time copy of specs/plans (review before use)
mkdir -p .omg
cp -R .omc/specs .omg/ 2>/dev/null || true
cp -R .omc/plans .omg/ 2>/dev/null || true
```

Update internal links in copied markdown from `.omc/` to `.omg/`.

## License

OMG is MIT and retains OMC copyright notices for derived prompts. See LICENSE.
