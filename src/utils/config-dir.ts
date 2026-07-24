/**
 * Grok / Claude configuration directory resolution
 *
 * Resolves the active host configuration directory, honouring
 * GROK_CONFIG_DIR then CLAUDE_CONFIG_DIR (absolute path, or ~-prefixed)
 * with fallback to ~/.grok.  Trailing separators are stripped; filesystem
 * roots are preserved.
 *
 * Multi-surface mirrors (keep in sync):
 *   scripts/lib/config-dir.mjs   — ESM hook/HUD runtime
 *   scripts/lib/config-dir.cjs   — CJS bridge runtime
 *   scripts/lib/config-dir.sh    — POSIX shell runtime
 */

import { join, normalize, parse, sep } from 'path';
import { homedir } from 'os';

/**
 * Strip a single trailing path separator (preserve filesystem root).
 * @internal Shared with scripts/lib/config-dir.{mjs,cjs,sh} — keep in sync.
 */
function stripTrailingSep(p: string): string {
  if (!p.endsWith(sep)) {
    return p;
  }
  return p === parse(p).root ? p : p.slice(0, -1);
}

/**
 * Resolve the host configuration directory (Grok primary, Claude dual-read).
 *
 * Priority: GROK_CONFIG_DIR → CLAUDE_CONFIG_DIR → ~/.grok
 * Trailing separators are stripped; filesystem roots are preserved.
 */
export function getClaudeConfigDir(): string {
  const home = homedir();
  const configured =
    process.env.GROK_CONFIG_DIR?.trim() ||
    process.env.CLAUDE_CONFIG_DIR?.trim();

  if (!configured) {
    return stripTrailingSep(normalize(join(home, '.grok')));
  }

  if (configured === '~') {
    return stripTrailingSep(normalize(home));
  }

  if (configured.startsWith('~/') || configured.startsWith('~\\')) {
    return stripTrailingSep(normalize(join(home, configured.slice(2))));
  }

  return stripTrailingSep(normalize(configured));
}

/**
 * Resolve the OMG global configuration/cache directory under the active host
 * config dir. This keeps hook/updater/HUD caches aligned with GROK_CONFIG_DIR
 * instead of mixing in ~/.omg.
 */
export function getOmcConfigDir(): string {
  return join(getClaudeConfigDir(), '.omg');
}

/** Resolve the canonical update-check cache file path. */
export function getUpdateCheckCachePath(): string {
  return join(getOmcConfigDir(), 'update-check.json');
}
