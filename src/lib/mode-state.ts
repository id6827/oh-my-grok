import { existsSync, readdirSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteJsonSync } from "./atomic-write.js";

export type ModeState = {
  active?: boolean;
  mode?: string;
  current_phase?: string;
  updated_at?: string;
  state?: Record<string, unknown>;
  [k: string]: unknown;
};

export function resolveStateDir(ws: string, sessionId?: string): string {
  const base = join(ws, ".omg", "state");
  if (sessionId) {
    const d = join(base, "sessions", sessionId);
    mkdirSync(d, { recursive: true });
    return d;
  }
  mkdirSync(base, { recursive: true });
  return base;
}

export function modePath(ws: string, mode: string, sessionId?: string): string {
  const safe = mode.replace(/[^a-zA-Z0-9._-]/g, "");
  return join(resolveStateDir(ws, sessionId), `${safe}-state.json`);
}

export function readMode(
  ws: string,
  mode: string,
  sessionId?: string
): ModeState | null {
  const p = modePath(ws, mode, sessionId);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as ModeState;
  } catch {
    return null;
  }
}

export function writeMode(
  ws: string,
  mode: string,
  data: ModeState,
  sessionId?: string
): string {
  const p = modePath(ws, mode, sessionId);
  data.updated_at = new Date().toISOString();
  atomicWriteJsonSync(p, data);
  return p;
}

export function listActiveModes(
  ws: string,
  sessionId?: string
): Array<{ mode: string; phase: string | null; file: string; active: boolean }> {
  const dir = resolveStateDir(ws, sessionId);
  if (!existsSync(dir)) return [];
  const out: Array<{
    mode: string;
    phase: string | null;
    file: string;
    active: boolean;
  }> = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    if (
      [
        "prd.json",
        "hud-state.json",
        "subagent-tracking.json",
        "session-end.json",
        "skill-active-state.json",
      ].includes(name)
    )
      continue;
    try {
      const data = JSON.parse(
        readFileSync(join(dir, name), "utf8")
      ) as ModeState;
      const active =
        data.active === true ||
        (data.state as { active?: boolean } | undefined)?.active === true;
      out.push({
        file: name,
        mode: String(data.mode || name.replace(/-state\.json$/, "")),
        phase: (data.current_phase as string) || null,
        active,
      });
    } catch {
      /* skip */
    }
  }
  return out.filter((m) => m.active);
}
