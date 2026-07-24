export type ModeState = {
    active?: boolean;
    mode?: string;
    current_phase?: string;
    updated_at?: string;
    state?: Record<string, unknown>;
    [k: string]: unknown;
};
export declare function resolveStateDir(ws: string, sessionId?: string): string;
export declare function modePath(ws: string, mode: string, sessionId?: string): string;
export declare function readMode(ws: string, mode: string, sessionId?: string): ModeState | null;
export declare function writeMode(ws: string, mode: string, data: ModeState, sessionId?: string): string;
export declare function listActiveModes(ws: string, sessionId?: string): Array<{
    mode: string;
    phase: string | null;
    file: string;
    active: boolean;
}>;
//# sourceMappingURL=mode-state.d.ts.map