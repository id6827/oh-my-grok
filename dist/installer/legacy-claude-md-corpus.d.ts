/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 *
 * Exact historical CLAUDE.md guide variants for legacy detection.
 * openingLine/finalLine MUST match dataBase64 content (do not brand-rename metadata alone).
 */
export type LegacyGuideVariant = {
    id: string;
    sourceCommit: string;
    gitBlobSha: string;
    rawByteLength: number;
    rawSha256: string;
    lineCount: number;
    terminalEolPolicy: 'required' | 'forbidden' | 'optional';
    openingLine: string;
    finalLine: string;
    markerless: boolean;
    dataBase64: string;
    normalizedSha256: string;
};
export declare const LEGACY_CLAUDE_MD_VARIANTS: readonly LegacyGuideVariant[];
//# sourceMappingURL=legacy-claude-md-corpus.d.ts.map