#!/usr/bin/env node
/**
 * Grok Build MCP launcher for the full OMG tools server.
 *
 * IMPORTANT for host handshake reliability:
 * - Do NOT spawn a child process (stdio double-hop breaks some hosts).
 * - Do NOT run `npm run build:bridge` here (handshake times out).
 * - Load the CJS/ESM server entry in-process.
 *
 * Prepare once in the plugin checkout:
 *   npm run build && npm run build:bridge
 */
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bridgeEntry = join(root, "bridge", "mcp-server.cjs");
const distEntry = join(root, "dist", "mcp", "standalone-server.js");

process.env.GROK_PLUGIN_ROOT =
  process.env.GROK_PLUGIN_ROOT ||
  process.env.CLAUDE_PLUGIN_ROOT ||
  root;
process.env.CLAUDE_PLUGIN_ROOT =
  process.env.CLAUDE_PLUGIN_ROOT ||
  process.env.GROK_PLUGIN_ROOT ||
  root;

function die(msg) {
  console.error(`[omg-tools-mcp] ${msg}`);
  console.error(
    `[omg-tools-mcp] From plugin root (${root}) run:\n` +
      `  npm run build && npm run build:bridge`
  );
  process.exit(1);
}

if (existsSync(bridgeEntry)) {
  // In-process CJS load — server starts main() and owns stdio
  const require = createRequire(import.meta.url);
  require(bridgeEntry);
} else if (existsSync(distEntry)) {
  // ESM fallback (needs node_modules for @modelcontextprotocol/sdk)
  await import(pathToFileURL(distEntry).href);
} else {
  die(
    `No server entry.\n  missing: ${bridgeEntry}\n  missing: ${distEntry}`
  );
}
