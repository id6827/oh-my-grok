# Optional wave 1→4 evidence (2026-07-26)

Scope: progressable optional work after parity residual close.  
**Not** skill-bridge force (5) or OMC 100% host clone (6).

## 1. `omg hud --preset`

| Check | Result |
|-------|--------|
| Commander `hud --preset` | persists `omcHud.preset` in `GROK_CONFIG_DIR/settings.json` |
| `bin/omg.js hud --preset=` | same |
| Unknown preset | exit ≠ 0 |
| Tests | `src/cli/__tests__/hud-preset.test.ts` (2 pass) |
| Docs | `skills/hud/SKILL.md` |

```bash
node bin/omg.js hud --preset minimal
npx vitest run src/cli/__tests__/hud-preset.test.ts
```

## 2. Release pack dry-run

| Check | Result |
|-------|--------|
| `npm run build:bridge` | ok |
| Required bridge files on disk | cli, coordinator, mcp-server, runtime-cli, team.js |
| Stage inject (gitignore workaround) | ok |
| Coordinator `--handshake` | engineVersion aligned |

```bash
node scripts/tests/test-release-pack-dry-run.mjs
# or
npm run test:optional
```

## 3. Feature skill smoke

| Skill | Present |
|-------|---------|
| ultragoal, autoresearch, ralph, ralplan, ultraqa | ✅ |
| skillify, learner, verify, hud, team, omg-doctor | ✅ |
| skills/* dirs | 45 |

```bash
node scripts/tests/test-feature-skill-smoke.mjs
```

## 4. workflow-drift-guard session smoke

| Check | Result |
|-------|--------|
| Registered on Stop + GROK_PLUGIN_ROOT | ✅ |
| Binary fork → block | ✅ |
| Open question → fail-open | ✅ |
| OMC_SKIP_HOOKS | ✅ |

```bash
node scripts/tests/test-workflow-drift-guard-smoke.mjs
```

## Commands (all)

```bash
npm run test:vitest:core
npm run test:optional
```

## Explicitly deferred

- **5** Full skill-bridge on UserPromptSubmit — product-subset conflict  
- **6** OMC host 100% clone — out of scope  
