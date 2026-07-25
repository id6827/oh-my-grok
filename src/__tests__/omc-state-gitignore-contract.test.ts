/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

describe('.omg gitignore state contract', () => {
  it('ignores runtime .omg state while allowing project skills to be committed intentionally', () => {
    const gitignore = readFileSync(resolve(process.cwd(), '.gitignore'), 'utf-8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    // Accept .omg/** (current) or .omg/* (legacy) ignore styles
    const hasOmgIgnore = gitignore.some((l) => l === '.omg/**' || l === '.omg/*' || l === '.omg/');
    expect(hasOmgIgnore).toBe(true);
    expect(gitignore).toEqual(
      expect.arrayContaining(['!.omg/skills/', '!.omg/skills/**']),
    );

    const skillsIdx = gitignore.indexOf('!.omg/skills/');
    const skillsGlobIdx = gitignore.indexOf('!.omg/skills/**');
    expect(skillsIdx).toBeGreaterThanOrEqual(0);
    expect(skillsGlobIdx).toBeGreaterThan(skillsIdx);
  });
});
