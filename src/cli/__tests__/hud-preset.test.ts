/**
 * Ported / OMG: hud --preset CLI contract.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const CLI = join(ROOT, 'src/cli/index.ts');
const TSX = join(ROOT, 'node_modules/tsx/dist/loader.mjs');
const BIN = join(ROOT, 'bin/omg.js');

function runCommander(args: string[], env: Record<string, string>) {
  return spawnSync(process.execPath, ['--import', TSX, CLI, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function runBin(args: string[], env: Record<string, string>) {
  return spawnSync(process.execPath, [BIN, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

describe('omg hud --preset', () => {
  let configDir: string;

  beforeEach(() => {
    configDir = mkdtempSync(join(tmpdir(), 'omg-hud-preset-'));
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, 'settings.json'), JSON.stringify({}), 'utf8');
  });

  afterEach(() => {
    rmSync(configDir, { recursive: true, force: true });
  });

  it('commander: persists preset to settings omcHud and rejects unknown', () => {
    const bad = runCommander(['hud', '--preset', 'nope'], { GROK_CONFIG_DIR: configDir });
    expect(bad.status).not.toBe(0);
    expect(bad.stderr + bad.stdout).toMatch(/Unknown HUD preset/i);

    const ok = runCommander(['hud', '--preset', 'minimal'], { GROK_CONFIG_DIR: configDir });
    // renderer may print or no-op without statusline; preset write must succeed
    expect(ok.status).toBe(0);
    expect(ok.stderr).toMatch(/preset=minimal/);
    const settings = JSON.parse(readFileSync(join(configDir, 'settings.json'), 'utf8'));
    expect(settings.omcHud?.preset).toBe('minimal');
  });

  it('bin/omg.js: --preset=focused form works', () => {
    const ok = runBin(['hud', '--preset=focused'], { GROK_CONFIG_DIR: configDir });
    expect(ok.status).toBe(0);
    expect(ok.stderr).toMatch(/preset=focused/);
    expect(existsSync(join(configDir, 'settings.json'))).toBe(true);
    const settings = JSON.parse(readFileSync(join(configDir, 'settings.json'), 'utf8'));
    expect(settings.omcHud?.preset).toBe('focused');
  });
});
