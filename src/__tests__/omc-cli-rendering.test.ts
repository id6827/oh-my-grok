/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, expect, it } from 'vitest';
import {
  formatOmcCliInvocation,
  resolveOmcCliPrefix,
  rewriteOmcCliInvocations,
} from '../utils/omg-cli-rendering.js';

describe('omg CLI rendering', () => {
  it('uses omg when the binary is available', () => {
    expect(resolveOmcCliPrefix({ omcAvailable: true, env: {} as NodeJS.ProcessEnv })).toBe('omg');
    expect(formatOmcCliInvocation('team api claim-task', { omcAvailable: true, env: {} as NodeJS.ProcessEnv }))
      .toBe('omg team api claim-task');
  });

  it('falls back to the plugin bridge when omg is unavailable but GROK_PLUGIN_ROOT is set', () => {
    const env = { GROK_PLUGIN_ROOT: '/tmp/plugin-root' } as NodeJS.ProcessEnv;
    expect(resolveOmcCliPrefix({ omcAvailable: false, env }))
      .toBe('node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs');
    expect(formatOmcCliInvocation('autoresearch --mission "m"', { omcAvailable: false, env }))
      .toBe('node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs autoresearch --mission "m"');
  });

  it('rewrites inline and list-form omg commands for plugin installs', () => {
    const env = { GROK_PLUGIN_ROOT: '/tmp/plugin-root' } as NodeJS.ProcessEnv;
    const input = [
      'Run `omg autoresearch --mission "m" --eval "e"`.',
      '- omg team api claim-task --input \'{}\' --json',
      '> omg ask codex --agent-prompt critic "check"',
    ].join('\n');

    const output = rewriteOmcCliInvocations(input, { omcAvailable: false, env });

    expect(output).toContain('`node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs autoresearch --mission "m" --eval "e"`');
    expect(output).toContain('- node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs team api claim-task --input \'{}\' --json');
    expect(output).toContain('> node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs ask codex --agent-prompt critic "check"');
  });

  it('routes ask invocations through the plugin bridge inside an active Claude session when GROK_PLUGIN_ROOT is set', () => {
    const env = {
      GROK_PLUGIN_ROOT: '/tmp/plugin-root',
      CLAUDECODE: '1',
      CLAUDE_SESSION_ID: 'session-123',
    } as NodeJS.ProcessEnv;

    expect(resolveOmcCliPrefix({ omcAvailable: false, env })).toBe('node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs');
    expect(formatOmcCliInvocation('ask codex --prompt "check"', { omcAvailable: false, env }))
      .toBe('node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs ask codex --prompt "check"');

    const input = [
      'Run `omg ask codex "review"`.',
      '> omg ask gemini --prompt "improve docs"',
    ].join('\n');

    const output = rewriteOmcCliInvocations(input, { omcAvailable: false, env });
    expect(output).toContain('`node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs ask codex "review"`');
    expect(output).toContain('> node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs ask gemini --prompt "improve docs"');
  });

  it('leaves text unchanged when omg remains the selected prefix', () => {
    const input = 'Use `omg team status demo` and\nomc team wait demo';
    expect(rewriteOmcCliInvocations(input, { omcAvailable: true, env: {} as NodeJS.ProcessEnv })).toBe(input);
  });
});
