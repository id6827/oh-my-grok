# OMC ↔ OMG Hooks Parity

OMC reference scripts under `scripts/*.mjs` (oh-my-claudecode).  
OMG hooks under `hooks/scripts/` + `hooks/hooks.json`.

| OMC script | OMG | Notes |
|------------|-----|-------|
| keyword-detector.mjs | ✅ keyword-detector.mjs | Core keywords + atomic state |
| skill-injector.mjs | ✅ skill-injector.mjs | Active mode reinject |
| session-start.mjs | ✅ session-start.sh | Banner + HUD seed |
| session-end.mjs | ✅ session-end.mjs | Stamp + HUD |
| pre-tool-enforcer.mjs | ✅ pre-tool-enforcer.mjs | Catastrophic shell deny |
| post-tool-verifier.mjs | ✅ post-tool-verifier.mjs | Failure hint when modes active |
| post-tool-use-failure.mjs | ✅ post-tool-failure.mjs | last-tool-failure.json |
| pre-compact.mjs | ✅ pre-compact.mjs | Snapshot + reminder |
| subagent-tracker.mjs | ✅ subagent-tracker.mjs | subagent-tracking.json |
| stop / persistent-mode / context-guard-stop | ✅ stop-continuation.mjs | Mode + PRD-aware block |
| project-memory-* | 🟡 skill-active-guard.mjs | Consistency stamp (lighter) |
| permission-handler.mjs | ❌ | Grok permission model differs |
| status.mjs / HUD | ✅ omg-hud.mjs + refreshHud | File + --watch |
| wiki-* | 🟡 | Skill only |
| setup-init/maintenance | 🟡 omg setup | |
| cleanup-orphans / team | ✅ runtime team + omg team | dry-run if no tmux |
| openclaw / review-gate / workflow-drift | ❌ | Deferred / N/A |
| build-* / release / eval | ❌ | Dev tooling not ported |

## Registered Grok events (`hooks/hooks.json`)

SessionStart, SessionEnd, UserPromptSubmit (keyword + injector + skill-active-guard),  
PreToolUse, PostToolUse, PostToolUseFailure, SubagentStart, SubagentStop, PreCompact, Stop.

## Runtime package

- Source: `runtime/src/*.ts`
- Build: `npm run build` → `dist/runtime/`
- Atomic writes: `atomic-write.ts` / `hooks/scripts/lib/atomic-write.mjs`
