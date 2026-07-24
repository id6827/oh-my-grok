# Getting Started with oh-my-grok

## Prerequisites

- Grok CLI / Grok Build installed and authenticated
- Network access for web research and image gen features

## Install (local dev)

```bash
cd /path/to/oh-my-grok
grok plugin validate .
grok plugin install . --trust
grok plugin enable oh-my-grok
grok plugin details oh-my-grok
```

Restart or open a new Grok session in your target project.

## First session

1. **Clarify** (optional but recommended for vague ideas):

   ```text
   /deep-interview "build a personal finance CLI"
   ```

2. **Plan** with multi-agent consensus:

   ```text
   /ralplan
   ```

3. **Build**:

   ```text
   /autopilot
   ```

4. **Research** (anytime):

   ```text
   /web-research "node 22 fetch undici changes"
   ```

5. **UI** (frontend):

   ```text
   /ui-mockup "mobile expense list with weekly chart"
   ```

## State location

OMG writes to `.omg/` in the project:

- `specs/` — deep-interview outputs
- `plans/` — ralplan / autopilot plans
- `state/` — resumable mode state
- `artifacts/` — research briefs, UI mockup packages

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Skill not in `/` menu | `grok plugin enable oh-my-grok` and restart session; check `grok inspect` |
| Hooks not running | Project may need trust; install with `--trust` |
| Paths still mention `.omc` | Upgrade plugin; OMG uses `.omg` only |
| Plugin validate fails | Ensure root `plugin.json` and convention dirs |

## Uninstall

```bash
grok plugin uninstall oh-my-grok --confirm
```
