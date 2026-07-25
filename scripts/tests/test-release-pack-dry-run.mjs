#!/usr/bin/env node
/**
 * Local dry-run of the release packaging bridge inject path.
 * Does not publish or require secrets.
 *
 * Mirrors .github/workflows/release.yml:
 *   npm run build:bridge → assert required bridge files → stage inject
 *   (skips npm pack of the whole monorepo for speed; builds a mini stage)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '../..');
const REQUIRED = [
  'bridge/cli.cjs',
  'bridge/claude-md-coordinator.cjs',
  'bridge/mcp-server.cjs',
  'bridge/runtime-cli.cjs',
  'bridge/team.js',
];

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`ok: ${msg}`);
}

// 1) build:bridge
const build = spawnSync('npm', ['run', 'build:bridge'], {
  cwd: ROOT,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
if (build.status !== 0) {
  console.error(build.stdout);
  console.error(build.stderr);
  fail('npm run build:bridge');
}
ok('build:bridge');

// 2) confirm on-disk artifacts
for (const f of REQUIRED) {
  if (!existsSync(join(ROOT, f))) fail(`missing ${f}`);
}
ok('required bridge files on disk');

// 3) inject into a stage package (gitignore means npm pack from git would omit them)
const stage = join(tmpdir(), `omg-release-stage-${Date.now()}`);
const pkg = join(stage, 'package');
mkdirSync(pkg, { recursive: true });
writeFileSync(
  join(pkg, 'package.json'),
  JSON.stringify({ name: 'oh-my-grok', version: '0.0.0-dry-run', type: 'module' }, null, 2),
);
for (const f of REQUIRED) {
  const dest = join(pkg, f);
  mkdirSync(join(dest, '..'), { recursive: true });
  cpSync(join(ROOT, f), dest);
  if (!existsSync(dest)) fail(`inject failed: ${f}`);
  const sha = createHash('sha256').update(readFileSync(dest)).digest('hex').slice(0, 12);
  ok(`injected ${f} (${sha})`);
}

// 4) light coordinator handshake when present
const coord = join(pkg, 'bridge/claude-md-coordinator.cjs');
const hs = spawnSync(process.execPath, [coord, '--handshake'], {
  cwd: ROOT,
  encoding: 'utf8',
  timeout: 15_000,
});
if (hs.status !== 0) {
  console.error(hs.stdout, hs.stderr);
  fail('coordinator --handshake');
}
const body = JSON.parse(hs.stdout);
if (body.schemaVersion !== 1 || typeof body.engineVersion !== 'string') {
  fail('handshake payload invalid');
}
ok(`coordinator handshake engineVersion=${body.engineVersion}`);

rmSync(stage, { recursive: true, force: true });
ok('release-pack dry-run complete');
console.log('All checks passed');
