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
export const DEFAULT_GROK_BUILD_MODEL = "grok-4.5";

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return undefined;
}

/**
 * Resolved Grok slugs (or `inherit`) per complexity tier.
 * Env overrides enable multi-model routing when the host exposes more slugs.
 */
export function getGrokTierModels(): Record<ComplexityTier, string> {
  return {
    LOW:
      readEnv("OMG_MODEL_LOW", "OMC_MODEL_LOW") ?? DEFAULT_GROK_BUILD_MODEL,
    MEDIUM:
      readEnv("OMG_MODEL_MEDIUM", "OMC_MODEL_MEDIUM") ?? DEFAULT_GROK_BUILD_MODEL,
    HIGH:
      readEnv("OMG_MODEL_HIGH", "OMC_MODEL_HIGH") ?? DEFAULT_GROK_BUILD_MODEL,
  };
}

/** @deprecated Prefer getGrokTierModels(); kept for call sites expecting a static map. */
export const MODEL_MAP: Record<string, string> = {
  opus: DEFAULT_GROK_BUILD_MODEL,
  sonnet: DEFAULT_GROK_BUILD_MODEL,
  haiku: DEFAULT_GROK_BUILD_MODEL,
  high: DEFAULT_GROK_BUILD_MODEL,
  medium: DEFAULT_GROK_BUILD_MODEL,
  low: DEFAULT_GROK_BUILD_MODEL,
  inherit: "inherit",
};

function normalizeTierAlias(tier: string): ComplexityTier | "inherit" | "passthrough" {
  const t = tier.toLowerCase().trim();
  if (!t || t === "inherit" || t === "default" || t === "parent") return "inherit";
  if (t === "low" || t === "haiku" || t.includes("haiku") || t.includes("fast") || t.includes("mini")) {
    return "LOW";
  }
  if (t === "high" || t === "opus" || t.includes("opus") || t.includes("max") || t.includes("heavy")) {
    return "HIGH";
  }
  if (t === "medium" || t === "sonnet" || t.includes("sonnet") || t === "standard") {
    return "MEDIUM";
  }
  // Explicit Grok / third-party slug (e.g. grok-4.5) — pass through
  if (t.startsWith("grok-") || t.includes("/") || t.includes(".")) {
    return "passthrough";
  }
  // Unknown bare word — treat as medium complexity
  return "MEDIUM";
}

/**
 * Grok-facing model slug or "inherit".
 *
 * - `inherit` / empty → parent session model
 * - haiku|sonnet|opus|low|medium|high → tier map (default all `grok-4.5`)
 * - explicit `grok-*` (or other host slug) → passed through unchanged
 */
export function mapModel(tier: ClaudeTier | undefined | null): string {
  if (tier == null || tier === "") return "inherit";
  const kind = normalizeTierAlias(String(tier));
  if (kind === "inherit") return "inherit";
  if (kind === "passthrough") return String(tier).trim();
  return getGrokTierModels()[kind];
}
