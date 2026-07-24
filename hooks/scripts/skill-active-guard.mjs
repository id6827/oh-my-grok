#!/usr/bin/env node
/**
 * Skill-active protection: if skill-active-state.json or orchestration modes
 * are active, inject a reminder not to drop the protocol mid-turn.
 * Also re-asserts skill-active stamp when modes are active (state consistency).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  readStdinJson,
  workspaceRoot,
  listActiveModes,
  emitAdditionalContext,
  omgRoot,
} from "./lib/hook-io.mjs";
import { atomicWriteJson } from "./lib/atomic-write.mjs";
import { refreshHud } from "./lib/hud.mjs";

async function main() {
  const input = await readStdinJson();
  const ws = workspaceRoot(input);
  const modes = listActiveModes(ws);
  const skillActivePath = join(omgRoot(ws), "state", "skill-active-state.json");

  let skillActive = null;
  if (existsSync(skillActivePath)) {
    try {
      skillActive = JSON.parse(readFileSync(skillActivePath, "utf8"));
    } catch {
      skillActive = null;
    }
  }

  if (!modes.length && !skillActive?.active) {
    process.exit(0);
  }

  // Re-stamp skill-active when modes running
  if (modes.length) {
    atomicWriteJson(skillActivePath, {
      active: true,
      modes: modes.map((m) => m.mode),
      updated_at: new Date().toISOString(),
      source: "skill-active-guard",
    });
  }

  refreshHud(ws, { last_hook: "skill-active-guard" });

  const names = modes.map((m) => m.mode).join(", ") || skillActive?.mode || "skill";
  emitAdditionalContext(
    "UserPromptSubmit",
    `[OMG skill-active-guard] Protected modes/skills active: ${names}. Do not abandon protocol; update .omg/state; use /cancel only on explicit user cancel.`
  );
  process.exit(0);
}

main().catch(() => process.exit(0));
