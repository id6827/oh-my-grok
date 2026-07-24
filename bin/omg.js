#!/usr/bin/env node
/**
 * OMG CLI — version | status | hud | setup | setup-hud | team | state | doctor | help
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import {
  readFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  chmodSync,
} from "node:fs";
import { homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [cmd, ...args] = process.argv.slice(2);

function runNode(script, scriptArgs = [], inherit = true) {
  const r = spawnSync(process.execPath, [join(root, script), ...scriptArgs], {
    stdio: inherit ? "inherit" : "pipe",
    encoding: "utf8",
    env: process.env,
  });
  if (inherit) process.exit(r.status ?? 1);
  return r;
}

function version() {
  const pkg = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
  console.log(`oh-my-grok ${pkg.version}`);
  console.log(`root: ${root}`);
  console.log(`similarity: strict per-layer ≥90 (docs/SIMILARITY.md)`);
}

async function status() {
  const ws = process.env.GROK_WORKSPACE_ROOT || process.cwd();
  console.log(`workspace: ${ws}`);
  const hud = runNode("scripts/hud/omg-hud.mjs", [], false);
  if (hud.stdout) console.log(hud.stdout.trimEnd());
  try {
    const mod = await import(
      pathToFileURL(join(root, "hooks/scripts/lib/config.mjs")).href
    );
    const cfg = mod.loadOmgConfig(ws);
    const th = mod.ambiguityThreshold(ws);
    console.log(
      `config: ${cfg.path || "(defaults)"} | threshold=${th.threshold} (${th.source})`
    );
  } catch {
    console.log("config: (defaults)");
  }
}

function hud() {
  runNode("scripts/hud/omg-hud.mjs", args);
}

function setup() {
  const ws = process.env.GROK_WORKSPACE_ROOT || process.cwd();
  const destDir = join(ws, ".grok");
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, "omg.jsonc");
  const src = join(root, "templates/omg.jsonc");
  if (!existsSync(dest)) {
    copyFileSync(src, dest);
    console.log(`wrote ${dest}`);
  } else {
    console.log(`exists ${dest} (left unchanged)`);
  }
  mkdirSync(join(ws, ".omg", "state"), { recursive: true });
  console.log("ensured .omg/state");
}

function setupHud() {
  const hudDir = join(homedir(), ".grok", "hud");
  mkdirSync(hudDir, { recursive: true });
  const dest = join(hudDir, "omg-hud.mjs");
  copyFileSync(join(root, "scripts/hud/omg-hud.mjs"), dest);
  try {
    chmodSync(dest, 0o755);
  } catch {
    /* win */
  }
  console.log(`installed ${dest}`);
  console.log(`Watch: node ${dest} --watch`);
  console.log(`Or:    ${join(root, "scripts/hud/watch-hud.sh")}`);
}

async function teamCmd(teamArgs) {
  const ws = process.env.GROK_WORKSPACE_ROOT || process.cwd();
  // Ensure runtime built
  const distTeam = join(root, "dist/runtime/team.js");
  if (!existsSync(distTeam)) {
    const b = spawnSync("npm", ["run", "build"], {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
    });
    if (b.status !== 0) {
      console.error("Build failed. Run: npm run build");
      console.error(b.stderr || b.stdout);
      process.exit(1);
    }
  }
  const mod = await import(pathToFileURL(distTeam).href);

  if (!teamArgs.length || teamArgs[0] === "--help" || teamArgs[0] === "help") {
    console.log(`omg team — tmux multi-CLI workers

Usage:
  omg team <N>:<agent> "<task>" [--dry-run] [--name <id>]
  omg team status
  omg team shutdown [name]
  omg team --help

Agents: codex, gemini, claude, cursor, grok, executor, antigravity
If tmux is missing, --dry-run is forced and plan JSON is written under
  .omg/state/team-bridge/<name>/plan.json

See docs/team-state-schema.md
`);
    process.exit(0);
  }

  if (teamArgs[0] === "status") {
    const st = mod.readTeamState(ws);
    if (!st) {
      console.log("No team-state.json (no active/last team)");
      process.exit(0);
    }
    console.log(JSON.stringify(st, null, 2));
    process.exit(0);
  }

  if (teamArgs[0] === "shutdown") {
    try {
      const st = mod.shutdownTeam(ws, teamArgs[1]);
      if (!st) {
        console.error("No team to shutdown");
        process.exit(1);
      }
      console.log(JSON.stringify({ shutdown: true, name: st.name, active: st.active }, null, 2));
      process.exit(0);
    } catch (e) {
      console.error(e.message || e);
      process.exit(1);
    }
  }

  // parse: omg team 2:codex "task" [--dry-run] [--name x]
  let dryRun = teamArgs.includes("--dry-run") || process.env.OMG_TEAM_DRY_RUN === "1";
  let name;
  const ni = teamArgs.indexOf("--name");
  if (ni >= 0) name = teamArgs[ni + 1];
  const positional = teamArgs.filter(
    (a, i) =>
      !a.startsWith("--") &&
      teamArgs[i - 1] !== "--name" &&
      a !== "--dry-run"
  );
  const specStr = positional[0];
  const task = positional.slice(1).join(" ") || "";
  if (!specStr) {
    console.error("Missing N:agent spec");
    process.exit(1);
  }
  try {
    const { count, agent } = mod.parseAgentSpec(specStr);
    if (!mod.hasTmux()) {
      dryRun = true;
      console.error("tmux not found — forcing dry-run (plan only). Install tmux for live panes.");
    }
    const state = mod.planTeam(
      ws,
      { count, agent, task: task || "(no task)" },
      name,
      { dryRun }
    );
    console.log(JSON.stringify(state, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

async function askCmd(askArgs) {
  try {
    const mod = await import(
      pathToFileURL(join(root, "dist/cli/ask.js")).href
    );
    await mod.askCommand(askArgs);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

function help() {
  console.log(`oh-my-grok CLI v0.9+

  version | status | hud [--watch] | setup | setup-hud
  team <N>:<agent> "task" | team status | team shutdown
  ask <provider> <prompt> | ask <provider> -p "..."
  state list|get|set|clear
  doctor | help

  providers: claude | codex | gemini | antigravity | grok | cursor
`);
}

async function doctor() {
  console.log("== build ==");
  let r = spawnSync("npm", ["run", "build"], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== validate-parity ==");
  r = spawnSync(process.execPath, [join(root, "scripts/validate-parity.mjs")], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== plugin-shipping verify ==");
  r = spawnSync(
    process.execPath,
    [join(root, "scripts/plugin-shipping-surface.mjs"), "verify"],
    { cwd: root, stdio: "inherit" }
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== tests (smoke) ==");
  r = spawnSync("npm", ["run", "test:smoke"], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== plugin validate ==");
  r = spawnSync("grok", ["plugin", "validate", root], { stdio: "inherit" });
  if (r.error) console.log("(grok CLI missing — skipped)");
  else if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== tmux ==");
  const t = spawnSync("tmux", ["-V"], { encoding: "utf8" });
  if (t.status === 0) console.log(`ok: ${String(t.stdout || t.stderr).trim()}`);
  else console.log("tmux not found — omg team will force dry-run");
  console.log("== status ==");
  await status();
}

async function main() {
  switch (cmd) {
    case "version":
    case "-v":
    case "--version":
      version();
      break;
    case "status":
      await status();
      break;
    case "hud":
      hud();
      break;
    case "setup":
      setup();
      break;
    case "setup-hud":
      setupHud();
      break;
    case "team":
      await teamCmd(args);
      break;
    case "team-help":
      await teamCmd(["--help"]);
      break;
    case "state":
      runNode("scripts/omg-state.mjs", args);
      break;
    case "ask":
      await askCmd(args);
      break;
    case "doctor":
      await doctor();
      break;
    case "help":
    case undefined:
      help();
      break;
    default:
      console.error(`unknown: ${cmd}`);
      help();
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
