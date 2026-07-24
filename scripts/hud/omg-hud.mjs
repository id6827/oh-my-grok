#!/usr/bin/env node
/**
 * OMG statusline / HUD renderer (Grok-compatible).
 * Reads project .omg/state from CWD (or GROK_WORKSPACE_ROOT).
 *
 *   node scripts/hud/omg-hud.mjs
 *   node scripts/hud/omg-hud.mjs --json
 *
 * Install:
 *   mkdir -p ~/.grok/hud && cp scripts/hud/omg-hud.mjs ~/.grok/hud/omg-hud.mjs
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ws =
  process.env.GROK_WORKSPACE_ROOT ||
  process.env.CLAUDE_PROJECT_DIR ||
  process.cwd();
const stateDir = join(ws, ".omg", "state");
const asJson = process.argv.includes("--json");

function readJson(path) {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function activeModes() {
  if (!existsSync(stateDir)) return [];
  const out = [];
  for (const name of readdirSync(stateDir)) {
    if (!name.endsWith("-state.json") && name !== "deep-interview-state.json")
      continue;
    const data = readJson(join(stateDir, name));
    if (!data) continue;
    if (!(data.active === true || data.state?.active === true)) continue;
    out.push({
      mode: data.mode || name.replace(/-state\.json$/, ""),
      phase: data.current_phase || data.state?.current_phase || null,
    });
  }
  return out;
}

function prdLine() {
  const prd = readJson(join(ws, ".omg", "prd.json"));
  if (!prd?.userStories) return null;
  const stories = prd.userStories;
  const done = stories.filter((s) => s.passes).length;
  const next = stories.find((s) => !s.passes);
  return `prd:${done}/${stories.length}${next ? ` next:${next.id}` : " done"}`;
}

function render() {
  const modes = activeModes();
  const now = new Date().toISOString().slice(0, 19) + "Z";
  const modeStr =
    modes.length === 0
      ? "idle"
      : modes.map((m) => `${m.mode}${m.phase ? "@" + m.phase : ""}`).join(",");

  const t = readJson(join(stateDir, "subagent-tracking.json"));
  const running = (t?.agents || []).filter((a) => a.status === "running");
  const agentsPart =
    running.length === 0
      ? "agents:0"
      : `agents:${running.length} [${running
          .slice(0, 6)
          .map((a) => (a.agentType || "?").slice(0, 8))
          .join(",")}]`;

  const parts = ["[OMG]", modeStr, prdLine(), agentsPart, now].filter(Boolean);
  const line1 = parts.join(" | ");
  const lines = [line1];

  running.slice(0, 5).forEach((a, i) => {
    const branch = i === Math.min(running.length, 5) - 1 ? "└─" : "├─";
    lines.push(
      `${branch} ${(a.agentType || "agent").padEnd(12)} ${a.id || ""}`.slice(
        0,
        80
      )
    );
  });

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          workspace: ws,
          line: line1,
          lines,
          modes,
          agents: running.length,
        },
        null,
        2
      )
    );
  } else {
    console.log(lines.join("\n"));
  }
}

render();
