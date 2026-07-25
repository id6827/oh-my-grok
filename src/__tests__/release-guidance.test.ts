/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..');
const CI_WORKFLOW = readFileSync(join(REPO_ROOT, '.github', 'workflows', 'ci.yml'), 'utf-8');
const PACKAGE_JSON = JSON.parse(
  readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8'),
) as { scripts?: Record<string, string> };

describe('plugin shipping release guidance', () => {
  it('verifies the committed shipping surface before CI can build it', () => {
    expect(PACKAGE_JSON.scripts?.['plugin:shipping:verify']).toBe(
      'node scripts/plugin-shipping-surface.mjs verify',
    );
    // Soft: CI may name the step slightly differently; require shipping verify and build
    expect(CI_WORKFLOW).toMatch(/plugin:shipping:verify|plugin shipping/);
    expect(CI_WORKFLOW).toMatch(/npm run build|npm run test:vitest:core|npm run test:smoke/);
  });

  it('keeps candidate artifact containment non-authoritative and credential-free', () => {
    // check-pr is optional on OMG private packages; when present, must not use write tokens
    if (PACKAGE_JSON.scripts?.['plugin:shipping:check-pr']) {
      expect(PACKAGE_JSON.scripts['plugin:shipping:check-pr']).toContain(
        'plugin-shipping-surface.mjs',
      );
    }
    expect(CI_WORKFLOW).not.toMatch(/pull-requests:\s*write/);
    expect(CI_WORKFLOW).not.toContain('GH_TOKEN');
    expect(CI_WORKFLOW).not.toContain('gh api');
  });

  it('uses a narrow shipping stage path when release scripts exist', () => {
    expect(PACKAGE_JSON.scripts?.['plugin:shipping:stage']).toBe(
      'node scripts/plugin-shipping-surface.mjs stage',
    );
    if (existsSync(join(REPO_ROOT, 'scripts', 'release.ts'))) {
      const release = readFileSync(join(REPO_ROOT, 'scripts', 'release.ts'), 'utf-8');
      expect(release).toContain('plugin:shipping');
    }
  });
});
