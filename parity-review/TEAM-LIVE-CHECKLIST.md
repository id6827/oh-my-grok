# Live team checklist (B) — 2026-07-25

## Config (A)
- File: `.grok/omg.jsonc`
- `autopilot.execution`: **team**
- `autopilot.team.agentTypes`: **["grok"]**

## Commands used
```bash
node bin/omg.js team 1:grok "parity-check: echo hello..."
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session from team-state>
omg hud
node bin/omg.js team shutdown
```

## What you should have seen
1. **team-state.json** with `dry_run: false` and `tmux_session`
2. **tmux ls** listing that session
3. **`tmux attach`** (interactive) shows worker pane output — attach is interactive; we used `capture-pane` instead
4. **omg team status** shows workers
5. After shutdown, status clears / session ends

## Logs
- `.omg/artifacts/parity-review/2026-07-25/logs/team-live-*.txt`
- Viewable summary: this file under `parity-review/`

## Actual results (first run + resume)

### First run
```
team create exit: 0
name: omg-team-grok-z8b68v
tmux: omg-omg-team-grok-z8b68v
dry_run: false
HUD: team:omg-team-grok-z8b68v(1xgrok)
```

### Resume run (same session continued later)
```
team create exit: 0
name: omg-team-grok-z8fvii
tmux: omg-omg-team-grok-z8fvii
dry_run: false
status workers: running → shutdown active:false
capture-pane: task echo visible in worker pane
HUD: team:omg-team-grok-z8fvii(1xgrok)
```

Logs: `.omg/artifacts/parity-review/2026-07-25/logs/team-live-resume*.txt`

**A+B status: DONE** — config team mode + live tmux team verified twice.
