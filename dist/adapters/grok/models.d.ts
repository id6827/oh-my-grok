/**
 * Map Claude-era / complexity tier aliases to Grok Build model slugs.
 *
 * Grok Build (this host) currently exposes a single coding model: `grok-4.5`.
 * Complexity tiers (LOW / MEDIUM / HIGH, or haiku / sonnet / opus aliases) still
 * exist so skills can express intent. All tiers default to `grok-4.5` until xAI
 * ships additional Build slugs; override via env without code changes:
 *
 *   OMG_MODEL_LOW / OMC_MODEL_LOW
 *   OMG_MODEL_MEDIUM / OMC_MODEL_MEDIUM
 *   OMG_MODEL_HIGH / OMC_MODEL_HIGH
 *
 * Set any of those to `inherit` to force parent-session model inheritance.
 */
export type ClaudeTier = "opus" | "sonnet" | "haiku" | "inherit" | string;
export type ComplexityTier = "LOW" | "MEDIUM" | "HIGH";
/** Default Grok Build slug when the host has only one coding model. */
export declare const DEFAULT_GROK_BUILD_MODEL = "grok-4.5";
/**
 * Resolved Grok slugs (or `inherit`) per complexity tier.
 * Env overrides enable multi-model routing when the host exposes more slugs.
 */
export declare function getGrokTierModels(): Record<ComplexityTier, string>;
/** @deprecated Prefer getGrokTierModels(); kept for call sites expecting a static map. */
export declare const MODEL_MAP: Record<string, string>;
/**
 * Grok-facing model slug or "inherit".
 *
 * - `inherit` / empty → parent session model
 * - haiku|sonnet|opus|low|medium|high → tier map (default all `grok-4.5`)
 * - explicit `grok-*` (or other host slug) → passed through unchanged
 */
export declare function mapModel(tier: ClaudeTier | undefined | null): string;
//# sourceMappingURL=models.d.ts.map