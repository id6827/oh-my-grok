#!/usr/bin/env node
/**
 * Lightweight evidence that subset-freeze feature skills exist and are loadable.
 * Does not run full engines — checks skill files + optional keyword/state contracts.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '../..');

const SKILLS = [
  'ultragoal',
  'autoresearch',
  'ralph',
  'ralplan',
  'ultraqa',
  'skillify',
  'learner',
  'verify',
  'hud',
  'team',
  'omg-doctor',
];

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}
function ok(msg) {
  console.log(`ok: ${msg}`);
}

for (const name of SKILLS) {
  const skillMd = join(ROOT, 'skills', name, 'SKILL.md');
  if (!existsSync(skillMd)) fail(`missing skills/${name}/SKILL.md`);
  const body = readFileSync(skillMd, 'utf8');
  if (!body.includes('name:') && !body.startsWith('---')) {
    // frontmatter optional for some; still require non-empty
  }
  if (body.trim().length < 40) fail(`skills/${name}/SKILL.md too short`);
  ok(`skill ${name}`);
}

// learner is alias of skillify — skillify must mention skillify or frontmatter
const skillify = readFileSync(join(ROOT, 'skills/skillify/SKILL.md'), 'utf8');
if (!/skillify|Skillify/i.test(skillify)) fail('skillify skill missing identity');
ok('skillify identity');

// HUD skill documents --preset (optional wave 1)
const hud = readFileSync(join(ROOT, 'skills/hud/SKILL.md'), 'utf8');
if (!hud.includes('--preset')) fail('hud skill should document --preset');
ok('hud skill documents --preset');

// plugins list skills dir count
const skillDirs = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
if (skillDirs.length < 30) fail(`expected ≥30 skill dirs, got ${skillDirs.length}`);
ok(`skills dir count=${skillDirs.length}`);

console.log('All checks passed');
