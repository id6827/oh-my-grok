#!/usr/bin/env node
/**
 * File-based OMG state CLI (MCP state_write/state_read substitute for v0.4).
 *
 * Usage:
 *   node scripts/omg-state.mjs list [--json]
 *   node scripts/omg-state.mjs get <mode>
 *   node scripts/omg-state.mjs set <mode> --active true|false [--phase <name>]
 *   node scripts/omg-state.mjs clear [mode|--all]
 *
 * Workspace: GROK_WORKSPACE_ROOT | cwd. Only reads/writes under <ws>/.omg/state/
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import { join, basename } from "node:path";

const ws = process.env.GROK_WORKSPACE_ROOT || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stateDir = join(ws, ".omg", "state");

function ensureDir() {
  mkdirSync(stateDir, { recursive: true });
}

function modePath(mode) {
  const safe = String(mode).replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe) throw new Error("invalid mode name");
  // prefer *-state.json naming
  const candidates = [
    join(stateDir, `${safe}-state.json`),
    join(stateDir, `${safe}.json`),
    join(stateDir, safe),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function listModes() {
  ensureDir();
  const out = [];
  for (const name of readdirSync(stateDir)) {
    if (!name.endsWith(".json")) continue;
    if (name === "prd.json") continue;
    const path = join(stateDir, name);
    try {
      const data = readJson(path);
      out.push({
        file: name,
        mode: data.mode || name.replace(/-state\.json$/, "").replace(/\.json$/, ""),
        active: data.active === true || data.state?.active === true,
        phase: data.current_phase || data.state?.current_phase || null,
        updated_at: data.updated_at || null,
      });
    } catch {
      out.push({ file: name, mode: name, active: null, error: "parse_error" });
    }
  }
  return out;
}

function cmdList(asJson) {
  const rows = listModes();
  if (asJson) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  if (!rows.length) {
    console.log("(no state files under .omg/state/)");
    return;
  }
  for (const r of rows) {
    const flag = r.active === true ? "ACTIVE" : r.active === false ? "idle  " : "?????";
    console.log(`${flag}  ${r.mode.padEnd(20)}  phase=${r.phase ?? "-"}  file=${r.file}`);
  }
}

function cmdGet(mode) {
  const path = modePath(mode);
  if (!existsSync(path)) {
    console.error(`not found: ${path}`);
    process.exit(1);
  }
  console.log(JSON.stringify(readJson(path), null, 2));
}

function cmdSet(mode, args) {
  ensureDir();
  const path = modePath(mode);
  let data = {};
  if (existsSync(path)) {
    try {
      data = readJson(path);
    } catch {
      data = {};
    }
  }
  const now = new Date().toISOString();
  data.mode = data.mode || mode;
  data.updated_at = now;
  data.source = data.source || "omg-state-cli";

  const activeIdx = args.indexOf("--active");
  if (activeIdx !== -1 && args[activeIdx + 1] != null) {
    const v = String(args[activeIdx + 1]).toLowerCase();
    data.active = v === "true" || v === "1" || v === "yes";
    if (data.state && typeof data.state === "object") data.state.active = data.active;
  }
  const phaseIdx = args.indexOf("--phase");
  if (phaseIdx !== -1 && args[phaseIdx + 1] != null) {
    data.current_phase = args[phaseIdx + 1];
    if (data.state && typeof data.state === "object") {
      data.state.current_phase = data.current_phase;
    }
  }
  if (!existsSync(path) && data.active == null) {
    data.active = true;
    data.current_phase = data.current_phase || mode;
    data.state = { active: true, current_phase: data.current_phase };
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote ${path}`);
}

function cmdClear(target) {
  ensureDir();
  if (!target || target === "--all") {
    let n = 0;
    for (const name of readdirSync(stateDir)) {
      if (!name.endsWith(".json") || name === "prd.json") continue;
      const path = join(stateDir, name);
      try {
        const data = readJson(path);
        data.active = false;
        if (data.state) data.state.active = false;
        data.current_phase = "cancelled";
        data.updated_at = new Date().toISOString();
        data.cancel_source = "omg-state-cli";
        writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
        n++;
      } catch {
        /* skip */
      }
    }
    console.log(`deactivated ${n} state file(s)`);
    return;
  }
  const path = modePath(target);
  if (!existsSync(path)) {
    console.error(`not found: ${basename(path)}`);
    process.exit(1);
  }
  const data = readJson(path);
  data.active = false;
  if (data.state) data.state.active = false;
  data.current_phase = "cancelled";
  data.updated_at = new Date().toISOString();
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`deactivated ${path}`);
}

function usage() {
  console.log(`omg-state — file state under ${stateDir}

Commands:
  list [--json]
  get <mode>
  set <mode> --active true|false [--phase <name>]
  clear [mode|--all]
`);
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  switch (cmd) {
    case "list":
      cmdList(rest.includes("--json"));
      break;
    case "get":
      if (!rest[0]) throw new Error("mode required");
      cmdGet(rest[0]);
      break;
    case "set":
      if (!rest[0]) throw new Error("mode required");
      cmdSet(rest[0], rest.slice(1));
      break;
    case "clear":
      cmdClear(rest[0]);
      break;
    case "help":
    case undefined:
      usage();
      break;
    default:
      console.error(`unknown command: ${cmd}`);
      usage();
      process.exit(1);
  }
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
}
