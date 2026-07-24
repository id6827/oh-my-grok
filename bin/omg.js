#!/usr/bin/env node
/**
 * Thin OMG CLI (local).
 *   omg version | status | state ... | doctor | help
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [cmd, ...args] = process.argv.slice(2);

function runNode(script, scriptArgs = []) {
  const r = spawnSync(process.execPath, [join(root, script), ...scriptArgs], {
    stdio: "inherit",
    env: process.env,
  });
  process.exit(r.status ?? 1);
}

function version() {
  const pkg = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
  console.log(`oh-my-grok ${pkg.version}`);
  console.log(`root: ${root}`);
}

async function status() {
  const ws = process.env.GROK_WORKSPACE_ROOT || process.cwd();
  const hudTxt = join(ws, ".omg", "state", "hud-status.txt");
  const hudJson = join(ws, ".omg", "state", "hud-state.json");
  console.log(`workspace: ${ws}`);
  if (existsSync(hudTxt)) {
    console.log("HUD:", readFileSync(hudTxt, "utf8").trim());
  } else {
    console.log(
      "HUD: (no .omg/state/hud-status.txt yet — start a Grok session or trigger a keyword)"
    );
  }
  if (existsSync(hudJson)) {
    try {
      const j = JSON.parse(readFileSync(hudJson, "utf8"));
      if (j.active_modes?.length) {
        console.log(
          "active_modes:",
          j.active_modes.map((m) => m.mode).join(", ")
        );
      }
    } catch {
      /* ignore */
    }
  }
  try {
    const mod = await import(
      pathToFileURL(join(root, "hooks/scripts/lib/config.mjs")).href
    );
    const cfg = mod.loadOmgConfig(ws);
    const th = mod.ambiguityThreshold(ws);
    console.log(
      `config: ${cfg.path || "(defaults)"} | deepInterview.threshold=${th.threshold} (source: ${th.source})`
    );
  } catch (e) {
    console.log("config: (defaults)", e.message || "");
  }
}

function help() {
  console.log(`oh-my-grok CLI (thin)

Commands:
  version              Print plugin version
  status               Show file HUD + config threshold
  state <args...>      scripts/omg-state.mjs (list|get|set|clear)
  doctor               validate-parity + tests + plugin validate
  help                 This message

Examples:
  omg status
  omg state list
  omg doctor
`);
}

async function doctor() {
  console.log("== validate-parity ==");
  let r = spawnSync(process.execPath, [join(root, "scripts/validate-parity.mjs")], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== hook tests ==");
  r = spawnSync(process.execPath, [join(root, "scripts/tests/test-hooks.mjs")], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== grok plugin validate ==");
  r = spawnSync("grok", ["plugin", "validate", root], { stdio: "inherit" });
  if (r.error) {
    console.log("(grok CLI not available — skipped plugin validate)");
  } else if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
  console.log("== status ==");
  await status();
  console.log("== MCP ==");
  console.log(
    "Plugin .mcp.json → omg-state: state_list_active, state_read, state_write, state_clear"
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
      console.error(`unknown command: ${cmd}`);
      help();
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
