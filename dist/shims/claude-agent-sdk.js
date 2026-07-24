/**
 * Shim for @anthropic-ai/claude-agent-sdk — not used on Grok Build host.
 */
export function createSdkMcpServer(_opts) {
    return { name: "omg-shim-mcp", tools: [] };
}
/** Minimal tool() helper matching agent SDK shape used by ported tools. */
export function tool(name, description, schema, handler) {
    return { name, description, inputSchema: schema, handler };
}
export default {
    createSdkMcpServer,
    tool,
};
//# sourceMappingURL=claude-agent-sdk.js.map