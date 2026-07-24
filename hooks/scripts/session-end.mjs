#!/usr/bin/env node
/**
 * SessionEnd: stamp session end, refresh HUD (do not wipe active modes — user may resume).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  readStdinJson,
  workspaceRoot,
  ensureOmgTree,
  listActiveModes,
} from "./lib/hook-io.mjs";
import { refreshHud } from "./lib/hud.mjs";

async function main() {
  const input = await readStdinJson();
  const ws = workspaceRoot(input);
  ensureOmgTree(ws);
  const modes = listActiveModes(ws);
  const now = new Date().toISOString();
  const dir = join(ws, ".omg", "state");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "session-end.json"),
    JSON.stringify(
      {
        ended_at: now,
        reason: input.reason || input.endReason || "session_end",
        active_modes_at_end: modes.map((m) => m.mode),
      },
      null,
      2
    ) + "\n"
  );
  refreshHud(ws, { last_hook: "SessionEnd", session_ended: true });
  process.exit(0);
}

main().catch(() => process.exit(0));
