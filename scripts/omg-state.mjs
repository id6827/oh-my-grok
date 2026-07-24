#!/usr/bin/env node
/**
 * File-based OMG state CLI.
 *
 *   node scripts/omg-state.mjs list [--json] [--session <id>]
 *   node scripts/omg-state.mjs get <mode> [--session <id>]
 *   node scripts/omg-state.mjs set <mode> --active true|false [--phase <name>] [--session <id>]
 *   node scripts/omg-state.mjs clear [mode|--all] [--session <id>]
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, basename } from "node:path";

const ws =
  process.env.GROK_WORKSPACE_ROOT || process.env.CLAUDE_PROJECT_DIR || process.cwd();

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--session" && argv[i + 1]) {
      out.session = argv[++i];
    } else if (argv[i] === "--json") {
      out.json = true;
    } else if (argv[i] === "--active" && argv[i + 1]) {
      out.active = argv[++i];
    } else if (argv[i] === "--phase" && argv[i + 1]) {
      out.phase = argv[++i];
    } else if (argv[i] === "--all") {
      out.all = true;
    } else {
      out._.push(argv[i]);
    }
  }
  return out;
}

function stateDir(session) {
  const sid = session || process.env.OMG_SESSION_ID || process.env.GROK_SESSION_ID || "";
  const d = sid
    ? join(ws, ".omg", "state", "sessions", sid)
    : join(ws, ".omg", "state");
  mkdirSync(d, { recursive: true });
  return d;
}

function modePath(mode, session) {
  const safe = String(mode).replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe) throw new Error("invalid mode name");
  const dir = stateDir(session);
  const candidates = [
    join(dir, `${safe}-state.json`),
    join(dir, `${safe}.json`),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function listModes(session) {
  const dir = stateDir(session);
  const out = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    if (name === "prd.json") continue;
    try {
      const data = readJson(join(dir, name));
      out.push({
        file: name,
        mode: data.mode || name.replace(/-state\.json$/, "").replace(/\.json$/, ""),
        active: data.active === true || data.state?.active === true,
        phase: data.current_phase || data.state?.current_phase || null,
        session: session || null,
        updated_at: data.updated_at || null,
      });
    } catch {
      out.push({ file: name, mode: name, active: null, error: "parse_error" });
    }
  }
  return out;
}

function cmdList(opts) {
  const rows = listModes(opts.session);
  if (opts.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  if (!rows.length) {
    console.log("(no state files)");
    return;
  }
  for (const r of rows) {
    const flag = r.active === true ? "ACTIVE" : r.active === false ? "idle  " : "?????";
    console.log(
      `${flag}  ${String(r.mode).padEnd(20)}  phase=${r.phase ?? "-"}  file=${r.file}`
    );
  }
}

function cmdGet(mode, opts) {
  const path = modePath(mode, opts.session);
  if (!existsSync(path)) {
    console.error(`not found: ${path}`);
    process.exit(1);
  }
  console.log(JSON.stringify(readJson(path), null, 2));
}

function cmdSet(mode, opts) {
  const path = modePath(mode, opts.session);
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
  if (opts.active != null) {
    const v = String(opts.active).toLowerCase();
    data.active = v === "true" || v === "1" || v === "yes";
    if (data.state && typeof data.state === "object") data.state.active = data.active;
  }
  if (opts.phase != null) {
    data.current_phase = opts.phase;
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

function cmdClear(target, opts) {
  if (!target || target === "--all" || opts.all) {
    let n = 0;
    for (const r of listModes(opts.session)) {
      const path = join(stateDir(opts.session), r.file);
      try {
        const data = readJson(path);
        data.active = false;
        if (data.state) data.state.active = false;
        data.current_phase = "cancelled";
        data.updated_at = new Date().toISOString();
        writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
        n++;
      } catch {
        /* skip */
      }
    }
    console.log(`deactivated ${n} state file(s)`);
    return;
  }
  const path = modePath(target, opts.session);
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
  console.log(`omg-state — .omg/state[/sessions/<id>/]

Commands:
  list [--json] [--session <id>]
  get <mode> [--session <id>]
  set <mode> --active true|false [--phase <name>] [--session <id>]
  clear [mode|--all] [--session <id>]
`);
}

const opts = parseArgs(process.argv.slice(2));
const [cmd, ...rest] = opts._;
try {
  switch (cmd) {
    case "list":
      cmdList(opts);
      break;
    case "get":
      if (!rest[0]) throw new Error("mode required");
      cmdGet(rest[0], opts);
      break;
    case "set":
      if (!rest[0]) throw new Error("mode required");
      cmdSet(rest[0], opts);
      break;
    case "clear":
      cmdClear(rest[0], opts);
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
