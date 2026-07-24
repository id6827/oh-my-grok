/**
 * Map Claude model tiers to Grok Build model policy.
 * Default: inherit host model (do not hardcode Claude model IDs in agents).
 */
export type ClaudeTier = "opus" | "sonnet" | "haiku" | "inherit" | string;
/** Grok-facing model slug or "inherit". */
export declare function mapModel(tier: ClaudeTier | undefined | null): string;
export declare const MODEL_MAP: Record<string, string>;
//# sourceMappingURL=models.d.ts.map