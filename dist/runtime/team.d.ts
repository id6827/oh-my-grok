export type AgentKind = "codex" | "gemini" | "claude" | "cursor" | "grok" | "executor" | "antigravity";
export type TeamSpec = {
    count: number;
    agent: AgentKind;
    task: string;
};
export type TeamState = {
    active: boolean;
    name: string;
    created_at: string;
    updated_at: string;
    agent: AgentKind;
    count: number;
    task: string;
    tmux_session: string;
    dry_run: boolean;
    workers: Array<{
        id: string;
        pane?: string;
        status: "planned" | "running" | "done" | "failed";
        heartbeat?: string;
    }>;
};
/** Parse `2:codex` or `3:executor` */
export declare function parseAgentSpec(spec: string): {
    count: number;
    agent: AgentKind;
};
export declare function hasTmux(): boolean;
export declare function resolveAgentBin(agent: AgentKind): string | null;
export declare function teamStatePath(ws: string): string;
export declare function bridgeDir(ws: string, name: string): string;
export declare function planTeam(ws: string, spec: TeamSpec, name?: string, opts?: {
    dryRun?: boolean;
}): TeamState;
export declare function readTeamState(ws: string): TeamState | null;
export declare function shutdownTeam(ws: string, name?: string): TeamState | null;
