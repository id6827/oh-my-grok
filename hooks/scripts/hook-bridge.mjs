#!/usr/bin/env node
/**
 * Thin launcher for the built TypeScript hook bridge (dist/hooks/bridge.js).
 * Falls back to printing continue:true if dist is missing.
 *
 * Usage: node hook-bridge.mjs --hook=<type>
 * stdin: JSON hook payload
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const entry = join(root, "dist/hooks/bridge.js");

if (!existsSync(entry)) {
  console.error("[hook-bridge] dist/hooks/bridge.js missing — run npm run build");
  // fail-open for session continuity
  process.stdout.write(JSON.stringify({ continue: true }) + "\n");
  process.exit(0);
}

const r = spawnSync(process.execPath, [entry, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});
process.exit(r.status ?? 1);
