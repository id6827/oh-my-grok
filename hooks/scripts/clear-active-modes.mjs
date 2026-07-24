#!/usr/bin/env node
/**
 * Deactivate all OMG mode state files under .omg/state/.
 * Used by cancel keyword path and can be run standalone:
 *   node hooks/scripts/clear-active-modes.mjs [workspaceRoot]
 */
import { readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function clearActiveModes(ws) {
  const stateDir = join(ws, ".omg", "state");
  if (!existsSync(stateDir)) return { cleared: [], skipped: true };
  const cleared = [];
  const now = new Date().toISOString();
  for (const name of readdirSync(stateDir)) {
    if (!name.endsWith(".json")) continue;
    if (name === "prd.json") continue;
    const path = join(stateDir, name);
    let data;
    try {
      data = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      continue;
    }
    if (!data || typeof data !== "object") continue;
    const wasActive = data.active === true || data.state?.active === true;
    if (!wasActive && data.current_phase !== "deep-interview") {
      // still force-clear known mode files that look active-ish
      if (!String(name).includes("state")) continue;
    }
    data.active = false;
    if (data.state && typeof data.state === "object") {
      data.state.active = false;
    }
    data.current_phase = data.current_phase || "cancelled";
    if (
      !["cancelled", "canceled", "completed", "pending-approval", "pending approval"].includes(
        String(data.current_phase).toLowerCase()
      )
    ) {
      data.current_phase = "cancelled";
    }
    data.updated_at = now;
    data.cancelled_at = now;
    data.cancel_source = "clear-active-modes";
    writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
    cleared.push(name);
  }
  return { cleared, skipped: false };
}

// CLI
const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("clear-active-modes.mjs") ||
    process.argv[1].includes("clear-active-modes"));

if (isMain) {
  const ws = process.argv[2] || process.env.GROK_WORKSPACE_ROOT || process.cwd();
  const result = clearActiveModes(ws);
  process.stdout.write(JSON.stringify(result) + "\n");
}
