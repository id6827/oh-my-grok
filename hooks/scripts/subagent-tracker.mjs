#!/usr/bin/env node
/**
 * SubagentStart / SubagentStop tracker — writes .omg/state/subagent-tracking.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  readStdinJson,
  workspaceRoot,
  omgRoot,
} from "./lib/hook-io.mjs";
import { refreshHud } from "./lib/hud.mjs";

function trackPath(ws) {
  return join(omgRoot(ws), "state", "subagent-tracking.json");
}

function load(ws) {
  const p = trackPath(ws);
  if (!existsSync(p)) return { agents: [], events: [] };
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return { agents: [], events: [] };
  }
}

function save(ws, data) {
  const dir = join(omgRoot(ws), "state");
  mkdirSync(dir, { recursive: true });
  data.updated_at = new Date().toISOString();
  // cap event log
  if (data.events?.length > 100) data.events = data.events.slice(-100);
  writeFileSync(trackPath(ws), JSON.stringify(data, null, 2) + "\n");
}

async function main() {
  const input = await readStdinJson();
  const ws = workspaceRoot(input);
  const event = String(
    input.hookEventName || process.env.GROK_HOOK_EVENT || ""
  ).toLowerCase();
  const data = load(ws);
  const now = new Date().toISOString();
  const agentType =
    input.agentType ||
    input.subagent_type ||
    input.subagentType ||
    input.toolInput?.subagent_type ||
    "unknown";
  const id =
    input.agentId ||
    input.subagentId ||
    input.toolUseId ||
    `${agentType}-${now}`;

  if (event.includes("start")) {
    data.agents = data.agents || [];
    data.agents.push({ id, agentType, started_at: now, status: "running" });
    data.events.push({ t: now, type: "start", id, agentType });
  } else {
    data.agents = (data.agents || []).map((a) =>
      a.id === id || (a.status === "running" && a.agentType === agentType)
        ? { ...a, status: "stopped", stopped_at: now }
        : a
    );
    data.events.push({ t: now, type: "stop", id, agentType });
  }

  // Keep only running + last 20 stopped
  const running = data.agents.filter((a) => a.status === "running");
  const stopped = data.agents.filter((a) => a.status !== "running").slice(-20);
  data.agents = [...running, ...stopped];

  save(ws, data);
  refreshHud(ws, {
    last_hook: event.includes("start") ? "SubagentStart" : "SubagentStop",
    subagents_running: running.length,
  });
  process.exit(0);
}

main().catch(() => process.exit(0));
