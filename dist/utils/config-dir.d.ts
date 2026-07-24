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
/**
 * Resolve the host configuration directory (Grok primary, Claude dual-read).
 *
 * Priority: GROK_CONFIG_DIR → CLAUDE_CONFIG_DIR → ~/.grok
 * Trailing separators are stripped; filesystem roots are preserved.
 */
export declare function getClaudeConfigDir(): string;
/**
 * Resolve the OMG global configuration/cache directory under the active host
 * config dir. This keeps hook/updater/HUD caches aligned with GROK_CONFIG_DIR
 * instead of mixing in ~/.omg.
 */
export declare function getOmcConfigDir(): string;
/** Resolve the canonical update-check cache file path. */
export declare function getUpdateCheckCachePath(): string;
//# sourceMappingURL=config-dir.d.ts.map