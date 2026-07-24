/**
 * Shared stdin/JSON helpers for OMG hooks (Grok camelCase envelope).
 */
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export async function readStdinJson() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { _raw: raw };
  }
}

export function workspaceRoot(input = {}) {
  return (
    input.workspaceRoot ||
    input.cwd ||
    process.env.GROK_WORKSPACE_ROOT ||
    process.env.CLAUDE_PROJECT_DIR ||
    process.cwd()
  );
}

export function omgRoot(ws) {
  return join(ws, ".omg");
}

export function ensureOmgTree(ws) {
  const root = omgRoot(ws);
  for (const sub of ["specs", "plans", "state", "artifacts", "skills"]) {
    mkdirSync(join(root, sub), { recursive: true });
  }
  return root;
}

export function readJsonSafe(path) {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

export function writeJson(path, obj) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

/** List active mode states under .omg/state/*-state.json */
export function listActiveModes(ws) {
  const stateDir = join(omgRoot(ws), "state");
  if (!existsSync(stateDir)) return [];
  const modes = [];
  for (const name of readdirSync(stateDir)) {
    if (!name.endsWith("-state.json") && name !== "deep-interview-state.json") continue;
    const data = readJsonSafe(join(stateDir, name));
    if (!data || typeof data !== "object") continue;
    const active = data.active === true || data.state?.active === true;
    if (!active) continue;
    const mode =
      data.mode ||
      data.current_phase ||
      data.state?.current_phase ||
      name.replace(/-state\.json$/, "");
    modes.push({
      file: name,
      mode: String(mode),
      phase: data.current_phase || data.state?.current_phase || null,
      data,
    });
  }
  return modes;
}

export function emitAdditionalContext(hookEventName, text) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName,
        additionalContext: text,
      },
    })
  );
}

export function emitStopBlock(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}
