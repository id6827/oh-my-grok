/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

interface HooksConfig {
  hooks?: Record<string, Array<{ hooks?: Array<{ command?: string }> }>>;
}

interface HookCommandEntry {
  event: string;
  command: string;
}

const hooksJsonPath = join(__dirname, '..', '..', 'hooks', 'hooks.json');

function expandHookCommandArgv(command: string, pluginRoot: string): string[] {
  const shellScript =
    `eval "set -- $HOOK_COMMAND"; ` +
    `node -e 'console.log(JSON.stringify(process.argv.slice(1)))' -- "$@"`;

  return JSON.parse(
    execFileSync('bash', ['-lc', shellScript], {
      encoding: 'utf-8',
      env: {
        ...process.env,
        HOOK_COMMAND: command,
        GROK_PLUGIN_ROOT: pluginRoot,
        CLAUDE_PLUGIN_ROOT: pluginRoot,
      },
    }).trim()
  ) as string[];
}

function getHookCommands(): HookCommandEntry[] {
  const raw = JSON.parse(readFileSync(hooksJsonPath, 'utf-8')) as HooksConfig;
  return Object.entries(raw.hooks ?? {}).flatMap(([event, groups]) =>
    groups.flatMap(group =>
      (group.hooks ?? [])
        .map(hook => hook.command)
        .filter((command): command is string => typeof command === 'string')
        .map(command => ({ event, command })),
    ),
  );
}

/** OMG dual-read root expansion used by hooks/hooks.json */
const DUAL_ROOT = /\$\{GROK_PLUGIN_ROOT:-\$CLAUDE_PLUGIN_ROOT\}|\$GROK_PLUGIN_ROOT/;

describe('hooks.json command escaping', () => {
  it('uses portable dual-read hook commands without absolute /bin/sh or find-node bootstraps', () => {
    for (const { command } of getHookCommands()) {
      expect(command).toMatch(DUAL_ROOT);
      expect(command).not.toContain('find-node.sh');
      expect(command).not.toContain('/bin/sh');
      // Prefer direct node hooks/scripts, or bash session-start.sh wrapper
      expect(command.startsWith('node ') || command.startsWith('bash ')).toBe(true);
    }
  });

  it('keeps Windows-style plugin roots with spaces intact when bash expands the command', () => {
    const pluginRoot = '/c/Users/First Last/.grok/plugins/cache/omg/oh-my-grok/0.9.0-rc.1';

    for (const { command } of getHookCommands()) {
      // bash session-start is a shell script path; node hooks expand cleanly
      if (command.startsWith('bash ')) continue;

      const argv = expandHookCommandArgv(command, pluginRoot);

      expect(argv[0]).toBe('node');
      expect(argv[1]).toContain(pluginRoot);
      expect(argv[1]).toContain('First Last');
      expect(argv).not.toContain('/c/Users/First');
    }
  });
});
