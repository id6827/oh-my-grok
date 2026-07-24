/**
 * Shim for @anthropic-ai/claude-agent-sdk — not used on Grok Build host.
 */
export type AgentDefinition = {
    description?: string;
    prompt?: string;
    tools?: string[];
    model?: string;
    [key: string]: unknown;
};
export type McpServerConfig = {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: unknown;
};
export type Options = {
    agents?: Record<string, AgentDefinition>;
    mcpServers?: Record<string, McpServerConfig>;
    [key: string]: unknown;
};
export type ToolHandler = (...args: unknown[]) => unknown | Promise<unknown>;
export declare function createSdkMcpServer(_opts?: unknown): unknown;
/** Minimal tool() helper matching agent SDK shape used by ported tools. */
export declare function tool(name: string, description: string, schema: unknown, handler: ToolHandler): {
    name: string;
    description: string;
    inputSchema: unknown;
    handler: ToolHandler;
};
declare const _default: {
    createSdkMcpServer: typeof createSdkMcpServer;
    tool: typeof tool;
};
export default _default;
//# sourceMappingURL=claude-agent-sdk.d.ts.map