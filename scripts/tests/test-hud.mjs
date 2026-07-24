#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir, homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const node = process.execPath;
let failed = 0;
function assert(c, m) {
  if (!c) {
    console.error("FAIL:", m);
    failed++;
  } else console.log("ok:", m);
}

const ws = join(tmpdir(), `omg-hud-${Date.now()}`);
mkdirSync(join(ws, ".omg", "state"), { recursive: true });
writeFileSync(
  join(ws, ".omg", "state", "ralph-state.json"),
  JSON.stringify({ active: true, mode: "ralph", current_phase: "work" })
);
writeFileSync(
  join(ws, ".omg", "prd.json"),
  JSON.stringify({
    userStories: [
      { id: "US-1", passes: true },
      { id: "US-2", passes: false, title: "x" },
    ],
  })
);

const once = spawnSync(node, [join(root, "scripts/hud/omg-hud.mjs")], {
  encoding: "utf8",
  env: { ...process.env, GROK_WORKSPACE_ROOT: ws },
});
assert(once.status === 0 && /\[OMG\]/.test(once.stdout), "hud once");
assert(/ralph/.test(once.stdout), "hud shows ralph");
assert(/prd:/.test(once.stdout), "hud shows prd");

const watch = spawnSync(
  node,
  [join(root, "scripts/hud/omg-hud.mjs"), "--watch", "--interval", "200", "--ticks", "2"],
  { encoding: "utf8", env: { ...process.env, GROK_WORKSPACE_ROOT: ws }, timeout: 5000 }
);
assert(watch.status === 0 && (watch.stdout.match(/\[OMG\]/g) || []).length >= 2, "hud watch 2 ticks");

// setup-hud installs
const setup = spawnSync(node, [join(root, "bin/omg.js"), "setup-hud"], {
  encoding: "utf8",
});
assert(setup.status === 0, "setup-hud");
assert(existsSync(join(homedir(), ".grok", "hud", "omg-hud.mjs")), "installed ~/.grok/hud");

try {
  rmSync(ws, { recursive: true, force: true });
} catch {
  /* ignore */
}

if (failed) process.exit(1);
console.log("hud tests passed");
