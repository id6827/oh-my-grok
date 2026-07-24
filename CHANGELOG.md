# Changelog

## 0.2.0 — 2026-07-24

### Added (Layer B — orchestration hooks)

- `UserPromptSubmit` **keyword-detector**: routes `deep-interview`, `autopilot`, `ralph`, `ulw`/`ultrawork`, `ralplan`, `ultraqa`, `ui-mockup`, `web-research`, `cancelomg` via `additionalContext` and seeds `.omg/state/*-state.json`.
- `Stop` **stop-continuation**: blocks end-of-turn while an OMG mode is `active` under `.omg/state/` (deep-interview / autopilot / ralph / …), with fail-open guards.
- Shared hook helpers in `hooks/scripts/lib/hook-io.mjs`.

### Notes

- Simplified vs full OMC hook graph (no skill-injector MCP, no HUD binary, no flock workflows).
- Keyword activation does not overwrite rich deep-interview state files that already contain `interview_id` / rounds.

## 0.1.0 — 2026-07-24

### Added

- Initial Grok Build plugin scaffold (`plugin.json`, hooks, docs).
- Port of 19 OMC agents to Grok tool/path conventions + `visual-designer`.
- Port of 41 OMC skills (omc-* → omg-*) with `.omg/` state contract.
- Grok-exclusive skills: `ui-mockup`, `web-research`.
- SessionStart hook ensuring `.omg/` directories.
- Scripts: `port-from-omc.mjs`, `validate-parity.mjs`, `smoke-skills.sh`.
- Documentation: GETTING-STARTED, PARITY-MATRIX, TOOL-MAPPING, MIGRATION, ARCHITECTURE.

### Notes

- Layer B runtime (keyword detector, Stop gates, HUD binary, tmux team CLI) deferred.
- Derived from oh-my-claudecode under MIT.
