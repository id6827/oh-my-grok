#!/usr/bin/env node
/**
 * Grok Build MCP launcher for the full OMG tools server (OMC-parity surface).
 *
 * Prefers esbuild bundle bridge/mcp-server.cjs; falls back to dist standalone.
 * Stdio is inherited so the host (Grok Build) speaks standard MCP.
 *
 * Build if missing:
 *   npm run build && npm run build:bridge
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bridgeEntry = join(root, "bridge", "mcp-server.cjs");
const distEntry = join(root, "dist", "mcp", "standalone-server.js");

function ensureBridge() {
  if (existsSync(bridgeEntry)) return bridgeEntry;
  // Best-effort local generate (dev checkouts; not committed)
  const r = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "build:bridge"],
    { cwd: root, encoding: "utf8", env: process.env }
  );
  if (existsSync(bridgeEntry)) return bridgeEntry;
  if (existsSync(distEntry)) return distEntry;
  console.error(
    "[omg-tools-mcp] No server entry found.\n" +
      `  tried: ${bridgeEntry}\n` +
      `  tried: ${distEntry}\n` +
      (r.stderr || r.stdout || "") +
      "\nRun: npm run build && npm run build:bridge"
  );
  process.exit(1);
}

const entry = ensureBridge();

// Host env aliases: OMC-era vars still accepted by ported runtime
const env = {
  ...process.env,
  GROK_PLUGIN_ROOT:
    process.env.GROK_PLUGIN_ROOT ||
    process.env.CLAUDE_PLUGIN_ROOT ||
    root,
  CLAUDE_PLUGIN_ROOT:
    process.env.CLAUDE_PLUGIN_ROOT ||
    process.env.GROK_PLUGIN_ROOT ||
    root,
};

const child = spawn(process.execPath, [entry], {
  stdio: "inherit",
  cwd: root,
  env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
