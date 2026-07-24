#!/usr/bin/env node
/**
 * OMG statusline / HUD renderer.
 *
 *   node scripts/hud/omg-hud.mjs
 *   node scripts/hud/omg-hud.mjs --json
 *   node scripts/hud/omg-hud.mjs --watch [--interval 500]
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ws =
  process.env.GROK_WORKSPACE_ROOT ||
  process.env.CLAUDE_PROJECT_DIR ||
  process.cwd();
const stateDir = join(ws, ".omg", "state");
const asJson = process.argv.includes("--json");
const watch = process.argv.includes("--watch");
const intervalIdx = process.argv.indexOf("--interval");
const intervalMs = Math.max(
  200,
  parseInt(
    intervalIdx >= 0 ? process.argv[intervalIdx + 1] : process.env.OMG_HUD_INTERVAL || "500",
    10
  ) || 500
);
// for tests: only N ticks then exit
const ticksIdx = process.argv.indexOf("--ticks");
const maxTicks =
  ticksIdx >= 0 ? Math.max(1, parseInt(process.argv[ticksIdx + 1], 10) || 2) : 0;

function readJson(path) {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function gitBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: ws,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
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

function lastSkill() {
  const hud = readJson(join(stateDir, "hud-state.json"));
  return hud?.last_keyword || hud?.last_hook || null;
}

function buildLines() {
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

  const branch = gitBranch();
  const skill = lastSkill();
  const team = readJson(join(stateDir, "team-state.json"));
  const teamPart =
    team?.active ? `team:${team.name}(${team.count}x${team.agent})` : null;

  const parts = [
    "[OMG]",
    branch ? `br:${branch}` : null,
    modeStr,
    prdLine(),
    agentsPart,
    teamPart,
    skill ? `last:${skill}` : null,
    now,
  ].filter(Boolean);

  const line1 = parts.join(" | ");
  const lines = [line1];

  running.slice(0, 5).forEach((a, i) => {
    const branchChar = i === Math.min(running.length, 5) - 1 ? "└─" : "├─";
    lines.push(
      `${branchChar} ${(a.agentType || "agent").padEnd(12)} ${a.id || ""}`.slice(
        0,
        80
      )
    );
  });

  return { line1, lines, modes, agents: running.length };
}

function renderOnce() {
  const { line1, lines, modes, agents } = buildLines();
  if (asJson) {
    console.log(
      JSON.stringify({ workspace: ws, line: line1, lines, modes, agents }, null, 2)
    );
  } else {
    console.log(lines.join("\n"));
  }
  return line1;
}

if (!watch) {
  renderOnce();
} else {
  let n = 0;
  const tick = () => {
    if (!asJson) {
      // clear screen soft
      process.stdout.write("\x1b[2J\x1b[H");
    }
    renderOnce();
    n++;
    if (maxTicks && n >= maxTicks) process.exit(0);
  };
  tick();
  setInterval(tick, intervalMs);
}
