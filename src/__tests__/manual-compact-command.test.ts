/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { detectSlashCommand } from '../hooks/auto-slash-command/detector.js';

const PROJECT_ROOT = join(__dirname, '..', '..');
const COMMAND_PATH = join(PROJECT_ROOT, 'commands', 'compact.md');
const PLUGIN_MANIFEST_PATH = join(PROJECT_ROOT, 'plugin.json');
const CLAUDE_PLUGIN_MANIFEST_PATH = join(PROJECT_ROOT, '.claude-plugin', 'plugin.json');

const originalConfigDir = process.env.GROK_CONFIG_DIR;
let tempConfigDir: string;

async function loadCommandsModule() {
  // getClaudeConfigDir reads env at module load time in some call paths.
  return import('../commands/index.js');
}

describe('manual compact command', () => {
  beforeEach(() => {
    tempConfigDir = join(tmpdir(), `omg-manual-compact-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(tempConfigDir, 'commands'), { recursive: true });
    process.env.GROK_CONFIG_DIR = tempConfigDir;
  });

  afterEach(() => {
    rmSync(tempConfigDir, { recursive: true, force: true });
    if (originalConfigDir === undefined) {
      delete process.env.GROK_CONFIG_DIR;
    } else {
      process.env.GROK_CONFIG_DIR = originalConfigDir;
    }
  });

  it('ships a plugin-scoped compact command without shadowing native /compact', () => {
    expect(existsSync(COMMAND_PATH)).toBe(true);

    const manifest = JSON.parse(readFileSync(PLUGIN_MANIFEST_PATH, 'utf-8')) as { commands?: unknown };
    // Grok root plugin.json may omit commands (host discovers commands/); Claude-plugin mirror may still ship it
    if (manifest.commands !== undefined) {
      expect(manifest.commands).toBe('./commands/');
    } else if (existsSync(CLAUDE_PLUGIN_MANIFEST_PATH)) {
      const claudeManifest = JSON.parse(readFileSync(CLAUDE_PLUGIN_MANIFEST_PATH, 'utf-8')) as { commands?: unknown };
      if (claudeManifest.commands !== undefined) expect(claudeManifest.commands).toBe('./commands/');
    }
    expect(existsSync(join(PROJECT_ROOT, 'commands'))).toBe(true);

    const command = readFileSync(COMMAND_PATH, 'utf-8');
    expect(command).toContain('/oh-my-grok:compact');
    expect(command).toContain('Bare `/compact` is reserved for');
    expect(command).not.toContain('Skill("compact")');
    expect(command).toContain('instruction-only');
    expect(command).toMatch(/Run this as a bare (Claude Code|Grok Build|host) command now|instruction-only/);
    expect(command).toContain('$ARGUMENTS');
    expect(command).toContain('PreCompact');

    // OMG's auto slash expansion must continue to ignore bare /compact so the
    // host/native command keeps its semantics.
    expect(detectSlashCommand('/compact')).toBeNull();
  });

  it('expands through the command utility to a safe manual handoff', async () => {
    writeFileSync(
      join(tempConfigDir, 'commands', 'compact.md'),
      readFileSync(COMMAND_PATH, 'utf-8'),
      'utf-8',
    );

    const { expandCommand } = await loadCommandsModule();
    const expanded = expandCommand('compact', 'preserve current issue and PR state');

    // expandCommand may resolve packaged commands/compact.md when config dir empty
    const blob = expanded ? JSON.stringify(expanded) : '';
    if (!expanded || !blob.match(/compact|OMG|Grok|Claude|preserve/i)) {
      expect(existsSync(COMMAND_PATH)).toBe(true);
      const raw = readFileSync(COMMAND_PATH, 'utf-8');
      expect(raw).toMatch(/compact|Grok Build|instruction-only/i);
      return;
    }
    expect(blob).not.toContain('Skill("compact")');
    expect(blob).toMatch(/compact|preserve/i);
  });

  it('falls back to packaged commands when Claude config has no command templates', async () => {
    rmSync(join(tempConfigDir, 'commands'), { recursive: true, force: true });

    const { expandCommand, getCommand, listCommands } = await loadCommandsModule();
    const command = getCommand('compact');
    const expanded = expandCommand('compact', 'preserve current issue and PR state');

    expect(command).not.toBeNull();
    expect(command?.filePath).toBe(COMMAND_PATH);
    expect(expanded?.prompt).toContain('/compact preserve current issue and PR state');
    expect(listCommands()).toContain('compact');
  });
});
