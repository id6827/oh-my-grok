#!/usr/bin/env node
/**
 * Minimal MCP stdio server for OMG state tools (no external SDK).
 * Tools: state_list_active, state_read, state_write, state_clear
 *
 * Workspace resolution:
 *   OMG_STATE_CWD / GROK_WORKSPACE_ROOT / CLAUDE_PROJECT_DIR / cwd
 */
import { createInterface } from "node:readline";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const SERVER_INFO = { name: "omg-state", version: "0.5.0" };

function wsRoot() {
  return (
    process.env.OMG_STATE_CWD ||
    process.env.GROK_WORKSPACE_ROOT ||
    process.env.CLAUDE_PROJECT_DIR ||
    process.cwd()
  );
}

function stateDir() {
  const d = join(wsRoot(), ".omg", "state");
  mkdirSync(d, { recursive: true });
  return d;
}

function modeFile(mode) {
  const safe = String(mode || "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe) throw new Error("mode required");
  const preferred = join(stateDir(), `${safe}-state.json`);
  if (existsSync(preferred)) return preferred;
  const alt = join(stateDir(), `${safe}.json`);
  if (existsSync(alt)) return alt;
  return preferred;
}

function readMode(mode) {
  const path = modeFile(mode);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeMode(mode, data) {
  const path = modeFile(mode);
  mkdirSync(stateDir(), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  return path;
}

function listActive() {
  const dir = stateDir();
  const out = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    if (["prd.json", "hud-state.json", "precompact-snapshot.json", "subagent-tracking.json"].includes(name))
      continue;
    try {
      const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
      const active = data.active === true || data.state?.active === true;
      out.push({
        file: name,
        mode: data.mode || name.replace(/-state\.json$/, ""),
        active,
        phase: data.current_phase || data.state?.current_phase || null,
      });
    } catch {
      /* skip */
    }
  }
  return out;
}

function toolResult(obj) {
  return {
    content: [{ type: "text", text: JSON.stringify(obj, null, 2) }],
  };
}

const TOOLS = [
  {
    name: "state_list_active",
    description: "List OMG mode state files under .omg/state/ with active flags",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "state_read",
    description: "Read OMG state for a mode (e.g. ralph, autopilot, deep-interview)",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string" },
      },
      required: ["mode"],
    },
  },
  {
    name: "state_write",
    description: "Write/merge OMG state for a mode. Pass state object fields to merge.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string" },
        active: { type: "boolean" },
        current_phase: { type: "string" },
        state: { type: "object" },
      },
      required: ["mode"],
    },
  },
  {
    name: "state_clear",
    description: "Deactivate a mode or all modes (active=false)",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", description: "Omit or 'all' to clear all" },
      },
    },
  },
];

function handleTool(name, args = {}) {
  switch (name) {
    case "state_list_active":
      return toolResult({ workspace: wsRoot(), modes: listActive() });
    case "state_read": {
      const data = readMode(args.mode);
      if (!data) return toolResult({ error: "not_found", mode: args.mode });
      return toolResult({ mode: args.mode, data });
    }
    case "state_write": {
      const existing = readMode(args.mode) || {};
      const now = new Date().toISOString();
      const next = {
        ...existing,
        mode: args.mode,
        updated_at: now,
        source: existing.source || "mcp-omg-state",
      };
      if (typeof args.active === "boolean") {
        next.active = args.active;
        next.state = { ...(existing.state || {}), ...(args.state || {}), active: args.active };
      } else if (args.state) {
        next.state = { ...(existing.state || {}), ...args.state };
        if (typeof next.state.active === "boolean") next.active = next.state.active;
      }
      if (args.current_phase != null) {
        next.current_phase = args.current_phase;
        next.state = { ...(next.state || {}), current_phase: args.current_phase };
      }
      if (next.active == null) next.active = true;
      const path = writeMode(args.mode, next);
      return toolResult({ ok: true, path, data: next });
    }
    case "state_clear": {
      const mode = args.mode;
      if (!mode || mode === "all") {
        const modes = listActive();
        const cleared = [];
        for (const m of modes) {
          const data = readMode(m.mode) || {};
          data.active = false;
          if (data.state) data.state.active = false;
          data.current_phase = "cancelled";
          data.updated_at = new Date().toISOString();
          writeMode(m.mode, data);
          cleared.push(m.mode);
        }
        return toolResult({ ok: true, cleared });
      }
      const data = readMode(mode) || { mode };
      data.active = false;
      if (data.state) data.state.active = false;
      data.current_phase = "cancelled";
      data.updated_at = new Date().toISOString();
      const path = writeMode(mode, data);
      return toolResult({ ok: true, path, data });
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function respond(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function respondError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function onMessage(msg) {
  const { id, method, params } = msg;
  try {
    if (method === "initialize") {
      respond(id, {
        protocolVersion: params?.protocolVersion || "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
      return;
    }
    if (method === "notifications/initialized" || method === "initialized") {
      return;
    }
    if (method === "tools/list") {
      respond(id, { tools: TOOLS });
      return;
    }
    if (method === "tools/call") {
      const name = params?.name;
      const args = params?.arguments || {};
      const result = handleTool(name, args);
      respond(id, result);
      return;
    }
    if (method === "ping") {
      respond(id, {});
      return;
    }
    if (id !== undefined) {
      respondError(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    if (id !== undefined) respondError(id, -32000, e.message || String(e));
  }
}

// Export for unit tests
export { handleTool, listActive, TOOLS, wsRoot };

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("omg-state-server.mjs") ||
    process.argv[1].includes("omg-state-server"));

if (isMain) {
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on("line", (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);
      onMessage(msg);
    } catch {
      /* ignore malformed */
    }
  });
}
