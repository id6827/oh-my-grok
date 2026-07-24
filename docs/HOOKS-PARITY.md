# OMC ↔ OMG Hooks Parity

OMC reference scripts under `scripts/*.mjs` (oh-my-claudecode **4.15.7**).  
OMG hooks under `hooks/scripts/` + `hooks/hooks.json` + built `dist/hooks/*`.

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
| stop / persistent-mode / context-guard-stop | ✅ stop-continuation + context-guard-stop | Mode + PRD-aware block |
| project-memory-* | ✅ registered | Loads `dist/hooks/project-memory` |
| permission-handler.mjs | ✅ registered | Fail-open on Grok; uses dist |
| status.mjs / HUD | ✅ omg-hud.mjs + status.mjs | File + --watch |
| wiki-* | ✅ registered | `dist/hooks/wiki` |
| setup-init/maintenance | ✅ registered | matchers init/maintenance |
| cleanup-orphans / team | ✅ cleanup-orphans + omg team | dry-run if no tmux |
| review-gate / verify-deliverables | ✅ registered on Stop | Fail-open if no deliverables |
| post-tool-rules-injector | ✅ registered | |
| workflow-drift-guard | 🟡 file present | not always registered |
| openclaw | N/A | |
| build-* / release / eval | ❌ | Dev tooling optional |

## Registered Grok events (`hooks/hooks.json` v0.9)

SessionStart (+ project-memory + wiki + setup matchers), SessionEnd (+ wiki + cleanup),  
UserPromptSubmit (keyword + injector + skill-active-guard),  
PreToolUse, PostToolUse (+ project-memory + rules-injector), PostToolUseFailure,  
SubagentStart, SubagentStop, PreCompact (+ project-memory + wiki),  
Stop (+ context-guard + review-gate + verify-deliverables),  
PermissionRequest (Bash/shell).

## Runtime package

- **Canonical source:** `src/**/*.ts` → `npm run build` → `dist/`
- **Legacy re-export:** `dist/runtime/` for pre-port consumers
- **Thin launcher:** `hooks/scripts/hook-bridge.mjs` → `dist/hooks/bridge.js`
- **Atomic writes:** `src/lib/atomic-write.ts` / `hooks/scripts/lib/atomic-write.mjs`
