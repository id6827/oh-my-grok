/**
 * Map Claude model tiers to Grok Build model policy.
 * Default: inherit host model (do not hardcode Claude model IDs in agents).
 */

export type ClaudeTier = "opus" | "sonnet" | "haiku" | "inherit" | string;

/** Grok-facing model slug or "inherit". */
export function mapModel(tier: ClaudeTier | undefined | null): string {
  if (!tier || tier === "inherit") return "inherit";
  const t = String(tier).toLowerCase();
  if (t.includes("opus") || t.includes("sonnet") || t.includes("haiku")) {
    return "inherit";
  }
  // Allow explicit Grok / other slugs through
  return tier;
}

export const MODEL_MAP: Record<string, string> = {
  opus: "inherit",
  sonnet: "inherit",
  haiku: "inherit",
  inherit: "inherit",
};
