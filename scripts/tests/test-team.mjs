#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const node = process.execPath;
let failed = 0;
function assert(c, m) {
  if (!c) {
    console.error("FAIL:", m);
    failed++;
  } else console.log("ok:", m);
}

const ws = join(tmpdir(), `omg-team-${Date.now()}`);
mkdirSync(join(ws, ".omg", "state"), { recursive: true });

const mod = await import(pathToFileURL(join(root, "dist/runtime/team.js")).href);

// parse
{
  const p = mod.parseAgentSpec("2:codex");
  assert(p.count === 2 && p.agent === "codex", "parse 2:codex");
  try {
    mod.parseAgentSpec("nope");
    assert(false, "invalid parse should throw");
  } catch {
    assert(true, "invalid parse throws");
  }
}

// dry-run plan
{
  process.env.OMG_TEAM_DRY_RUN = "1";
  const st = mod.planTeam(
    ws,
    { count: 1, agent: "grok", task: "echo ok" },
    "test-team",
    { dryRun: true }
  );
  assert(st.dry_run === true, "dry_run true");
  assert(st.active === true, "team active");
  assert(existsSync(join(ws, ".omg", "state", "team-state.json")), "team-state.json");
  assert(
    existsSync(join(ws, ".omg", "state", "team-bridge", "test-team", "plan.json")),
    "plan.json"
  );
  const shut = mod.shutdownTeam(ws, "test-team");
  assert(shut && shut.active === false, "shutdown deactivates");
}

// CLI dry-run
{
  const r = spawnSync(
    node,
    [join(root, "bin/omg.js"), "team", "1:grok", "hello", "--dry-run", "--name", "cli-team"],
    { encoding: "utf8", env: { ...process.env, GROK_WORKSPACE_ROOT: ws, OMG_TEAM_DRY_RUN: "1" } }
  );
  assert(r.status === 0, "omg team dry-run exit 0");
  assert(/cli-team|dry_run/i.test(r.stdout), "omg team prints plan");
  const h = spawnSync(node, [join(root, "bin/omg.js"), "team", "--help"], {
    encoding: "utf8",
  });
  assert(h.status === 0 && /tmux/i.test(h.stdout), "omg team --help");
}

try {
  rmSync(ws, { recursive: true, force: true });
} catch {
  /* ignore */
}

if (failed) {
  console.error(failed, "failures");
  process.exit(1);
}
console.log("team tests passed");
