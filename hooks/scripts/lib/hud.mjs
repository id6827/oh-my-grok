/**
 * File-based HUD for OMG (Claude statusline substitute).
 * Writes .omg/state/hud-status.txt and hud-state.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { listActiveModes, omgRoot } from "./hook-io.mjs";

export function refreshHud(ws, extra = {}) {
  try {
    const root = omgRoot(ws);
    const stateDir = join(root, "state");
    mkdirSync(stateDir, { recursive: true });
    const modes = listActiveModes(ws);
    const active = modes.filter((m) => m.mode);
    const now = new Date().toISOString();
    const line =
      active.length === 0
        ? `OMG idle | ${now.slice(0, 19)}Z`
        : `OMG ACTIVE: ${active.map((m) => `${m.mode}${m.phase ? "@" + m.phase : ""}`).join(", ")} | ${now.slice(0, 19)}Z`;

    const payload = {
      updated_at: now,
      active_modes: active.map((m) => ({
        mode: m.mode,
        phase: m.phase,
        file: m.file,
      })),
      line,
      ...extra,
    };

    writeFileSync(join(stateDir, "hud-status.txt"), line + "\n", "utf8");
    writeFileSync(
      join(stateDir, "hud-state.json"),
      JSON.stringify(payload, null, 2) + "\n",
      "utf8"
    );
    return payload;
  } catch {
    return null;
  }
}
