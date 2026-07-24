import { existsSync, readdirSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { atomicWriteJson } from "./atomic-write.js";
export function resolveStateDir(ws, sessionId) {
    const base = join(ws, ".omg", "state");
    if (sessionId) {
        const d = join(base, "sessions", sessionId);
        mkdirSync(d, { recursive: true });
        return d;
    }
    mkdirSync(base, { recursive: true });
    return base;
}
export function modePath(ws, mode, sessionId) {
    const safe = mode.replace(/[^a-zA-Z0-9._-]/g, "");
    return join(resolveStateDir(ws, sessionId), `${safe}-state.json`);
}
export function readMode(ws, mode, sessionId) {
    const p = modePath(ws, mode, sessionId);
    if (!existsSync(p))
        return null;
    try {
        return JSON.parse(readFileSync(p, "utf8"));
    }
    catch {
        return null;
    }
}
export function writeMode(ws, mode, data, sessionId) {
    const p = modePath(ws, mode, sessionId);
    data.updated_at = new Date().toISOString();
    atomicWriteJson(p, data);
    return p;
}
export function listActiveModes(ws, sessionId) {
    const dir = resolveStateDir(ws, sessionId);
    if (!existsSync(dir))
        return [];
    const out = [];
    for (const name of readdirSync(dir)) {
        if (!name.endsWith(".json"))
            continue;
        if ([
            "prd.json",
            "hud-state.json",
            "subagent-tracking.json",
            "session-end.json",
            "skill-active-state.json",
        ].includes(name))
            continue;
        try {
            const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
            const active = data.active === true ||
                data.state?.active === true;
            out.push({
                file: name,
                mode: String(data.mode || name.replace(/-state\.json$/, "")),
                phase: data.current_phase || null,
                active,
            });
        }
        catch {
            /* skip */
        }
    }
    return out.filter((m) => m.active);
}
