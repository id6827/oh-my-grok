# Changelog

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
