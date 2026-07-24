#!/usr/bin/env node
/**
 * Lightweight unit tests for OMG hooks + state CLI (no external harness).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const node = process.execPath;
let failed = 0;

function run(script, inputObj, env = {}) {
  const r = spawnSync(node, [join(root, script)], {
    input: JSON.stringify(inputObj),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("ok:", msg);
  }
}

const ws = join(tmpdir(), `omg-test-${Date.now()}`);
mkdirSync(join(ws, ".omg", "state"), { recursive: true });

// keyword security-review
{
  const { stdout } = run("hooks/scripts/keyword-detector.mjs", {
    prompt: "security review auth",
    cwd: ws,
    workspaceRoot: ws,
  });
  assert(stdout.includes("security-review"), "keyword security-review");
}

// keyword tdd
{
  const { stdout } = run("hooks/scripts/keyword-detector.mjs", {
    prompt: "please do tdd for this feature",
    cwd: ws,
    workspaceRoot: ws,
  });
  assert(stdout.includes("ultraqa") || stdout.includes("TDD"), "keyword tdd");
}

// pre-tool deny
{
  const { stdout } = run("hooks/scripts/pre-tool-enforcer.mjs", {
    toolName: "run_terminal_command",
    toolInput: { command: "rm -rf /" },
  });
  const j = JSON.parse(stdout || "{}");
  assert(j.decision === "deny", "pre-tool denies rm -rf /");
}

// pre-tool allow
{
  const { stdout } = run("hooks/scripts/pre-tool-enforcer.mjs", {
    toolName: "run_terminal_command",
    toolInput: { command: "npm test" },
  });
  const j = JSON.parse(stdout || "{}");
  assert(j.decision === "allow", "pre-tool allows npm test");
}

// state cli
{
  const set = spawnSync(
    node,
    [join(root, "scripts/omg-state.mjs"), "set", "ralph", "--active", "true", "--phase", "work"],
    { encoding: "utf8", env: { ...process.env, GROK_WORKSPACE_ROOT: ws } }
  );
  assert(set.status === 0, "omg-state set");
  const list = spawnSync(node, [join(root, "scripts/omg-state.mjs"), "list", "--json"], {
    encoding: "utf8",
    env: { ...process.env, GROK_WORKSPACE_ROOT: ws },
  });
  const rows = JSON.parse(list.stdout || "[]");
  assert(rows.some((r) => r.mode === "ralph" && r.active), "omg-state list active ralph");
}

// skill injector with active mode
{
  writeFileSync(
    join(ws, ".omg", "state", "autopilot-state.json"),
    JSON.stringify({ active: true, mode: "autopilot", current_phase: "execution" })
  );
  const { stdout } = run("hooks/scripts/skill-injector.mjs", {
    prompt: "continue",
    cwd: ws,
    workspaceRoot: ws,
  });
  assert(stdout.includes("skill-injector"), "skill-injector on active mode");
}

// stop blocks when active
{
  writeFileSync(
    join(ws, ".omg", "state", "deep-interview-state.json"),
    JSON.stringify({ active: true, current_phase: "deep-interview" })
  );
  const { stdout } = run("hooks/scripts/stop-continuation.mjs", {
    reason: "end_turn",
    cwd: ws,
    workspaceRoot: ws,
    lastAssistantMessage: "working...",
  });
  assert(stdout.includes('"decision":"block"') || stdout.includes('"decision": "block"'), "stop blocks active DI");
}

// bin/omg version
{
  const r = spawnSync(node, [join(root, "bin/omg.js"), "version"], { encoding: "utf8" });
  assert(r.status === 0 && /oh-my-grok/.test(r.stdout), "omg version");
}

try {
  rmSync(ws, { recursive: true, force: true });
} catch {
  /* ignore */
}

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nAll hook tests passed");
