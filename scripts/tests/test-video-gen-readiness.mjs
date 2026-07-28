#!/usr/bin/env node
import { resolveVideoGenReadiness, formatVideoGenDoctorLines } from '../lib/video-gen-readiness.mjs';

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
  console.log('ok:', msg);
}

{
  const r = resolveVideoGenReadiness({});
  assert(r.mode === 'unknown', 'default unknown');
}

{
  const r = resolveVideoGenReadiness({ GROK_ZDR: '1' });
  assert(r.mode === 'zdr_requires_sink', 'GROK_ZDR=1 → zdr_requires_sink');
}

{
  const r = resolveVideoGenReadiness({ OMG_VIDEO_GEN_MODE: 'ok' });
  assert(r.mode === 'ok', 'OMG_VIDEO_GEN_MODE=ok wins');
}

{
  const r = resolveVideoGenReadiness({
    GROK_ZDR: '1',
    OMG_VIDEO_GEN_MODE: 'ok',
  });
  assert(r.mode === 'ok', 'explicit mode overrides ZDR flag');
}

{
  const lines = formatVideoGenDoctorLines({ OMG_VIDEO_GEN_MODE: 'zdr_requires_sink' });
  assert(lines.some((l) => l === 'video_gen: zdr_requires_sink'), 'doctor line present');
  assert(lines.some((l) => l.includes('IMAGINE-VIDEO-ZDR')), 'remediation mentions docs');
}

console.log('All checks passed');
