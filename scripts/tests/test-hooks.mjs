#!/usr/bin/env node
/**
 * Lightweight unit tests for OMG hooks + state CLI + MCP handlers.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

// keyword analyze
{
  const { stdout } = run("hooks/scripts/keyword-detector.mjs", {
    prompt: "analyze the root cause of this bug",
    cwd: ws,
    workspaceRoot: ws,
  });
  assert(stdout.includes("Analyze") || stdout.includes("trace"), "keyword analyze");
}

// pre-tool deny / allow
{
  const deny = run("hooks/scripts/pre-tool-enforcer.mjs", {
    toolName: "run_terminal_command",
    toolInput: { command: "rm -rf /" },
  });
  assert(JSON.parse(deny.stdout || "{}").decision === "deny", "pre-tool denies rm -rf /");
  const allow = run("hooks/scripts/pre-tool-enforcer.mjs", {
    toolName: "run_terminal_command",
    toolInput: { command: "npm test" },
  });
  assert(JSON.parse(allow.stdout || "{}").decision === "allow", "pre-tool allows npm test");
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
  assert(
    rows.some((r) => r.mode === "ralph" && r.active),
    "omg-state list active ralph"
  );
}

// skill injector
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

// stop blocks
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
  assert(
    stdout.includes('"decision":"block"') || stdout.includes('"decision": "block"'),
    "stop blocks active DI"
  );
}

// HUD file after keyword
{
  assert(existsSync(join(ws, ".omg", "state", "hud-status.txt")), "hud-status.txt written");
}

// MCP handleTool
{
  process.env.OMG_STATE_CWD = ws;
  const mod = await import(pathToFileURL(join(root, "mcp/omg-state-server.mjs")).href);
  const w = mod.handleTool("state_write", {
    mode: "ralph",
    active: true,
    current_phase: "mcp-test",
  });
  assert(w.content?.[0]?.text?.includes("mcp-test"), "MCP state_write");
  const list = mod.handleTool("state_list_active", {});
  assert(list.content?.[0]?.text?.includes("ralph"), "MCP state_list_active");
  const cleared = mod.handleTool("state_clear", { mode: "ralph" });
  assert(cleared.content?.[0]?.text?.includes("ok"), "MCP state_clear");
}

// subagent tracker
{
  run(
    "hooks/scripts/subagent-tracker.mjs",
    {
      hookEventName: "SubagentStart",
      agentType: "executor",
      agentId: "t1",
      cwd: ws,
      workspaceRoot: ws,
    },
    { GROK_HOOK_EVENT: "subagent_start" }
  );
  const track = join(ws, ".omg", "state", "subagent-tracking.json");
  assert(existsSync(track), "subagent-tracking.json created");
}

// bin/omg version + status
{
  const r = spawnSync(node, [join(root, "bin/omg.js"), "version"], { encoding: "utf8" });
  assert(r.status === 0 && /oh-my-grok/.test(r.stdout), "omg version");
  const s = spawnSync(node, [join(root, "bin/omg.js"), "status"], {
    encoding: "utf8",
    env: { ...process.env, GROK_WORKSPACE_ROOT: ws },
  });
  assert(s.status === 0 && /workspace:/.test(s.stdout), "omg status");
}

// commands exist
{
  assert(existsSync(join(root, "commands/deep-interview.md")), "commands/deep-interview.md");
  assert(existsSync(join(root, ".mcp.json")), ".mcp.json present");
  assert(existsSync(join(root, "docs/SIMILARITY.md")), "docs/SIMILARITY.md");
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
