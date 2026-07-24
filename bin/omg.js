#!/usr/bin/env node
/**
 * Thin OMG CLI (local). Not a full omc port — state + doctor helpers.
 *
 *   omg version
 *   omg state list|get|set|clear ...
 *   omg doctor
 *   omg help
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

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

function help() {
  console.log(`oh-my-grok CLI (thin)

Commands:
  version              Print plugin version
  state <args...>      Delegate to scripts/omg-state.mjs
  doctor               Run validate-parity + plugin validate if available
  help                 This message

Examples:
  omg state list
  omg state set ralph --active false
  omg doctor
`);
}

function doctor() {
  console.log("== validate-parity ==");
  let r = spawnSync(process.execPath, [join(root, "scripts/validate-parity.mjs")], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("== grok plugin validate ==");
  r = spawnSync("grok", ["plugin", "validate", root], { stdio: "inherit" });
  if (r.error) {
    console.log("(grok CLI not available — skipped plugin validate)");
    process.exit(0);
  }
  process.exit(r.status ?? 0);
}

switch (cmd) {
  case "version":
  case "-v":
  case "--version":
    version();
    break;
  case "state":
    runNode("scripts/omg-state.mjs", args);
    break;
  case "doctor":
    doctor();
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
