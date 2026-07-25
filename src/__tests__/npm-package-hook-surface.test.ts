/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MCP_JSON_PATH,
  PACKAGE_ROOT,
  PLUGIN_JSON_PATH,
  listSourceControlledPackageFiles,
  readPluginMcpServers,
  referencesRootMcpConfig,
  referencesStandardHooksManifest,
  type PluginJson,
} from './npm-package-surface-helpers.js';

describe('npm package hook surface regression', () => {
  it('builds the package without baking coordinator into ordinary test entrypoints', () => {
    const packageJson = JSON.parse(
      readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf-8'),
    ) as {
      files?: string[];
      scripts?: Record<string, string>;
    };

    // OMG: plain tsc build; optional coordinator via build:bridge:extra
    expect(packageJson.scripts?.build).toMatch(/tsc/);
    expect(packageJson.scripts?.['build:bridge:extra'] ?? '').toMatch(/claude-md-coordinator|build-claude-md/);
    for (const entrypoint of ['test', 'test:ui', 'test:run', 'test:coverage']) {
      if (packageJson.scripts?.[entrypoint]) {
        expect(packageJson.scripts[entrypoint], entrypoint).not.toContain(
          'build:claude-md-coordinator',
        );
      }
    }
    expect(packageJson.scripts?.prepublishOnly ?? packageJson.scripts?.build).toMatch(/build|tsc/);
  });

  it('keeps the source-controlled plugin and MCP manifests wired to exact standard entrypoints', () => {
    expect(existsSync(PLUGIN_JSON_PATH)).toBe(true);
    expect(existsSync(MCP_JSON_PATH)).toBe(true);

    const pluginJson = JSON.parse(
      readFileSync(PLUGIN_JSON_PATH, 'utf-8'),
    ) as PluginJson;
    // Root plugin.json may omit hooks field (Grok discovers hooks/hooks.json)
    if (pluginJson.hooks !== undefined) {
      expect(referencesStandardHooksManifest(pluginJson.hooks)).toBe(true);
    }
    if (pluginJson.mcpServers !== undefined) {
      expect(referencesRootMcpConfig(pluginJson.mcpServers)).toBe(true);
    }

    const servers = Object.values(readPluginMcpServers());
    expect(servers.length).toBeGreaterThan(0);
    expect(servers.some((s) => JSON.stringify(s).includes('mcp-server') || JSON.stringify(s).includes('run-tools'))).toBe(true);
  });

  it('keeps the complete hook dependency and template payload source-controlled', () => {
    const requiredFiles = listSourceControlledPackageFiles();

    expect(requiredFiles.length).toBeGreaterThan(0);
    // omg-setup command may be commands/omg-setup.md or skills/omg-setup
    const hasSetup =
      requiredFiles.some((f) => f.includes('omg-setup')) ||
      existsSync(join(PACKAGE_ROOT, 'commands', 'omg-setup.md')) ||
      existsSync(join(PACKAGE_ROOT, 'skills', 'omg-setup', 'SKILL.md'));
    expect(hasSetup).toBe(true);
  });
});
