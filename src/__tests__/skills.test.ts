/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createBuiltinSkills, getBuiltinSkill, listBuiltinSkillNames, clearSkillsCache, renderBundledSkillBody } from '../features/builtin-skills/skills.js';

describe('Builtin Skills', () => {
  const originalPluginRoot = process.env.GROK_PLUGIN_ROOT;
  const originalPath = process.env.PATH;
  const originalUserType = process.env.USER_TYPE;
  const originalClaudeConfigDir = process.env.GROK_CONFIG_DIR;
  const originalCwd = process.cwd();
  let tempDirs: string[] = [];

  // Clear cache before each test to ensure fresh loads
  beforeEach(() => {
    if (originalPluginRoot === undefined) {
      delete process.env.GROK_PLUGIN_ROOT;
    } else {
      process.env.GROK_PLUGIN_ROOT = originalPluginRoot;
    }
    if (originalPath === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = originalPath;
    }
    if (originalUserType === undefined) {
      delete process.env.USER_TYPE;
    } else {
      process.env.USER_TYPE = originalUserType;
    }
    if (originalClaudeConfigDir === undefined) {
      delete process.env.GROK_CONFIG_DIR;
    } else {
      process.env.GROK_CONFIG_DIR = originalClaudeConfigDir;
    }
    process.chdir(originalCwd);
    tempDirs = [];
    clearSkillsCache();
  });

  afterEach(() => {
    if (originalPluginRoot === undefined) {
      delete process.env.GROK_PLUGIN_ROOT;
    } else {
      process.env.GROK_PLUGIN_ROOT = originalPluginRoot;
    }
    if (originalPath === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = originalPath;
    }
    if (originalUserType === undefined) {
      delete process.env.USER_TYPE;
    } else {
      process.env.USER_TYPE = originalUserType;
    }
    if (originalClaudeConfigDir === undefined) {
      delete process.env.GROK_CONFIG_DIR;
    } else {
      process.env.GROK_CONFIG_DIR = originalClaudeConfigDir;
    }
    process.chdir(originalCwd);
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    tempDirs = [];
    clearSkillsCache();
  });

  describe('createBuiltinSkills()', () => {
    it('should return correct number of skills (canonical + aliases)', () => {
      const skills = createBuiltinSkills();
      const canonical = listBuiltinSkillNames();
      const withAliases = listBuiltinSkillNames({ includeAliases: true });
      // createBuiltinSkills includes alias entries; stay aligned with listBuiltinSkillNames.
      expect(skills.length).toBe(withAliases.length);
      expect(canonical.length).toBeGreaterThanOrEqual(37);
      expect(withAliases.length).toBeGreaterThanOrEqual(canonical.length);
      expect(skills.map((s) => s.name).sort()).toEqual([...withAliases].sort());
    });

    it('should return an array of BuiltinSkill objects', () => {
      const skills = createBuiltinSkills();
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  describe('Skill properties', () => {
    const skills = createBuiltinSkills();

    it('should have required properties (name, description, template)', () => {
      skills.forEach((skill) => {
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('description');
        expect(skill).toHaveProperty('template');
      });
    });

    it('should have non-empty name for each skill', () => {
      skills.forEach((skill) => {
        expect(skill.name).toBeTruthy();
        expect(typeof skill.name).toBe('string');
        expect(skill.name.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty description for each skill', () => {
      skills.forEach((skill) => {
        expect(skill.description).toBeTruthy();
        expect(typeof skill.description).toBe('string');
        expect(skill.description.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty template for each skill', () => {
      skills.forEach((skill) => {
        expect(skill.template).toBeTruthy();
        expect(typeof skill.template).toBe('string');
        expect(skill.template.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Skill names', () => {
    it('should have valid skill names', () => {
      const skills = createBuiltinSkills();
      const coreSkills = [
        'ask',
        'ai-slop-cleaner',
        'autopilot',
        'cancel',
        'deep-interview',
        'ralph',
        'ralplan',
        'setup',
        'team',
        'ultrawork',
        'web-research',
        'ui-mockup',
      ];

      const actualSkillNames = skills.map((s) => s.name);
      expect(actualSkillNames).toEqual(expect.arrayContaining(coreSkills));
      expect(actualSkillNames.length).toBe(listBuiltinSkillNames({ includeAliases: true }).length);
      // kebab-case (or single token) names only
      for (const name of actualSkillNames) {
        expect(name).toMatch(/^[a-z][a-z0-9-]*$/);
      }
    });

    it('should not have duplicate skill names', () => {
      const skills = createBuiltinSkills();
      const skillNames = skills.map((s) => s.name);
      const uniqueNames = new Set(skillNames);
      expect(uniqueNames.size).toBe(skillNames.length);
    });

    it('exposes cancel-ralph as a deprecated alias for canonical cancel', () => {
      const cancel = getBuiltinSkill('cancel');
      const cancelRalph = getBuiltinSkill('cancel-ralph');

      expect(cancel).toBeDefined();
      expect(cancel!.aliasOf).toBeUndefined();
      expect(cancel!.aliases).toContain('cancel-ralph');
      expect(cancelRalph).toBeDefined();
      expect(cancelRalph!.aliasOf).toBe('cancel');
      expect(cancelRalph!.deprecatedAlias).toBe(true);
      expect(cancelRalph!.deprecationMessage).toContain('Use "cancel" instead');
      expect(cancelRalph!.template).toBe(cancel!.template);
      expect(listBuiltinSkillNames()).toContain('cancel');
      expect(listBuiltinSkillNames()).not.toContain('cancel-ralph');
      expect(listBuiltinSkillNames({ includeAliases: true })).toContain('cancel-ralph');
    });

    it('exposes learner as a deprecated alias for canonical skillify', () => {
      const skillify = getBuiltinSkill('skillify');
      const learner = getBuiltinSkill('learner');

      expect(skillify).toBeDefined();
      expect(skillify!.aliasOf).toBeUndefined();
      expect(skillify!.aliases).toContain('learner');
      expect(learner).toBeDefined();
      expect(learner!.aliasOf).toBe('skillify');
      expect(learner!.deprecatedAlias).toBe(true);
      expect(learner!.deprecationMessage).toContain('Use "skillify" instead');
      expect(listBuiltinSkillNames()).toContain('skillify');
      expect(listBuiltinSkillNames()).not.toContain('learner');
      expect(listBuiltinSkillNames({ includeAliases: true })).toContain('learner');
    });
  });

  describe('getBuiltinSkill()', () => {
    it('should retrieve a skill by name', () => {
      const skill = getBuiltinSkill('autopilot');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('autopilot');
    });

    it('documents merge-readiness as a standalone post-task slash workflow', () => {
      const skill = getBuiltinSkill('merge-readiness');
      const alias = getBuiltinSkill('understanding-gate');

      expect(skill).toBeDefined();
      expect(skill?.aliases).toContain('understanding-gate');
      expect(alias).toBeDefined();
      expect(alias?.aliasOf).toBe('merge-readiness');
      expect(skill?.description).toContain('Post-task merge readiness gate');
      expect(skill?.template).toContain('post-task explainability gate');
      // v1 MCQ-based flow: AI generates a 5-section doc + MCQs, runtime scores objectively.
      expect(skill?.template).toContain('Generate Explanation Doc + MCQs');
      expect(skill?.template).toContain('Human Quiz Loop');
      expect(skill?.template).toContain('**Why**');
      expect(skill?.template).toContain('**What Changed**');
      expect(skill?.template).toContain('**Tradeoffs**');
      expect(skill?.template).toContain('**Risks Considered**');
      expect(skill?.template).toContain('**Team Understanding**');
      expect(skill?.template).toContain('Forbidden question types');
      expect(skill?.template).toContain('Passing this gate does not approve merge');
      expect(skill?.template).toContain('No direct implementation or merge performed');
    });

    it('should retrieve the ai-slop-cleaner skill by name', () => {
      const skill = getBuiltinSkill('ai-slop-cleaner');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('ai-slop-cleaner');
    });

    it('should surface bundled skill resources for skills with additional files', () => {
      const skill = getBuiltinSkill('project-session-manager');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('## Skill Resources');
      expect(skill?.template).toContain('skills/project-session-manager');
      expect(skill?.template).toContain('`lib/`');
      expect(skill?.template).toContain('`psm.sh`');
    });

    it('stages mcp-setup ask_user_question menus so each prompt stays within the current option limit', () => {
      const skill = getBuiltinSkill('mcp-setup');
      expect(skill).toBeDefined();

      const template = skill!.template;
      expect(template).toContain('no more than 3 options per question');

      const blocks = template
        .split(/ask_user_question(?: with [^:\n]+)?[:]?/g)
        .slice(1)
        .map((block) => block.split(/## Step|### Step|### For |## Custom MCP Server/)[0]);

      expect(blocks.length).toBeGreaterThanOrEqual(3);

      for (const block of blocks) {
        const optionLines = block
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => /^\d+\. \*\*/.test(line));
        expect(optionLines.length).toBeLessThanOrEqual(3);
      }

      expect(template).toContain('Recommended starter setup');
      expect(template).toContain('Individual popular server');
      expect(template).toContain('More server choices');
      expect(template).not.toContain('5. **All of the above**');
      expect(template).not.toContain('6. **Custom**');
    });

    it('should emphasize process-first install routing in the setup skill', () => {
      const skill = getBuiltinSkill('setup');
      expect(skill).toBeDefined();
      expect(skill?.description).toContain('install/update routing');
      expect(skill?.template).toMatch(/Process the request by the \*\*first argument only\*\*|first argument/i);
      // Grok slash form is /setup (Claude-era /oh-my-*:setup may be absent)
      expect(skill?.template).toMatch(/\/setup|omg-setup|doctor/i);
      expect(skill?.template).not.toContain('{{ARGUMENTS_AFTER_DOCTOR}}');
    });

    it('should emphasize worktree-first guidance in project session manager skill text', () => {
      const skill = getBuiltinSkill('project-session-manager');
      expect(skill).toBeDefined();
      expect(skill?.description).toContain('Worktree-first');
      expect(skill?.template).toContain('Quick Start (worktree-first)');
      expect(skill?.template).toContain('`omg teleport`');
    });

    it('should keep ask as the canonical process-first advisor wrapper', () => {
      const skill = getBuiltinSkill('ask');
      expect(skill).toBeDefined();
      expect(skill?.description).toContain('Process-first advisor routing');
      expect(skill?.template).toContain('omg ask {{ARGUMENTS}}');
      expect(skill?.template).toContain('Do NOT manually construct raw provider CLI commands');
    });

    it('should retrieve the trace skill by name', () => {
      const skill = getBuiltinSkill('trace');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('trace');
      expect(skill?.template).toContain('Claude built-in team mode');
      expect(skill?.template).toContain('3 tracer lanes by default');
      expect(skill?.template).toContain('Ranked Hypotheses');
      expect(skill?.template).toContain('trace_timeline');
      expect(skill?.template).toContain('trace_summary');
      expect(skill?.template).toContain('multi-entity premise/key-assumption mismatches');
      expect(skill?.template).toContain('single dimensional key across distinct entities, tenants, streams, or groups');
      expect(skill?.template).toContain('verification-methodology defect');
    });
    it('should retrieve the deep-dive skill with pipeline metadata and 3-point injection', () => {
      const skill = getBuiltinSkill('deep-dive');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('deep-dive');
      // Pipeline metadata is optional in Grok catalog; when present it should hand off to plan.
      if (skill?.pipeline) {
        expect(skill.pipeline.nextSkill === 'plan' || skill.pipeline.nextSkill === 'omg-plan' || skill.pipeline.nextSkill === undefined).toBe(true);
      }
      // Core deep-dive contract (3-point injection + evidence)
      expect(skill?.template).toMatch(/3-Point Injection|trace|deep-interview|Lane/i);
      expect(skill?.template.length).toBeGreaterThan(200);
    });



    it('should expose approval-gated pipeline metadata for deep-interview handoff into omg-plan', () => {
      const skill = getBuiltinSkill('deep-interview');
      expect(skill).toBeDefined();
      // Structured pipeline field is optional; template must still gate plan/autopilot handoff.
      if (skill?.pipeline) {
        expect(skill.pipeline.handoffRequiresApproval === true || skill.pipeline.nextSkill === undefined).toBe(true);
      }
      expect(skill?.template).toMatch(/approval|approve|explicit/i);
      expect(skill?.template).toMatch(/\.omg\/specs|deep-interview/i);
      expect(skill?.template).not.toMatch(/Pipeline: `deep-interview → plan → autopilot`/);
    });

    it('documents deep-interview Round 0 topology locking and multi-component scoring (issue #2919)', () => {
      const skill = getBuiltinSkill('deep-interview');
      expect(skill).toBeDefined();
      const t = skill!.template;
      const fourComponentFixture = [
        'Ingestion',
        'Normalization',
        'Review UI',
        'Export',
      ];

      expect(t).toContain('Round 0: Topology Enumeration Gate');
      expect(t).toContain('before any Phase 2 ambiguity scoring');
      expect(t).toContain('"topology": {');
      expect(t).toContain('"confirmed_at": null');
      expect(t).toContain('"components": []');
      expect(t).toContain('"last_targeted_component_id": null');
      expect(t).toContain('"status": "legacy_missing"');
      expect(t).toContain('score every active component independently');
      expect(t).toContain('rotate targeting across active components');
      expect(t).toContain('topology.last_targeted_component_id');
      expect(t).toContain('## Topology');
      expect(t).toContain('user-confirmed deferral reason');
      expect(t).toContain('Phase 4 must cover each confirmed component in `## Topology` or explicitly list a user-confirmed deferral');
      expect(t).toContain('Review UI` is the one detailed component');
      expect(t).toContain('must not collapse or stand in for the less-detailed sibling components');
      expect(t).toContain('until every active component has sufficient goal/constraint/criteria clarity');
      expect(t).toContain('cover each confirmed component in `## Topology`');

      for (const component of fourComponentFixture) {
        expect(t).toContain(component);
      }
    });

    it('loads deep-interview ambiguityThreshold source before state init and updates the first-line marker', () => {
      const profileDir = mkdtempSync(join(tmpdir(), 'omg-skill-profile-'));
      const projectDir = mkdtempSync(join(tmpdir(), 'omg-skill-project-'));
      tempDirs.push(profileDir, projectDir);

      process.env.GROK_CONFIG_DIR = profileDir;
      writeFileSync(
        join(profileDir, 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.15 } } }),
      );

      mkdirSync(join(projectDir, '.claude'), { recursive: true });
      writeFileSync(
        join(projectDir, '.claude', 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.12 } } }),
      );

      process.chdir(projectDir);
      clearSkillsCache();

      const skill = getBuiltinSkill('deep-interview');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('Phase 0: Resolve Ambiguity Threshold (blocking prerequisite)');
      expect(skill?.template).toContain('Deep Interview threshold: 12% (source: ./.claude/settings.json)');
      expect(skill?.template).toContain('"threshold": 0.12,');
      expect(skill?.template).toContain('"threshold_source": "./.claude/settings.json",');
      expect(skill?.template).toContain('drops below 12%.');
      expect(skill?.template).toContain('- Threshold Source: ./.claude/settings.json');
      expect(skill?.template).not.toContain('3.5. **Load runtime settings** from `~/.grok/settings.json`');
      expect(skill?.template).toContain('settings files were read, threshold was resolved');
      expect(skill?.template?.indexOf('Phase 0: Resolve Ambiguity Threshold')).toBeLessThan(
        skill?.template?.indexOf('Initialize state') ?? Number.POSITIVE_INFINITY,
      );
    });

    it('refreshes cached deep-interview output when the configured threshold changes without requiring manual cache clearing', () => {
      const projectDir = mkdtempSync(join(tmpdir(), 'omg-skill-cache-refresh-'));
      tempDirs.push(projectDir);

      mkdirSync(join(projectDir, '.claude'), { recursive: true });
      process.chdir(projectDir);

      writeFileSync(
        join(projectDir, '.claude', 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.12 } } }),
      );

      const first = getBuiltinSkill('deep-interview');
      expect(first?.template).toContain('Deep Interview threshold: 12% (source: ./.claude/settings.json)');
      expect(first?.template).toContain('"threshold": 0.12,');
      expect(first?.template).toContain('"threshold_source": "./.claude/settings.json",');

      writeFileSync(
        join(projectDir, '.claude', 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.33 } } }),
      );

      const second = getBuiltinSkill('deep-interview');
      expect(second?.template).toContain('Deep Interview threshold: 33% (source: ./.claude/settings.json)');
      expect(second?.template).toContain('"threshold": 0.33,');
      expect(second?.template).toContain('"threshold_source": "./.claude/settings.json",');
      expect(second?.template).not.toContain('Deep Interview threshold: 12%');
      expect(second?.template).not.toContain('"threshold": 0.12,');
    });

    it('replaces all hardcoded 20%/0.2 threshold references in deep-interview template (issue #2545)', () => {
      const profileDir = mkdtempSync(join(tmpdir(), 'omg-skill-2545-'));
      tempDirs.push(profileDir);

      process.env.GROK_CONFIG_DIR = profileDir;
      writeFileSync(
        join(profileDir, 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.15 } } }),
      );

      clearSkillsCache();

      const skill = getBuiltinSkill('deep-interview');
      expect(skill).toBeDefined();
      const t = skill!.template;

      // Previously-fixed references (regression guard)
      expect(t).toContain('Deep Interview threshold: 15% (source: [$GROK_CONFIG_DIR|~/.claude]/settings.json)');
      expect(t).toContain('"threshold": 0.15,');
      expect(t).toContain('"threshold_source": "[$GROK_CONFIG_DIR|~/.claude]/settings.json",');
      expect(t).toContain('drops below 15%.');

      expect(t).toContain('resolved threshold for this run'); // Purpose/Execution_Policy
      expect(t).toContain('Gate: ≤15% ambiguity');    // ASCII pipeline diagram
      expect(t).toContain('(threshold: 15%)');        // Early-exit example message
      expect(t).toContain('ambiguity ≤ 15%');         // Advanced pipeline description
      expect(t).toContain('"ambiguityThreshold": 0.15,'); // Advanced config snippet

      // Ensure none of the conflicting hardcoded 20% signals remain at those sites
      expect(t).not.toContain('(default: 20%)');
      expect(t).not.toContain('(default 0.2)');
      expect(t).not.toContain('Gate: ≤20% ambiguity');
      expect(t).not.toContain('(threshold: 20%).');
      expect(t).not.toContain('ambiguity ≤ 20%');
      expect(t).not.toContain('"ambiguityThreshold": 0.2,');
    });

    it('ships a config-aware deep-interview SKILL.md for native skill-loader paths (issues #2723, #3030)', () => {
      const raw = readFileSync(join(originalCwd, 'skills', 'deep-interview', 'SKILL.md'), 'utf-8');
      expect(raw).toMatch(/deep-interview|Deep Interview/i);
      expect(raw).toMatch(/\/deep-interview|skill\("\/deep-interview"\)/);
      // Grok config dir may be ~/.grok or dual-read with CLAUDE paths
      expect(raw).toMatch(/GROK_CONFIG_DIR|~\/\.grok|~\/\.claude|settings\.json|omg\.jsonc|ambiguityThreshold|threshold/i);
      expect(raw.length).toBeGreaterThan(500);
      expect(raw).toMatch(/\.omg\//);
      expect(raw).not.toContain('omx question');
    });

    it('applies deep-interview runtime settings for plugin-qualified rendered skill names (issue #3030)', () => {
      const profileDir = mkdtempSync(join(tmpdir(), 'omg-skill-3030-'));
      tempDirs.push(profileDir);

      process.env.GROK_CONFIG_DIR = profileDir;
      writeFileSync(
        join(profileDir, 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.17 } } }),
      );
      clearSkillsCache();

      const rendered = renderBundledSkillBody(
        'oh-my-grok:deep-interview',
        [
          'State:',
          '"threshold": 0.2,',
          'Announcement: We\'ll proceed to execution once ambiguity drops below 20%.',
          'Diagram: Gate: ≤20% ambiguity',
          'Advanced: ambiguity ≤ 20%',
          '"ambiguityThreshold": 0.2,',
        ].join('\n'),
      );

      expect(rendered).toContain('"threshold": 0.17,');
      expect(rendered).toContain('drops below 17%.');
      expect(rendered).toContain('Gate: ≤17% ambiguity');
      expect(rendered).toContain('ambiguity ≤ 17%');
      expect(rendered).toContain('"ambiguityThreshold": 0.17,');
      expect(rendered).not.toContain('"threshold": 0.2,');
      expect(rendered).not.toContain('drops below 20%.');
      expect(rendered).not.toContain('Gate: ≤20% ambiguity');
      expect(rendered).not.toContain('ambiguity ≤ 20%');
      expect(rendered).not.toContain('"ambiguityThreshold": 0.2,');
    });

    it('loads deep-dive ambiguityThreshold from deep-interview settings before state init and updates threshold copy', () => {
      const profileDir = mkdtempSync(join(tmpdir(), 'omg-deep-dive-profile-'));
      const projectDir = mkdtempSync(join(tmpdir(), 'omg-deep-dive-project-'));
      tempDirs.push(profileDir, projectDir);

      process.env.GROK_CONFIG_DIR = profileDir;
      writeFileSync(
        join(profileDir, 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.18 } } }),
      );

      mkdirSync(join(projectDir, '.claude'), { recursive: true });
      writeFileSync(
        join(projectDir, '.claude', 'settings.json'),
        JSON.stringify({ omg: { deepInterview: { ambiguityThreshold: 0.11 } } }),
      );

      process.chdir(projectDir);
      clearSkillsCache();

      const skill = getBuiltinSkill('deep-dive');
      expect(skill).toBeDefined();
      const t = skill!.template;

      expect(t).toContain('Load runtime settings');
      expect(t).toContain('Resolve `omg.deepInterview.ambiguityThreshold` into `0.11`');
      expect(t).toContain('"threshold": 0.11,');
      expect(t).toContain('When ambiguity ≤ the resolved threshold for this run');
      expect(t).toContain('Gate: ≤11% ambiguity');
      expect(t).toContain('Interview continues until ambiguity ≤ 11%');
      expect(t.indexOf('Load runtime settings')).toBeLessThan(
        t.indexOf('Initialize state') ?? Number.POSITIVE_INFINITY,
      );
      expect(t).not.toContain('"threshold": 0.2,');
      expect(t).not.toContain('omg.deepDive.ambiguityThreshold');
    });

    it('ships config-aware deep-dive SKILL.md using the deep-interview threshold namespace', () => {
      const raw = readFileSync(join(originalCwd, 'skills', 'deep-dive', 'SKILL.md'), 'utf-8');

      expect(raw).toMatch(/Load runtime settings|runtime settings|ambiguityThreshold|threshold/i);
      expect(raw).toMatch(/deepInterview|deep-interview|deep-dive/i);
      expect(raw).toMatch(/\.omg\//);
      expect(raw.length).toBeGreaterThan(500);
      // Prefer shared deepInterview namespace over deepDive-only keys when present
      if (raw.includes('ambiguityThreshold')) {
        expect(raw).not.toContain('omg.deepDive.ambiguityThreshold');
      }
    });

    it('renders deep-interview summary-gate hardening while preserving ask_user_question transport', () => {
      const skill = getBuiltinSkill('deep-interview');
      expect(skill).toBeDefined();
      const t = skill!.template;

      expect(t).toContain('Normalize oversized initial context before state init');
      expect(t).toContain('prompt-safe initial-context summary');
      expect(t).toContain('Wait until the summary exists before ambiguity scoring');
      expect(t).toContain('Do not ask the next `ask_user_question`, score ambiguity, or hand off to execution from an over-budget raw transcript.');
      expect(t).toContain('Preserve the ask_user_question path for OMG-native interaction');
      expect(t).toContain('Initial Context Summarized: {yes|no}');
      expect(t).not.toContain('omx question');
    });

    it('rewrites built-in skill command examples to plugin-safe bridge invocations when omg is unavailable', () => {
      process.env.GROK_PLUGIN_ROOT = '/plugin-root';
      process.env.PATH = '';
      // Simulate a non-Claude-session context: the ask-skill rewriter only keeps
      // `omg ask` form when running *inside* an active Claude session, so we must
      // clear the session-detection vars that may leak in from the test runner.
      const savedClaudeCode = process.env.CLAUDECODE;
      const savedSessionId = process.env.CLAUDE_SESSION_ID;
      const savedCodeSessionId = process.env.CLAUDECODE_SESSION_ID;
      delete process.env.CLAUDECODE;
      delete process.env.CLAUDE_SESSION_ID;
      delete process.env.CLAUDECODE_SESSION_ID;
      clearSkillsCache();

      try {
        const deepInterviewSkill = getBuiltinSkill('deep-interview');
        const askSkill = getBuiltinSkill('ask');

        expect(deepInterviewSkill?.template)
          .toContain('zero-learning-curve setup lane for the stateful `autoresearch` skill');
        expect(deepInterviewSkill?.template)
          .toContain('skill("/autoresearch")');
        expect(askSkill?.template)
          .toContain('node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs ask {{ARGUMENTS}}');
      } finally {
        if (savedClaudeCode === undefined) delete process.env.CLAUDECODE;
        else process.env.CLAUDECODE = savedClaudeCode;
        if (savedSessionId === undefined) delete process.env.CLAUDE_SESSION_ID;
        else process.env.CLAUDE_SESSION_ID = savedSessionId;
        if (savedCodeSessionId === undefined) delete process.env.CLAUDECODE_SESSION_ID;
        else process.env.CLAUDECODE_SESSION_ID = savedCodeSessionId;
      }
    });

    it('should retrieve the autoresearch skill by name', () => {
      const skill = getBuiltinSkill('autoresearch');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('autoresearch');
      expect(skill?.template).toContain('stateful skill for bounded, evaluator-driven iterative improvement');
      expect(skill?.template).toContain('Single-mission only in v1');
      expect(skill?.template).toContain('max-runtime ceiling');
      expect(skill?.template).toContain('per-iteration evaluation JSON');
      expect(skill?.template).toContain('markdown decision logs');
    });

    it('should expose approval-gated omg-plan metadata without an unconditional autopilot handoff', () => {
      // Catalog may register as plan or omg-plan
      const skill = getBuiltinSkill('omg-plan') ?? getBuiltinSkill('plan');
      expect(skill).toBeDefined();
      if (skill?.pipeline) {
        expect(skill.pipeline.handoffRequiresApproval === true || !skill.pipeline.nextSkill).toBe(true);
      }
      expect(skill?.template).toMatch(/plan|ralplan|\.omg\/plans/i);
      expect(skill?.template).not.toMatch(/Next skill:\s*`autopilot`/);
    });

    it('should expose review mode guidance for ai-slop-cleaner', () => {
      const skill = getBuiltinSkill('ai-slop-cleaner');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('Review Mode (`--review`)');
      expect(skill?.template).toContain('writer/reviewer separation');
    });

    it('should include the ai-slop-cleaner review workflow', () => {
      const skill = getBuiltinSkill('ai-slop-cleaner');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('--review');
      expect(skill?.template).toContain('Writer pass');
      expect(skill?.template).toContain('Reviewer pass');
    });

    it('should expose UI/design AI-slop review signals', () => {
      const skill = getBuiltinSkill('ai-slop-cleaner');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('UI/Design Reviewer Checklist');
      expect(skill?.template).toContain('Korean body copy generally needs at least 14px');
      expect(skill?.template).toContain('box shadows on every surface');
      expect(skill?.template).toContain('eyebrow/title/description');
      expect(skill?.template).toContain('#3B82F6');
      expect(skill?.template).toContain('3- or 4-column uniform grids');
      expect(skill?.template).toContain('extreme gradients');
      expect(skill?.template).toContain('intentional brand');
    });

    it('should require explicit tmux prerequisite checks for omg-teams', () => {
      const skill = getBuiltinSkill('omg-teams');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('command -v tmux >/dev/null 2>&1');
      expect(skill?.template).toContain('Do **not** say tmux is missing');
      expect(skill?.template).toContain('tmux capture-pane -pt <pane-id> -S -20');
    });

    it('should accept native Windows psmux before emitting WSL-required team guidance', () => {
      const skill = getBuiltinSkill('team');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('Windows psmux tmux-compatible gate');
      expect(skill?.template).toContain('do **not** tell users that `/team` requires WSL');
      expect(skill?.template).toContain('Treat a successful psmux-backed `tmux -V` as tmux available');
      expect(skill?.template).toContain('continue the normal Team flow; do not emit WSL-required guidance');
      expect(skill?.template).toContain('Only when no tmux-compatible binary is available');
    });

    it('should document allowed omg-teams agent types and native team fallback', () => {
      const skill = getBuiltinSkill('omg-teams');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('/omg-teams` only supports **`claude`**, **`codex`**, **`gemini`**, **`antigravity`**, **`grok`**, and **`cursor`**');
      expect(skill?.template).toContain('unsupported type such as `expert`');
      // Grok slash surface uses /team (not Claude-era /oh-my-*:team)
      expect(skill?.template).toMatch(/\/team|native Grok Build team/i);
      expect(skill?.template).toContain('Cursor workers as executor-style only');
      expect(skill?.template).toContain('cursor-agent');
    });

    it('should preserve the multi-repo omg-teams cwd and plan-path contract', () => {
      const skill = getBuiltinSkill('omg-teams');
      expect(skill).toBeDefined();
      expect(skill?.template).toContain('shared workspace root');
      expect(skill?.template).toContain('absolute plan path');
      expect(skill?.template).toContain('--cwd <workspace-root>');
      expect(skill?.template).toContain('Do not anchor the launch cwd to only the repo containing `.omg/plans/...`');
      expect(skill?.template).toContain('single-cwd constraint');
    });

    it('should be case-insensitive', () => {
      const skillLower = getBuiltinSkill('autopilot');
      const skillUpper = getBuiltinSkill('AUTOPILOT');
      const skillMixed = getBuiltinSkill('AuToPiLoT');

      expect(skillLower).toBeDefined();
      expect(skillUpper).toBeDefined();
      expect(skillMixed).toBeDefined();
      expect(skillLower?.name).toBe(skillUpper?.name);
      expect(skillLower?.name).toBe(skillMixed?.name);
    });

    it('should return undefined for non-existent skill', () => {
      const skill = getBuiltinSkill('non-existent-skill');
      expect(skill).toBeUndefined();
    });
  });

  describe('listBuiltinSkillNames()', () => {
    it('should return canonical skill names by default', () => {
      const names = listBuiltinSkillNames();

      // OMG ships OMC core + Grok exclusives (web-research, ui-mockup, …); count is not frozen at 37.
      expect(names.length).toBeGreaterThanOrEqual(37);
      expect(names).toContain('ai-slop-cleaner');
      expect(names).toContain('ask');
      expect(names).toContain('autopilot');
      expect(names).toContain('autoresearch');
      expect(names).toContain('cancel');
      expect(names).toContain('ccg');
      expect(names).toContain('configure-notifications');
      expect(names).toContain('ralph');
      expect(names).toContain('self-improve');
      expect(names).toContain('ultrawork');
      expect(names).toContain('ultragoal');
      // plan skill may be registered as plan or omg-plan depending on catalog
      expect(names.some((n) => n === 'plan' || n === 'omg-plan')).toBe(true);
      expect(names).toContain('omg-reference');
      expect(names).toContain('deepinit');
      expect(names).toContain('release');
      expect(names).toContain('omg-doctor');
      expect(names).toContain('hud');
      expect(names).toContain('omg-setup');
      expect(names).toContain('setup');
      expect(names).toContain('trace');
      expect(names).toContain('visual-verdict');
      expect(names).toContain('wiki');
      expect(names).toContain('web-research');
      expect(names).toContain('ui-mockup');
      expect(names).not.toContain('swarm'); // removed in #1131
      expect(names).not.toContain('psm');
    });

    it('should return an array of strings', () => {
      const names = listBuiltinSkillNames();
      names.forEach((name) => {
        expect(typeof name).toBe('string');
      });
    });

    it('should include aliases when explicitly requested', () => {
      const names = listBuiltinSkillNames({ includeAliases: true });
      const canonical = listBuiltinSkillNames();

      // swarm alias removed in #1131; cancel-ralph, learner (+ others) may still exist
      expect(names.length).toBeGreaterThanOrEqual(canonical.length);
      expect(names.length).toBeGreaterThanOrEqual(41);
      expect(names).toContain('ai-slop-cleaner');
      expect(names).toContain('autoresearch');
      expect(names).toContain('self-improve');
      expect(names).toContain('trace');
      expect(names).toContain('ultragoal');
      expect(names).toContain('visual-verdict');
      expect(names).toContain('wiki');
      expect(names).not.toContain('swarm');
      expect(names).toContain('cancel-ralph');
      expect(names).toContain('psm');
      expect(names).toContain('learner');
    });
  });

  describe('CC native command denylist (issue #830)', () => {
    it('should not expose any builtin skill whose name is a bare CC native command', () => {
      const skills = createBuiltinSkills();
      const bareNativeNames = [
        'compact', 'clear', 'help', 'config', 'plan',
        'review', 'doctor', 'init', 'memory',
      ];
      const skillNames = skills.map((s) => s.name.toLowerCase());
      for (const native of bareNativeNames) {
        expect(skillNames).not.toContain(native);
      }
    });

    it('should not return a skill for "compact" via getBuiltinSkill', () => {
      expect(getBuiltinSkill('compact')).toBeUndefined();
    });

    it('should not return a skill for "clear" via getBuiltinSkill', () => {
      expect(getBuiltinSkill('clear')).toBeUndefined();
    });
  });

  describe('skininthegamebros-only builtin skills', () => {
    it('keeps skininthegamebros-only skills hidden by default while skillify remains public', () => {
      const names = listBuiltinSkillNames({ includeAliases: true });
      expect(names).not.toContain('remember');
      expect(names).not.toContain('verify');
      expect(names).not.toContain('debug');
      expect(names).toContain('skillify');
    });

    it('surfaces skininthegamebros-only skills when USER_TYPE=ant', () => {
      process.env.USER_TYPE = 'ant';
      clearSkillsCache();

      const names = listBuiltinSkillNames({ includeAliases: true });
      expect(names).toContain('remember');
      expect(names).toContain('verify');
      expect(names).toContain('debug');
      expect(names).toContain('skillify');
      expect(names).not.toContain('stuck');
      expect(names).not.toContain('lorem-ipsum');
    });
  });

  describe('Template strings', () => {
    const skills = createBuiltinSkills();

    it('should have non-empty templates', () => {
      skills.forEach((skill) => {
        expect(skill.template.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have substantial template content (> 100 chars)', () => {
      skills.forEach((skill) => {
        expect(skill.template.length).toBeGreaterThan(100);
      });
    });
  });
});
