/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'fs';
import { homedir, tmpdir } from 'os';
import { basename, join, normalize } from 'path';
import { getClaudeConfigDir } from '../utils/config-dir.js'
import { isValidTranscriptPath } from '../lib/worktree-paths.js';
import { findRuleFiles } from '../hooks/rules-injector/finder.js';

const originalConfigDir = process.env.GROK_CONFIG_DIR;

describe('getClaudeConfigDir', () => {
  afterEach(() => {
    if (originalConfigDir === undefined) {
      delete process.env.GROK_CONFIG_DIR;
    } else {
      process.env.GROK_CONFIG_DIR = originalConfigDir;
    }
  });

  it('falls back to ~/.claude when GROK_CONFIG_DIR is unset', () => {
    delete process.env.GROK_CONFIG_DIR;
    expect(getClaudeConfigDir()).toBe(normalize(join(homedir(), '.claude')));
  });

  it('falls back to ~/.claude when GROK_CONFIG_DIR is empty', () => {
    process.env.GROK_CONFIG_DIR = '   ';
    expect(getClaudeConfigDir()).toBe(normalize(join(homedir(), '.claude')));
  });

  it('returns an absolute custom path unchanged aside from normalization', () => {
    process.env.GROK_CONFIG_DIR = join(tmpdir(), 'custom-claude-config', '..', 'custom-claude-config');
    expect(getClaudeConfigDir()).toBe(normalize(join(tmpdir(), 'custom-claude-config', '..', 'custom-claude-config')));
  });

  it('expands a bare tilde to the home directory', () => {
    process.env.GROK_CONFIG_DIR = '~';
    expect(getClaudeConfigDir()).toBe(normalize(homedir()));
  });

  it('expands a ~-prefixed config path', () => {
    process.env.GROK_CONFIG_DIR = '~/.claude-alt';
    expect(getClaudeConfigDir()).toBe(normalize(join(homedir(), '.claude-alt')));
  });

  it('strips a trailing separator from custom paths', () => {
    process.env.GROK_CONFIG_DIR = join(tmpdir(), 'custom-claude-config') + '/';
    expect(getClaudeConfigDir()).toBe(normalize(join(tmpdir(), 'custom-claude-config')));
    expect(getClaudeConfigDir().endsWith('/')).toBe(false);
  });

  it('preserves a Windows drive root when trimming separators', async () => {
    process.env.GROK_CONFIG_DIR = 'C:\\';

    vi.resetModules();
    vi.doMock('node:os', () => ({
      homedir: () => 'C:\\Users\\tester',
    }));
    vi.doMock('node:path', async () => import('node:path/win32'));

    try {
      const { getClaudeConfigDir: getWindowsConfigDir } = await import('../utils/config-dir.js');
      expect(getWindowsConfigDir()).toBe('C:\\');
    } finally {
      vi.doUnmock('node:os');
      vi.doUnmock('node:path');
      vi.resetModules();
    }
  });

  it('keeps the script helper aligned with the TypeScript helper', async () => {
    process.env.GROK_CONFIG_DIR = '~/.claude-alt';
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import { getClaudeConfigDir } from './scripts/lib/config-dir.mjs'; process.stdout.write(getClaudeConfigDir());",
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: 'utf-8',
      },
    );
    expect(output).toBe(normalize(join(homedir(), '.claude-alt')));
  });

  it('find-node.sh resolves a ~-prefixed GROK_CONFIG_DIR before reading .omg-config.json', () => {
    const homeDir = mkdtempSync(join(tmpdir(), 'omg-find-node-home-'));
    const configDir = join(homeDir, '.claude-alt');
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, '.omg-config.json'), JSON.stringify({ nodeBinary: process.execPath }));

    const output = execFileSync(
      '/bin/sh',
      [join(process.cwd(), 'scripts', 'find-node.sh'), '-e', "process.stdout.write('ok')"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          HOME: homeDir,
          PATH: '/bin:/usr/bin',
          GROK_CONFIG_DIR: '~/.claude-alt',
        },
        encoding: 'utf-8',
      },
    );

    expect(output).toBe('ok');
  });

  it('shared shell helper expands a ~-prefixed GROK_CONFIG_DIR', () => {
    const homeDir = mkdtempSync(join(tmpdir(), 'omg-uninstall-home-'));
    const output = execFileSync('bash', ['-lc', `. "${join(process.cwd(), 'scripts', 'lib', 'config-dir.sh')}"; resolve_claude_config_dir`], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOME: homeDir,
        GROK_CONFIG_DIR: '~/.claude-alt',
      },
      encoding: 'utf-8',
    });

    expect(output.trim()).toBe(join(homeDir, '.claude-alt'));
  });

  it('keeps the CJS helper aligned with the TypeScript helper', () => {
    process.env.GROK_CONFIG_DIR = '~/.claude-alt';
    const cjsPath = join(process.cwd(), 'scripts', 'lib', 'config-dir.cjs');
    const output = execFileSync(
      process.execPath,
      ['-e', `const { getClaudeConfigDir } = require(${JSON.stringify(cjsPath)}); process.stdout.write(getClaudeConfigDir());`],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: 'utf-8',
      },
    );
    expect(output).toBe(normalize(join(homedir(), '.claude-alt')));
  });
});

describe('GROK_CONFIG_DIR downstream integration', () => {
  let origConfigDir: string | undefined;
  let tempDir: string;
  let tildeConfigDir: string;

  beforeEach(() => {
    origConfigDir = process.env.GROK_CONFIG_DIR;
    tempDir = join(tmpdir(), `omg-test-configdir-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    tildeConfigDir = join(homedir(), `.omg-test-configdir-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (origConfigDir === undefined) {
      delete process.env.GROK_CONFIG_DIR;
    } else {
      process.env.GROK_CONFIG_DIR = origConfigDir;
    }
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
    try {
      rmSync(tildeConfigDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it('accepts transcript paths under custom GROK_CONFIG_DIR', () => {
    process.env.GROK_CONFIG_DIR = '/opt/custom-claude-config';
    const transcriptPath = '/opt/custom-claude-config/projects/-foo/bar/session.jsonl';
    expect(isValidTranscriptPath(transcriptPath)).toBe(true);
  });

  it('accepts transcript paths when GROK_CONFIG_DIR uses a ~-prefixed path', () => {
    process.env.GROK_CONFIG_DIR = `~/${basename(tildeConfigDir)}`;
    const transcriptPath = join(tildeConfigDir, 'projects', '-foo', 'bar', 'session.jsonl');
    expect(isValidTranscriptPath(transcriptPath)).toBe(true);
  });

  it('discovers user rules from custom GROK_CONFIG_DIR/rules', () => {
    const customRulesDir = join(tempDir, 'rules');
    mkdirSync(customRulesDir, { recursive: true });
    writeFileSync(join(customRulesDir, 'my-rule.md'), '# My Rule\nRule content');

    process.env.GROK_CONFIG_DIR = tempDir;

    const candidates = findRuleFiles(null, '/some/file.ts');
    const globalRules = candidates.filter(c => c.isGlobal);

    expect(globalRules.length).toBeGreaterThanOrEqual(1);
    expect(globalRules.some(c => c.path.includes('my-rule.md'))).toBe(true);
  });

  it('uses the active config dir rather than default ~/.grok/rules for user rules', () => {
    const customRulesDir = join(tempDir, 'rules');
    mkdirSync(customRulesDir, { recursive: true });
    writeFileSync(join(customRulesDir, 'custom-rule.md'), '# Custom Rule');

    process.env.GROK_CONFIG_DIR = tempDir;

    const candidates = findRuleFiles(null, '/some/file.ts');
    const globalRules = candidates.filter(c => c.isGlobal);

    expect(globalRules.some(c => c.path.includes('custom-rule.md'))).toBe(true);
  });

  it('discovers user rules when GROK_CONFIG_DIR uses a ~-prefixed path', () => {
    const customRulesDir = join(tildeConfigDir, 'rules');
    mkdirSync(customRulesDir, { recursive: true });
    writeFileSync(join(customRulesDir, 'tilde-rule.md'), '# Tilde Rule');

    process.env.GROK_CONFIG_DIR = `~/${basename(tildeConfigDir)}`;

    const candidates = findRuleFiles(null, '/some/file.ts');
    const globalRules = candidates.filter(c => c.isGlobal);

    expect(globalRules.some(c => c.path.includes('tilde-rule.md'))).toBe(true);
  });
});
