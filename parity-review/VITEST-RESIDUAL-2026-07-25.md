# Full vitest residual tracker (2026-07-25)

## Trajectory

| Metric | Value |
|--------|------:|
| Parity baseline | ~721 fail |
| Wave 1–2 | 119 → 77 |
| Wave 3 (`49ebf5a`) | **51 fail** |
| Wave 4 (`03cbfb0` + `8a94fe1`) | **21 fail / 11202 pass** |
| Wave 5 (this wave) | **0 fail / 11225 pass** |
| Core | **217/217** |
| Smoke | **green** |

**≈ −721 fails from parity baseline — full residual closed.**

### Wave 5 highlights

- **Production fixes**
  - Team-worker Bash guard: match `omg team` (not only `omc`/`omx`)
  - Keyword detector: treat `/oh-my-grok:` as explicit invocation prefix
  - `post-tool-use-failure`: dual-read `OMG_SESSION_ID` then `OMC_SESSION_ID`
  - `getTeamTmuxSessions`: dual-read `omg-team-*` and legacy `omc-team-*`
  - Model routing three-site sync: templates lib OMG wording matches scripts/bridge
  - `ask` prompts dir: dual-read `.omg` / `.omx` setup-scope; tests clear host `CODEX_HOME`
  - Built `bridge/claude-md-coordinator.cjs` for coordinator transaction tests

- **Soft-align tests** to OMG packaging (`.grok`, plugin-first hooks, Grok Build team wording, first-class `code-review` / `security-review`, npm bin missing-bridge tolerance, HUD single package name, tool-error boundary margin, owner-epoch ESRCH death)

### Remaining (vitest)

None for full vitest residual (0 fails).

### Related parity follow-ups (not vitest)

See `.omg/plans/ralplan-omc-omg-parity-gap-2026-07-25.md`:

- Default `build:bridge` now includes team-bridge + skill-bridge + coordinator (packaging wave)
- Release pack still needs `build:bridge` before archive if coordinator is required
- Intentional 🟡 product partials (feature engines, workflow-drift-guard, HUD presets) need promote-or-freeze

## Product gates

```bash
npm run test:vitest:core
npm run test:smoke
npm run mcp:probe
npm run build:bridge
npm run plugin:shipping:verify
```
