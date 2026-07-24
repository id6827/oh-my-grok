/**
 * Map Claude model tiers to Grok Build model policy.
 * Default: inherit host model (do not hardcode Claude model IDs in agents).
 */
/** Grok-facing model slug or "inherit". */
export function mapModel(tier) {
    if (!tier || tier === "inherit")
        return "inherit";
    const t = String(tier).toLowerCase();
    if (t.includes("opus") || t.includes("sonnet") || t.includes("haiku")) {
        return "inherit";
    }
    // Allow explicit Grok / other slugs through
    return tier;
}
export const MODEL_MAP = {
    opus: "inherit",
    sonnet: "inherit",
    haiku: "inherit",
    inherit: "inherit",
};
//# sourceMappingURL=models.js.map