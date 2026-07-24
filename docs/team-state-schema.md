# Team state schema

Path: `.omg/state/team-state.json`

Used by **`omg team`** and by **`/autopilot` when `autopilot.execution` is `"team"`**
(see [settings-schema.md](./settings-schema.md#autopilotexecution--autopilotteam) and
[README — solo vs team](../README.md#autopilot-execution-solo-vs-team)).

```json
{
  "active": true,
  "name": "omg-team-codex-abc123",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "agent": "codex|gemini|claude|cursor|grok|executor|antigravity",
  "count": 2,
  "task": "user task string",
  "tmux_session": "omg-omg-team-codex-abc123",
  "dry_run": false,
  "workers": [
    {
      "id": "worker-1",
      "status": "planned|running|done|failed",
      "heartbeat": ".omg/state/team-bridge/<name>/worker-1.heartbeat.json"
    }
  ]
}
```

Bridge artifacts: `.omg/state/team-bridge/<team-name>/plan.json`

## CLI

```bash
omg team 2:codex "review auth"
omg team 1:grok "echo ok" --dry-run
omg team status
omg team shutdown
omg team shutdown <name>
```

When `tmux` is missing, commands force dry-run and write plan JSON only.
