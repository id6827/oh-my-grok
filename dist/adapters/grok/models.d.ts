/**
 * Map complexity tier aliases to Grok Build model slugs.
 *
 * Grok Build (this host) currently exposes a single coding model: `grok-4.5`.
 * Complexity tiers still exist so orchestration can classify work and map via env:
 *
 *   OMG_MODEL_LOW / OMC_MODEL_LOW
 *   OMG_MODEL_MEDIUM / OMC_MODEL_MEDIUM
 *   OMG_MODEL_HIGH / OMC_MODEL_HIGH
 *   OMG_MODEL_CRITICAL / OMC_MODEL_CRITICAL
 *
 * Defaults are all `grok-4.5` until the host exposes more slugs.
 * Set any env to `inherit` to force parent-session model inheritance.
 */
export type ClaudeTier = "opus" | "sonnet" | "haiku" | "inherit" | string;
export type ComplexityTier = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
/** Default Grok Build slug when the host has only one coding model. */
export declare const DEFAULT_GROK_BUILD_MODEL = "grok-4.5";
/**
 * Resolved Grok slugs (or `inherit`) per complexity tier.
 */
export declare function getGrokTierModels(): Record<ComplexityTier, string>;
/** @deprecated Prefer getGrokTierModels() */
export declare const MODEL_MAP: Record<string, string>;
/**
 * Grok-facing model slug or "inherit".
 */
export declare function mapModel(tier: ClaudeTier | undefined | null): string;
//# sourceMappingURL=models.d.ts.map