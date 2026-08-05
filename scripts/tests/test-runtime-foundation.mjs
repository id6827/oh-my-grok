#!/usr/bin/env node
/**
 * Foundation smoke: built dist exports + state helpers.
 */
import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const distIndex = new URL("../../dist/index.js", import.meta.url);
const mod = await import(distIndex.href);

assert.ok(mod.atomicWriteJson || mod.atomicWriteJsonSync, "atomic write export");
assert.ok(typeof mod.writeMode === "function", "writeMode export");
assert.ok(typeof mod.mapModel === "function", "Grok model adapter");
// Complexity aliases map to Grok Build slug (default grok-4.5; override via OMG_MODEL_*)
assert.equal(mod.mapModel("opus"), "grok-4.5");
assert.equal(mod.mapModel("inherit"), "inherit");
assert.equal(mod.mapToolName("WebSearch"), "web_search");

const ws = join(tmpdir(), `omg-foundation-${Date.now()}`);
mkdirSync(ws, { recursive: true });
try {
  mod.writeMode(ws, "ralph", {
    active: true,
    mode: "ralph",
    updated_at: new Date().toISOString(),
  });
  const m = mod.readMode(ws, "ralph");
  assert.equal(m?.active, true);

  const spec = mod.parseAgentSpec("3:codex");
  assert.equal(spec.count, 3);
  assert.equal(spec.agent, "codex");

  process.env.OMG_TEAM_DRY_RUN = "1";
  const plan = mod.planTeam(
    ws,
    { count: 2, agent: "grok", task: "x" },
    "t-foundation",
    { dryRun: true }
  );
  assert.ok(plan);
  assert.equal(plan.dry_run, true);

  console.log("test-runtime-foundation: ok");
} finally {
  rmSync(ws, { recursive: true, force: true });
}
