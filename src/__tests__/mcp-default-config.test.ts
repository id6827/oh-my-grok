/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('default MCP config', () => {
  it('does not enable team MCP server by default', () => {
    const raw = readFileSync(join(__dirname, '..', '..', '.mcp.json'), 'utf-8');
    const parsed = JSON.parse(raw) as {
      mcpServers?: Record<string, unknown>;
    };

    expect(parsed.mcpServers).toBeTruthy();
    // Grok default server id is omg-tools (full tools launcher); legacy OMC used "t"
    expect(
      parsed.mcpServers?.["omg-tools"] || parsed.mcpServers?.t
    ).toBeTruthy();
    expect(parsed.mcpServers?.team).toBeUndefined();
  });
});
