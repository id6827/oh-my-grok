/**
 * Video generation readiness for ZDR-aware environments.
 * Used by `omg doctor` (and tests). Fail-open to `unknown` when platform
 * does not expose a stable ZDR flag.
 */

/** @typedef {'ok' | 'zdr_requires_sink' | 'unknown'} VideoGenMode */

const VALID = new Set(['ok', 'zdr_requires_sink', 'unknown']);

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ mode: VideoGenMode, source: string, remediation: string[] }}
 */
export function resolveVideoGenReadiness(env = process.env) {
  const explicit = (env.OMG_VIDEO_GEN_MODE || '').trim().toLowerCase();
  if (VALID.has(explicit)) {
    return {
      mode: /** @type {VideoGenMode} */ (explicit),
      source: 'OMG_VIDEO_GEN_MODE',
      remediation: remediationFor(/** @type {VideoGenMode} */ (explicit)),
    };
  }

  const zdr =
    truthy(env.GROK_ZDR) ||
    truthy(env.XAI_ZDR) ||
    truthy(env.ZERO_DATA_RETENTION) ||
    truthy(env.OMG_ZDR);

  if (zdr) {
    return {
      mode: 'zdr_requires_sink',
      source: 'env ZDR flag (GROK_ZDR|XAI_ZDR|ZERO_DATA_RETENTION|OMG_ZDR)',
      remediation: remediationFor('zdr_video_requires_sink'),
    };
  }

  return {
    mode: 'unknown',
    source: 'default (no platform ZDR signal)',
    remediation: remediationFor('unknown'),
  };
}

/**
 * @param {VideoGenMode | string} mode
 * @returns {string[]}
 */
function remediationFor(mode) {
  if (mode === 'ok') {
    return ['Video gen appears ready; still verify tool schema supports your team mode.'];
  }
  if (mode === 'zdr_requires_sink' || mode === 'zdr_video_requires_sink') {
    return [
      'ZDR teams need output_path or output_upload_url once the host supports them.',
      'Until host P0 ships, image_to_video may return 400 requiring output.upload_url.',
      'See docs/IMAGINE-VIDEO-ZDR.md and docs/design/imagine-video-zdr-host-contract.md',
      'Product demos may use ffmpeg-from-still as a temporary fallback only.',
    ];
  }
  return [
    'Platform did not expose a ZDR/video readiness signal.',
    'If video fails with output.upload_url, treat as ZDR and see docs/IMAGINE-VIDEO-ZDR.md',
    'Override: OMG_VIDEO_GEN_MODE=ok|zdr_requires_sink|unknown or GROK_ZDR=1',
  ];
}

/**
 * @param {string | undefined} v
 */
function truthy(v) {
  if (v == null || v === '') return false;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

/**
 * Format lines for CLI doctor output.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string[]}
 */
export function formatVideoGenDoctorLines(env = process.env) {
  const { mode, source, remediation } = resolveVideoGenReadiness(env);
  const lines = [
    '== video_gen ==',
    `video_gen: ${mode}`,
    `source: ${source}`,
  ];
  for (const r of remediation) {
    lines.push(`  - ${r}`);
  }
  return lines;
}
