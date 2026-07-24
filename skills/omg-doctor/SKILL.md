---
name: omg-doctor
description: Diagnose and fix oh-my-grok installation issues
---

# Doctor Skill

Note: All `~/.grok/...` paths in this guide respect `GROK_CONFIG_DIR` when that environment variable is set.

## Task: Run Installation Diagnostics

You are the OMG Doctor - diagnose and fix installation issues.

### Step 1: Check Plugin Version

```bash
# Get installed and latest versions (cross-platform)
node -e "const p=require('path'),f=require('fs'),h=require('os').homedir(),d=process.env.GROK_CONFIG_DIR||p.join(h,'.claude'),b=p.join(d,'plugins','cache','omg','oh-my-grok');try{const v=f.readdirSync(b).filter(x=>/^\d/.test(x)).sort((a,c)=>a.localeCompare(c,void 0,{numeric:true}));console.log('Installed:',v.length?v[v.length-1]:'(none)')}catch{console.log('Installed: (none)')}"
npm view oh-my-grok version 2>/dev/null || echo "Latest: (unavailable)"
```

**Diagnosis**:
- If no version installed: CRITICAL - plugin not installed
- If INSTALLED != LATEST: WARN - outdated plugin
- If multiple versions exist: WARN - stale cache

### Step 2: Check for Legacy Hooks in settings.json

Read both `${GROK_CONFIG_DIR:-~/.claude}/settings.json` (profile-level) and `./.grok/config.toml` (project-level) and check if there's a `"hooks"` key with entries like:
- `bash ${GROK_CONFIG_DIR:-$HOME/.claude}/hooks/keyword-detector.sh`
- `bash ${GROK_CONFIG_DIR:-$HOME/.claude}/hooks/persistent-mode.sh`
- `bash ${GROK_CONFIG_DIR:-$HOME/.claude}/hooks/session-start.sh`

**Diagnosis**:
- If found: CRITICAL - legacy hooks causing duplicates

### Step 3: Check for Legacy Bash Hook Scripts

```bash
ls -la "${GROK_CONFIG_DIR:-$HOME/.claude}"/hooks/*.sh 2>/dev/null
```

**Diagnosis**:
- If `keyword-detector.sh`, `persistent-mode.sh`, `session-start.sh`, or `stop-continuation.sh` exist: WARN - legacy scripts (can cause confusion)

### Step 4: Check CLAUDE.md

```bash
# Check if CLAUDE.md exists
ls -la "${GROK_CONFIG_DIR:-$HOME/.claude}"/CLAUDE.md 2>/dev/null

# Check for OMG markers (<!-- OMG:START --> is the canonical marker)
grep -q "<!-- OMG:START -->" "${GROK_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md" 2>/dev/null && echo "Has OMG config" || echo "Missing OMG config in CLAUDE.md"

# Check CLAUDE.md (or deterministic companion) version marker and compare with latest installed plugin cache version
node -e "const p=require('path'),f=require('fs'),h=require('os').homedir(),d=process.env.GROK_CONFIG_DIR||p.join(h,'.claude');const base=p.join(d,'CLAUDE.md');let baseContent='';try{baseContent=f.readFileSync(base,'utf8')}catch{};let candidates=[base];let referenced='';const importMatch=baseContent.match(/CLAUDE-[^ )]*\\.md/);if(importMatch){referenced=p.join(d,importMatch[0]);candidates.push(referenced)}else{const defaultCompanion=p.join(d,'CLAUDE-omg.md');if(f.existsSync(defaultCompanion))candidates.push(defaultCompanion);try{const others=f.readdirSync(d).filter(n=>/^CLAUDE-.*\\.md$/i.test(n)).sort().map(n=>p.join(d,n));for(const o of others){if(candidates.includes(o)===false)candidates.push(o)}}catch{}};let claudeV='(missing)';let claudeSource='(none)';for(const file of candidates){try{const c=f.readFileSync(file,'utf8');const m=c.match(/<!--\\s*OMG:VERSION:([^\\s]+)\\s*-->/i);if(m){claudeV=m[1];claudeSource=file;break}}catch{}};if(claudeV==='(missing)'&&candidates.length>0){claudeV='(missing marker)';claudeSource='scanned deterministic CLAUDE sources';};let pluginV='(none)';try{const b=p.join(d,'plugins','cache','omg','oh-my-grok');const v=f.readdirSync(b).filter(x=>/^\\d/.test(x)).sort((a,c)=>a.localeCompare(c,void 0,{numeric:true}));pluginV=v.length?v[v.length-1]:'(none)';}catch{};console.log('CLAUDE.md OMG version:',claudeV);console.log('OMG version source:',claudeSource);console.log('Latest cached plugin version:',pluginV);if(claudeV==='(missing)'||claudeV==='(missing marker)'||pluginV==='(none)'){console.log('VERSION CHECK SKIPPED: missing CLAUDE marker or plugin cache')}else if(claudeV===pluginV){console.log('VERSION MATCH: CLAUDE and plugin cache are aligned')}else{console.log('VERSION DRIFT: CLAUDE.md and plugin versions differ')}"

# Check companion files for file-split pattern (e.g. CLAUDE-omg.md)
find "${GROK_CONFIG_DIR:-$HOME/.claude}" -maxdepth 1 -type f -name 'CLAUDE-*.md' -print 2>/dev/null
while IFS= read -r f; do
  grep -q "<!-- OMG:START -->" "$f" 2>/dev/null && echo "Has OMG config in companion: $f"
done < <(find "${GROK_CONFIG_DIR:-$HOME/.claude}" -maxdepth 1 -type f -name 'CLAUDE-*.md' -print 2>/dev/null)

# Check if CLAUDE.md references a companion file
grep -o "CLAUDE-[^ )]*\.md" "${GROK_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md" 2>/dev/null
```

**Diagnosis**:
- If CLAUDE.md missing: CRITICAL - CLAUDE.md not configured
- If `<!-- OMG:START -->` found in CLAUDE.md: OK
- If `<!-- OMG:START -->` found in a companion file (e.g. `CLAUDE-omg.md`): OK - file-split pattern detected
- If no OMG markers in CLAUDE.md or any companion file: WARN - outdated CLAUDE.md
- If `OMG:VERSION` marker is missing from deterministic CLAUDE source scan (base + referenced companion): WARN - cannot verify CLAUDE.md freshness
- If `CLAUDE.md OMG version` != `Latest cached plugin version`: WARN - version drift detected (run `omg update` or `omg setup`)

### Step 5: Check Ralph Ruby Dependency

Ralph workflows require Ruby. Check for Ruby explicitly so fresh installations get actionable guidance instead of a later opaque Ralph failure.

```bash
if command -v ruby >/dev/null 2>&1; then
  echo "Ruby for Ralph: $(ruby --version 2>/dev/null | head -1)"
else
  echo "Ruby for Ralph: MISSING"
  echo "Install Ruby before using Ralph. Ubuntu/Debian: sudo apt update && sudo apt install ruby-full"
  echo "macOS: brew install ruby"
fi
```

**Diagnosis**:
- If Ruby is found: OK - Ralph dependency present
- If Ruby is missing: WARN - Ralph workflows may fail until Ruby is installed

### Step 6: Check for Stale Plugin Cache

```bash
# Count versions in cache (cross-platform)
node -e "const p=require('path'),f=require('fs'),h=require('os').homedir(),d=process.env.GROK_CONFIG_DIR||p.join(h,'.claude'),b=p.join(d,'plugins','cache','omg','oh-my-grok');try{const v=f.readdirSync(b).filter(x=>/^\d/.test(x));console.log(v.length+' version(s):',v.join(', '))}catch{console.log('0 versions')}"
```

**Diagnosis**:
- If > 1 version: WARN - multiple cached versions (cleanup recommended)

### Step 7: Check for Legacy Curl-Installed Content

Check for legacy agents, commands, and skills installed via curl (before plugin system).
**Important**: Only flag files whose names match actual plugin-provided names. Do NOT flag user's custom agents/commands/skills that are unrelated to OMG.

```bash
# Check for legacy agents directory
ls -la "${GROK_CONFIG_DIR:-$HOME/.claude}"/agents/ 2>/dev/null

# Check for legacy commands directory
ls -la "${GROK_CONFIG_DIR:-$HOME/.claude}"/commands/ 2>/dev/null

# Check for legacy skills directory
ls -la "${GROK_CONFIG_DIR:-$HOME/.claude}"/skills/ 2>/dev/null
```

**Diagnosis**:
- If `~/.grok/agents/` exists with files matching plugin agent names: WARN - legacy agents (now provided by plugin)
- If `~/.grok/commands/` exists with files matching plugin command names: WARN - legacy commands (now provided by plugin)
- If `~/.grok/skills/` exists with files matching plugin skill names: WARN - legacy skills (now provided by plugin)
- If custom files exist that do NOT match plugin names: OK - these are user custom content, do not flag them

**Known plugin agent names** (check agents/ for these):
`architect.md`, `document-specialist.md`, `explore.md`, `executor.md`, `debugger.md`, `planner.md`, `analyst.md`, `critic.md`, `verifier.md`, `test-engineer.md`, `designer.md`, `writer.md`, `qa-tester.md`, `scientist.md`, `security-reviewer.md`, `code-reviewer.md`, `git-master.md`, `code-simplifier.md`

**Known plugin skill names** (check skills/ for these):
`ai-slop-cleaner`, `ask`, `autopilot`, `cancel`, `ccg`, `configure-notifications`, `deep-interview`, `deepinit`, `external-context`, `hud`, `skillify`, `learner`, `mcp-setup`, `omg-doctor`, `omg-setup`, `omg-teams`, `plan`, `project-session-manager`, `ralph`, `ralplan`, `release`, `sciomc`, `setup`, `skill`, `team`, `ultraqa`, `ultrawork`, `visual-verdict`, `writer-memory`

**Known plugin command names** (check commands/ for these):
`ultrawork.md`, `deepsearch.md`

---

## Report Format

After running all checks, output a report:

```
## OMG Doctor Report

### Summary
[HEALTHY / ISSUES FOUND]

### Checks

| Check | Status | Details |
|-------|--------|---------|
| Plugin Version | OK/WARN/CRITICAL | ... |
| Legacy Hooks (settings.json) | OK/CRITICAL | ... |
| Legacy Scripts (~/.grok/hooks/) | OK/WARN | ... |
| CLAUDE.md | OK/WARN/CRITICAL | ... |
| Ralph Ruby Dependency | OK/WARN | ... |
| Plugin Cache | OK/WARN | ... |
| Legacy Agents (~/.grok/agents/) | OK/WARN | ... |
| Legacy Commands (~/.grok/commands/) | OK/WARN | ... |
| Legacy Skills (~/.grok/skills/) | OK/WARN | ... |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommended Fixes
[List fixes based on issues]
```

---

## Auto-Fix (if user confirms)

If issues found, ask user: "Would you like me to fix these issues automatically?"

If yes, apply fixes:

### Fix: Legacy Hooks in settings.json
Remove the `"hooks"` section from `${GROK_CONFIG_DIR:-~/.claude}/settings.json` (keep other settings intact)

### Fix: Legacy Bash Scripts
```bash
rm -f "${GROK_CONFIG_DIR:-$HOME/.claude}"/hooks/keyword-detector.sh
rm -f "${GROK_CONFIG_DIR:-$HOME/.claude}"/hooks/persistent-mode.sh
rm -f "${GROK_CONFIG_DIR:-$HOME/.claude}"/hooks/session-start.sh
rm -f "${GROK_CONFIG_DIR:-$HOME/.claude}"/hooks/stop-continuation.sh
```

### Fix: Outdated Plugin
```bash
# Clear plugin cache (cross-platform)
node -e "const p=require('path'),f=require('fs'),d=process.env.GROK_CONFIG_DIR||p.join(require('os').homedir(),'.claude'),b=p.join(d,'plugins','cache','omg','oh-my-grok');try{f.rmSync(b,{recursive:true,force:true});console.log('Plugin cache cleared. Restart Grok Build to fetch latest version.')}catch{console.log('No plugin cache found')}"
```

### Fix: Stale Cache (multiple versions)
```bash
# Keep only latest version (cross-platform)
node -e "const p=require('path'),f=require('fs'),h=require('os').homedir(),d=process.env.GROK_CONFIG_DIR||p.join(h,'.claude'),b=p.join(d,'plugins','cache','omg','oh-my-grok');try{const v=f.readdirSync(b).filter(x=>/^\d/.test(x)).sort((a,c)=>a.localeCompare(c,void 0,{numeric:true}));v.slice(0,-1).forEach(x=>f.rmSync(p.join(b,x),{recursive:true,force:true}));console.log('Removed',v.length-1,'old version(s)')}catch(e){console.log('No cache to clean')}"
```

### Fix: Missing/Outdated CLAUDE.md
Fetch latest from GitHub and write to `${GROK_CONFIG_DIR:-~/.claude}/CLAUDE.md`:
```
web_fetch(url: "https://raw.githubusercontent.com/Yeachan-Heo/oh-my-grok/main/docs/CLAUDE.md", prompt: "Return the complete raw markdown content exactly as-is")
```

### Fix: Legacy Curl-Installed Content

Remove legacy agents, commands, and skills directories (now provided by plugin):

```bash
# Backup first (optional - ask user)
# mv "${GROK_CONFIG_DIR:-$HOME/.claude}"/agents "${GROK_CONFIG_DIR:-$HOME/.claude}"/agents.bak
# mv "${GROK_CONFIG_DIR:-$HOME/.claude}"/commands "${GROK_CONFIG_DIR:-$HOME/.claude}"/commands.bak
# mv "${GROK_CONFIG_DIR:-$HOME/.claude}"/skills "${GROK_CONFIG_DIR:-$HOME/.claude}"/skills.bak

# Or remove directly
rm -rf "${GROK_CONFIG_DIR:-$HOME/.claude}"/agents
rm -rf "${GROK_CONFIG_DIR:-$HOME/.claude}"/commands
rm -rf "${GROK_CONFIG_DIR:-$HOME/.claude}"/skills
```

**Note**: Only remove if these contain oh-my-grok-related files. If user has custom agents/commands/skills, warn them and ask before removing.

---

## Post-Fix

After applying fixes, inform user:
> Fixes applied. **Restart Grok Build** for changes to take effect.


## Grok Capability Extensions

- On build/test failures: use `web_search` / `web_fetch` for latest fixes and community issues before inventing workarounds.
- On UI work without a design: prefer the `/ui-mockup` skill (Image Gen → Vision analysis → code → Vision QA).
- For live docs/API research: use `/web-research` or call `web_search` directly.
- Prefer `spawn_subagent` with `isolation: "worktree"` for parallel executors when mutating code.
- Persist orchestration state under `.omg/` only (never `.omc/`).
- Use `ask_user_question` for structured one-at-a-time questions (not multi-question dumps).
