#!/usr/bin/env node
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
  } else console.log("ok:", msg);
}

const ws = join(tmpdir(), `omg-test-${Date.now()}`);
mkdirSync(join(ws, ".omg", "state"), { recursive: true });

// keywords
assert(
  run("hooks/scripts/keyword-detector.mjs", {
    prompt: "security review auth",
    cwd: ws,
    workspaceRoot: ws,
  }).stdout.includes("security-review"),
  "keyword security-review"
);
assert(
  run("hooks/scripts/keyword-detector.mjs", {
    prompt: "please skillify this session",
    cwd: ws,
    workspaceRoot: ws,
  }).stdout.includes("skillify"),
  "keyword skillify"
);

// pre-tool
assert(
  JSON.parse(
    run("hooks/scripts/pre-tool-enforcer.mjs", {
      toolName: "run_terminal_command",
      toolInput: { command: "rm -rf /" },
    }).stdout || "{}"
  ).decision === "deny",
  "deny rm -rf /"
);

// state + session
{
  const set = spawnSync(
    node,
    [
      join(root, "scripts/omg-state.mjs"),
      "set",
      "ralph",
      "--active",
      "true",
      "--session",
      "sess1",
    ],
    { encoding: "utf8", env: { ...process.env, GROK_WORKSPACE_ROOT: ws } }
  );
  assert(set.status === 0, "session state set");
  assert(
    existsSync(join(ws, ".omg", "state", "sessions", "sess1", "ralph-state.json")),
    "session path exists"
  );
}

// injector / stop / hud
writeFileSync(
  join(ws, ".omg", "state", "autopilot-state.json"),
  JSON.stringify({ active: true, mode: "autopilot", current_phase: "execution" })
);
assert(
  run("hooks/scripts/skill-injector.mjs", {
    prompt: "go",
    cwd: ws,
    workspaceRoot: ws,
  }).stdout.includes("skill-injector"),
  "injector"
);

writeFileSync(
  join(ws, ".omg", "state", "deep-interview-state.json"),
  JSON.stringify({ active: true, current_phase: "deep-interview" })
);
assert(
  run("hooks/scripts/stop-continuation.mjs", {
    reason: "end_turn",
    cwd: ws,
    workspaceRoot: ws,
    lastAssistantMessage: "working",
  }).stdout.includes("block"),
  "stop block"
);

// session end
run("hooks/scripts/session-end.mjs", {
  reason: "shutdown",
  cwd: ws,
  workspaceRoot: ws,
});
assert(existsSync(join(ws, ".omg", "state", "session-end.json")), "session-end.json");

// MCP
{
  process.env.OMG_STATE_CWD = ws;
  const mod = await import(pathToFileURL(join(root, "mcp/omg-state-server.mjs")).href);
  assert(mod.TOOLS.length >= 6, "MCP ≥6 tools");
  const info = mod.handleTool("omg_info", {});
  assert(info.content[0].text.includes("oh-my-grok"), "omg_info");
  const st = mod.handleTool("state_get_status", {});
  assert(st.content[0].text.includes("workspace"), "state_get_status");
}

// HUD renderer
{
  writeFileSync(
    join(ws, ".omg", "prd.json"),
    JSON.stringify({
      userStories: [
        { id: "US-1", passes: true },
        { id: "US-2", passes: false, title: "x" },
      ],
    })
  );
  const hud = spawnSync(node, [join(root, "scripts/hud/omg-hud.mjs")], {
    encoding: "utf8",
    env: { ...process.env, GROK_WORKSPACE_ROOT: ws },
  });
  assert(hud.status === 0 && /\[OMG\]/.test(hud.stdout), "omg-hud renders");
  assert(/prd:/.test(hud.stdout), "omg-hud prd line");
}

// keyword rule count ≥18
{
  const t = readFileSync(join(root, "hooks/scripts/keyword-detector.mjs"), "utf8");
  const names = [...t.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert(names.length >= 18, `keyword rules ≥18 (got ${names.length})`);
}

// hooks.json events
{
  const h = JSON.parse(readFileSync(join(root, "hooks/hooks.json"), "utf8"));
  for (const ev of [
    "SessionStart",
    "SessionEnd",
    "UserPromptSubmit",
    "PreToolUse",
    "PostToolUse",
    "PostToolUseFailure",
    "SubagentStart",
    "SubagentStop",
    "PreCompact",
    "Stop",
  ]) {
    assert(!!h.hooks[ev], `hook event ${ev}`);
  }
}

// CLI bits
assert(
  spawnSync(node, [join(root, "bin/omg.js"), "version"], { encoding: "utf8" })
    .stdout.includes("0.6"),
  "version 0.6"
);
assert(existsSync(join(root, "docs/SIMILARITY.md")), "SIMILARITY.md");
assert(
  readFileSync(join(root, "docs/SIMILARITY.md"), "utf8").includes("Strict"),
  "strict policy doc"
);

try {
  rmSync(ws, { recursive: true, force: true });
} catch {
  /* ignore */
}

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nAll tests passed (strict-80 suite)");
