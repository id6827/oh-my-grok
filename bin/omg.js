#!/usr/bin/env node
/**
 * OMG CLI
 *   omg version | status | hud | setup | setup-hud | team-help | state ... | doctor | help
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, existsSync, mkdirSync, copyFileSync, chmodSync } from "node:fs";
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
  console.log(`similarity: strict per-layer ≥80 (docs/SIMILARITY.md)`);
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
  console.log("next: omg setup-hud   # optional statusline install");
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
  console.log(`
Run periodically or wire to your terminal statusline:
  node ${dest}

Or from a project:
  node ${join(root, "scripts/hud/omg-hud.mjs")}
`);
}

function teamHelp() {
  console.log(`OMG team guidance (Grok-native)

In-session:
  /team 3:executor "fix TypeScript errors"
  Prefer spawn_subagent with isolation: "worktree" for parallel mutators.

CLI helpers:
  node scripts/worktree-helper.mjs plan worker-1
  node scripts/worktree-helper.mjs list

tmux multi-provider (codex/gemini panes) is NOT ported from omc team.
Use Grok subagents or external CLIs manually until that layer lands.
`);
  runNode("scripts/worktree-helper.mjs", ["plan", args[0] || "worker"], true);
}

function help() {
  console.log(`oh-my-grok CLI

  version       Plugin version
  status        HUD + config threshold
  hud           Render multi-line HUD
  setup         Copy templates/omg.jsonc → .grok/omg.jsonc
  setup-hud     Install ~/.grok/hud/omg-hud.mjs
  team-help     Team/worktree guidance
  state ...     State CLI (list|get|set|clear) [--session id]
  doctor        validate-parity + tests + plugin validate
  help
`);
}

async function doctor() {
  console.log("== validate-parity ==");
  let r = spawnSync(process.execPath, [join(root, "scripts/validate-parity.mjs")], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== tests ==");
  r = spawnSync(process.execPath, [join(root, "scripts/tests/test-hooks.mjs")], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== plugin validate ==");
  r = spawnSync("grok", ["plugin", "validate", root], { stdio: "inherit" });
  if (r.error) console.log("(grok CLI missing — skipped)");
  else if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== status ==");
  await status();
  console.log("== MCP tools ==");
  console.log(
    "state_list_active, state_read, state_write, state_clear, state_get_status, omg_info"
  );
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
    case "team-help":
      teamHelp();
      break;
    case "state":
      runNode("scripts/omg-state.mjs", args);
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
