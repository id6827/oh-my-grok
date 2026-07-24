#!/usr/bin/env node
/**
 * MCP stdio server for OMG state tools (no external SDK).
 * Tools: state_list_active, state_read, state_write, state_clear,
 *        state_get_status, omg_info
 */
import { createInterface } from "node:readline";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_INFO = { name: "omg-state", version: "0.6.0" };
const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function wsRoot() {
  return (
    process.env.OMG_STATE_CWD ||
    process.env.GROK_WORKSPACE_ROOT ||
    process.env.CLAUDE_PROJECT_DIR ||
    process.cwd()
  );
}

function sessionId() {
  return (
    process.env.OMG_SESSION_ID ||
    process.env.GROK_SESSION_ID ||
    process.env.CLAUDE_SESSION_ID ||
    ""
  );
}

function stateDir(session) {
  const sid = session || sessionId();
  const base = join(wsRoot(), ".omg", "state");
  const d = sid ? join(base, "sessions", sid) : base;
  mkdirSync(d, { recursive: true });
  return d;
}

function modeFile(mode, session) {
  const safe = String(mode || "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe) throw new Error("mode required");
  const dir = stateDir(session);
  const preferred = join(dir, `${safe}-state.json`);
  if (existsSync(preferred)) return preferred;
  const alt = join(dir, `${safe}.json`);
  if (existsSync(alt)) return alt;
  // fallback: project-level state if session-scoped miss
  if (session || sessionId()) {
    const legacy = join(wsRoot(), ".omg", "state", `${safe}-state.json`);
    if (existsSync(legacy)) return legacy;
  }
  return preferred;
}

function readMode(mode, session) {
  const path = modeFile(mode, session);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeMode(mode, data, session) {
  const path = modeFile(mode, session);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  return path;
}

const SKIP_FILES = new Set([
  "prd.json",
  "hud-state.json",
  "hud-status.txt",
  "precompact-snapshot.json",
  "subagent-tracking.json",
  "session-end.json",
  "last-tool-failure.json",
]);

function listInDir(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    if (SKIP_FILES.has(name)) continue;
    if (name === "sessions") continue;
    try {
      const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
      out.push({
        file: name,
        mode: data.mode || name.replace(/-state\.json$/, ""),
        active: data.active === true || data.state?.active === true,
        phase: data.current_phase || data.state?.current_phase || null,
        dir,
      });
    } catch {
      /* skip */
    }
  }
  return out;
}

function listActive(session) {
  const primary = listInDir(stateDir(session));
  if (session || sessionId()) {
    // also include project-level actives
    const legacy = listInDir(join(wsRoot(), ".omg", "state"));
    const seen = new Set(primary.map((m) => m.mode));
    for (const m of legacy) {
      if (!seen.has(m.mode)) primary.push(m);
    }
  }
  return primary;
}

function toolResult(obj) {
  return { content: [{ type: "text", text: JSON.stringify(obj, null, 2) }] };
}

const TOOLS = [
  {
    name: "state_list_active",
    description: "List OMG mode state files with active flags",
    inputSchema: {
      type: "object",
      properties: { session_id: { type: "string" } },
    },
  },
  {
    name: "state_read",
    description: "Read OMG state for a mode",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string" },
        session_id: { type: "string" },
      },
      required: ["mode"],
    },
  },
  {
    name: "state_write",
    description: "Write/merge OMG state for a mode",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string" },
        active: { type: "boolean" },
        current_phase: { type: "string" },
        state: { type: "object" },
        session_id: { type: "string" },
      },
      required: ["mode"],
    },
  },
  {
    name: "state_clear",
    description: "Deactivate a mode or all modes",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string" },
        session_id: { type: "string" },
      },
    },
  },
  {
    name: "state_get_status",
    description: "Summary: active modes, PRD progress, HUD line, subagent count",
    inputSchema: {
      type: "object",
      properties: { session_id: { type: "string" } },
    },
  },
  {
    name: "omg_info",
    description: "Plugin version, workspace, MCP tool names, similarity policy pointer",
    inputSchema: { type: "object", properties: {} },
  },
];

function prdSummary() {
  const p = join(wsRoot(), ".omg", "prd.json");
  if (!existsSync(p)) return null;
  try {
    const prd = JSON.parse(readFileSync(p, "utf8"));
    const stories = prd.userStories || [];
    return {
      name: prd.name,
      done: stories.filter((s) => s.passes).length,
      total: stories.length,
      next: stories.find((s) => !s.passes)?.id || null,
    };
  } catch {
    return null;
  }
}

function handleTool(name, args = {}) {
  const session = args.session_id || undefined;
  switch (name) {
    case "state_list_active":
      return toolResult({
        workspace: wsRoot(),
        session: session || sessionId() || null,
        modes: listActive(session),
      });
    case "state_read": {
      const data = readMode(args.mode, session);
      if (!data) return toolResult({ error: "not_found", mode: args.mode });
      return toolResult({ mode: args.mode, data });
    }
    case "state_write": {
      const existing = readMode(args.mode, session) || {};
      const now = new Date().toISOString();
      const next = {
        ...existing,
        mode: args.mode,
        updated_at: now,
        source: existing.source || "mcp-omg-state",
      };
      if (typeof args.active === "boolean") {
        next.active = args.active;
        next.state = {
          ...(existing.state || {}),
          ...(args.state || {}),
          active: args.active,
        };
      } else if (args.state) {
        next.state = { ...(existing.state || {}), ...args.state };
        if (typeof next.state.active === "boolean") next.active = next.state.active;
      }
      if (args.current_phase != null) {
        next.current_phase = args.current_phase;
        next.state = { ...(next.state || {}), current_phase: args.current_phase };
      }
      if (next.active == null) next.active = true;
      const path = writeMode(args.mode, next, session);
      return toolResult({ ok: true, path, data: next });
    }
    case "state_clear": {
      const mode = args.mode;
      if (!mode || mode === "all") {
        const modes = listActive(session);
        const cleared = [];
        for (const m of modes) {
          const data = readMode(m.mode, session) || { mode: m.mode };
          data.active = false;
          if (data.state) data.state.active = false;
          data.current_phase = "cancelled";
          data.updated_at = new Date().toISOString();
          writeMode(m.mode, data, session);
          cleared.push(m.mode);
        }
        return toolResult({ ok: true, cleared });
      }
      const data = readMode(mode, session) || { mode };
      data.active = false;
      if (data.state) data.state.active = false;
      data.current_phase = "cancelled";
      data.updated_at = new Date().toISOString();
      const path = writeMode(mode, data, session);
      return toolResult({ ok: true, path, data });
    }
    case "state_get_status": {
      const modes = listActive(session);
      const hudPath = join(wsRoot(), ".omg", "state", "hud-status.txt");
      const trackPath = join(wsRoot(), ".omg", "state", "subagent-tracking.json");
      let agentsRunning = 0;
      if (existsSync(trackPath)) {
        try {
          const t = JSON.parse(readFileSync(trackPath, "utf8"));
          agentsRunning = (t.agents || []).filter((a) => a.status === "running")
            .length;
        } catch {
          /* ignore */
        }
      }
      return toolResult({
        workspace: wsRoot(),
        session: session || sessionId() || null,
        active_modes: modes.filter((m) => m.active),
        all_modes: modes,
        prd: prdSummary(),
        hud_line: existsSync(hudPath)
          ? readFileSync(hudPath, "utf8").trim()
          : null,
        subagents_running: agentsRunning,
      });
    }
    case "omg_info": {
      let version = "unknown";
      try {
        version = JSON.parse(
          readFileSync(join(PLUGIN_ROOT, "plugin.json"), "utf8")
        ).version;
      } catch {
        /* ignore */
      }
      return toolResult({
        name: "oh-my-grok",
        version,
        plugin_root: PLUGIN_ROOT,
        workspace: wsRoot(),
        tools: TOOLS.map((t) => t.name),
        similarity_docs: "docs/SIMILARITY.md",
        policy: "strict_per_layer_80",
      });
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
    if (method === "notifications/initialized" || method === "initialized")
      return;
    if (method === "tools/list") {
      respond(id, { tools: TOOLS });
      return;
    }
    if (method === "tools/call") {
      respond(id, handleTool(params?.name, params?.arguments || {}));
      return;
    }
    if (method === "ping") {
      respond(id, {});
      return;
    }
    if (id !== undefined) respondError(id, -32601, `Method not found: ${method}`);
  } catch (e) {
    if (id !== undefined) respondError(id, -32000, e.message || String(e));
  }
}

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
      onMessage(JSON.parse(line));
    } catch {
      /* ignore */
    }
  });
}
