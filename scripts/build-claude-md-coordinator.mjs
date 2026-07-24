#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';

const outfile = 'bridge/claude-md-coordinator.cjs';
// OMG prefers docs/GROK.md (ported from CLAUDE.md); fall back to AGENTS.md / CLAUDE.md
import { existsSync } from 'node:fs';
const canonicalSourcePath = ['docs/GROK.md', 'docs/AGENTS.md', 'docs/CLAUDE.md', 'AGENTS.md'].find(
  (p) => existsSync(p)
);
if (!canonicalSourcePath) {
  console.error('No coordinator source doc found (docs/GROK.md|AGENTS.md|CLAUDE.md); skip build');
  process.exit(0);
}
await mkdir('bridge', { recursive: true });
const source = await readFile(canonicalSourcePath);
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const sourceSha256 = createHash('sha256').update(source).digest('hex');
await esbuild.build({
  entryPoints: ['src/cli/claude-md-coordinator.ts'],
  bundle: true,
  preserveSymlinks: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile,
  external: ['node:crypto', 'node:fs', 'node:path'],
  define: {
    __OMC_COORDINATOR_ENGINE_VERSION__: JSON.stringify(packageJson.version),
    __OMC_COORDINATOR_SOURCE_SHA256__: JSON.stringify(sourceSha256),
  },
});
console.error(`Built ${outfile}`);
