/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

import { existsSync, readFileSync } from 'fs';
import { isHudEnabledInConfig, isOmcStatusLine, GROK_CONFIG_DIR } from '../installer/index.js';
import type { InstallOptions } from '../installer/index.js';
import { join } from 'path';

const mockedExistsSync = vi.mocked(existsSync);
const mockedReadFileSync = vi.mocked(readFileSync);

describe('isHudEnabledInConfig', () => {
  const configPath = join(GROK_CONFIG_DIR, '.omg-config.json');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when config file does not exist', () => {
    mockedExistsSync.mockReturnValue(false);

    expect(isHudEnabledInConfig()).toBe(true);
    expect(mockedExistsSync).toHaveBeenCalledWith(configPath);
  });

  it('should return true when hudEnabled is not set in config', () => {
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync.mockReturnValue(JSON.stringify({ silentAutoUpdate: false }));

    expect(isHudEnabledInConfig()).toBe(true);
  });

  it('should return true when hudEnabled is explicitly true', () => {
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync.mockReturnValue(JSON.stringify({ silentAutoUpdate: false, hudEnabled: true }));

    expect(isHudEnabledInConfig()).toBe(true);
  });

  it('should return false when hudEnabled is explicitly false', () => {
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync.mockReturnValue(JSON.stringify({ silentAutoUpdate: false, hudEnabled: false }));

    expect(isHudEnabledInConfig()).toBe(false);
  });

  it('should return true when config file has invalid JSON', () => {
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync.mockReturnValue('not valid json');

    expect(isHudEnabledInConfig()).toBe(true);
  });

  it('should return true when readFileSync throws', () => {
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync.mockImplementation(() => {
      throw new Error('read error');
    });

    expect(isHudEnabledInConfig()).toBe(true);
  });
});

describe('InstallOptions skipHud', () => {
  it('should accept skipHud as a valid option', () => {
    const opts: InstallOptions = { skipHud: true };
    expect(opts.skipHud).toBe(true);
  });

  it('should accept skipHud as false', () => {
    const opts: InstallOptions = { skipHud: false };
    expect(opts.skipHud).toBe(false);
  });

  it('should accept skipHud as undefined (default)', () => {
    const opts: InstallOptions = {};
    expect(opts.skipHud).toBeUndefined();
  });
});

describe('isOmcStatusLine', () => {
  it('should return true for OMG HUD statusLine', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: 'node /home/user/.claude/hud/omg-hud.mjs'
    })).toBe(true);
  });

  it('should return true for any command containing omg-hud', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: '/usr/local/bin/node /some/path/omg-hud.mjs'
    })).toBe(true);
  });

  it('should return false for custom statusLine', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: 'my-custom-statusline --fancy'
    })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isOmcStatusLine(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isOmcStatusLine(undefined)).toBe(false);
  });

  // Legacy string format tests (pre-v4.5 compatibility)
  it('should return true for legacy string containing omg-hud', () => {
    expect(isOmcStatusLine('~/.grok/hud/omg-hud.mjs')).toBe(true);
  });

  it('should return true for legacy string with absolute path to omg-hud', () => {
    expect(isOmcStatusLine('/home/user/.claude/hud/omg-hud.mjs')).toBe(true);
  });

  it('should return false for non-OMG string', () => {
    expect(isOmcStatusLine('my-custom-statusline')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isOmcStatusLine('')).toBe(false);
  });

  it('should return false for object without command', () => {
    expect(isOmcStatusLine({ type: 'command' })).toBe(false);
  });

  it('should return false for object with non-string command', () => {
    expect(isOmcStatusLine({ type: 'command', command: 42 })).toBe(false);
  });

  it('should recognize portable $HOME statusLine as OMG', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: 'node $HOME/.claude/hud/omg-hud.mjs'
    })).toBe(true);
  });

  it('should recognize find-node.sh statusLine as OMG', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: 'sh $HOME/.claude/hud/find-node.sh $HOME/.claude/hud/omg-hud.mjs'
    })).toBe(true);
  });

  it('should recognize GROK_CONFIG_DIR-aware statusLine as OMG', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: 'node ${GROK_CONFIG_DIR:-$HOME/.claude}/hud/omg-hud.mjs'
    })).toBe(true);
  });

  it('should recognize GROK_CONFIG_DIR-aware find-node.sh statusLine as OMG', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: 'sh ${GROK_CONFIG_DIR:-$HOME/.claude}/hud/find-node.sh ${GROK_CONFIG_DIR:-$HOME/.claude}/hud/omg-hud.mjs'
    })).toBe(true);
  });


  it('should recognize cached HUD statusLine as OMG', () => {
    expect(isOmcStatusLine({
      type: 'command',
      command: 'sh ${GROK_CONFIG_DIR:-$HOME/.claude}/hud/omg-hud-cache.sh ${GROK_CONFIG_DIR:-$HOME/.claude}/hud/omg-hud.mjs'
    })).toBe(true);
  });
});
