#!/usr/bin/env node
/**
 * Session-like smoke for Stop-registered workflow-drift-guard.
 * Feeds stdin JSON like a Stop hook and asserts block vs pass.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '../..');
const SCRIPT = join(ROOT, 'hooks/scripts/workflow-drift-guard.mjs');
const HOOKS = join(ROOT, 'hooks/hooks.json');

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}
function ok(msg) {
  console.log(`ok: ${msg}`);
}

if (!existsSync(SCRIPT)) fail('hooks/scripts/workflow-drift-guard.mjs missing');

// Registered on Stop
const hooks = JSON.parse(readFileSync(HOOKS, 'utf8'));
const stopCmds = (hooks.hooks?.Stop || [])
  .flatMap((g) => g.hooks || [])
  .map((h) => h.command || '');
const reg = stopCmds.find((c) => c.includes('workflow-drift-guard.mjs'));
if (!reg) fail('workflow-drift-guard not registered on Stop');
if (!/GROK_PLUGIN_ROOT/.test(reg)) fail('registration missing GROK_PLUGIN_ROOT dual-read');
ok('registered on Stop');

function run(message, env = {}) {
  const payload = JSON.stringify({
    last_assistant_message: message,
    stop_hook_active: false,
  });
  const r = spawnSync(process.execPath, [SCRIPT], {
    cwd: ROOT,
    encoding: 'utf8',
    input: payload,
    env: { ...process.env, ...env },
  });
  return r;
}

// Binary selection → block
const block = run('PostgreSQL or SQLite?');
if (block.status !== 0 && block.status !== null) {
  // some hooks exit 0 with JSON decision
}
const blockOut = (block.stdout || '') + (block.stderr || '');
let blockJson;
try {
  blockJson = JSON.parse((block.stdout || '').trim().split('\n').pop());
} catch {
  fail(`block case non-JSON: ${blockOut.slice(0, 200)}`);
}
const blocked =
  blockJson?.decision === 'block' ||
  blockJson?.continue === false ||
  /WORKFLOW DRIFT GUARD/i.test(JSON.stringify(blockJson));
if (!blocked) fail(`expected block for binary fork, got ${JSON.stringify(blockJson)}`);
ok('blocks binary selection fork');

// Open question → pass / no block
const pass = run('Should I proceed with the implementation plan?');
let passJson = {};
try {
  const line = (pass.stdout || '').trim();
  if (line) passJson = JSON.parse(line.split('\n').pop());
} catch {
  /* empty / suppress is ok */
}
const stillBlocked =
  passJson?.decision === 'block' || /WORKFLOW DRIFT GUARD/i.test(JSON.stringify(passJson));
if (stillBlocked) fail(`open question should fail-open, got ${JSON.stringify(passJson)}`);
ok('open question fail-open');

// skip env
const skipped = run('PostgreSQL or SQLite?', { OMC_SKIP_HOOKS: 'workflow-drift-guard' });
const skipOut = (skipped.stdout || '') + (skipped.stderr || '');
if (/WORKFLOW DRIFT GUARD/i.test(skipOut) && /decision.:.block/.test(skipOut)) {
  fail('OMC_SKIP_HOOKS should disable guard');
}
ok('OMC_SKIP_HOOKS respected or no-op');

console.log('All checks passed');
