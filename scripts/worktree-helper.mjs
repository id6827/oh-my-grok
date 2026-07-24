#!/usr/bin/env node
/**
 * Worktree helper for OMG parallel isolation (team/ultrawork guidance).
 *
 *   node scripts/worktree-helper.mjs list
 *   node scripts/worktree-helper.mjs plan <name>   # print suggested git worktree add command
 *   node scripts/worktree-helper.mjs json
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const ws = process.env.GROK_WORKSPACE_ROOT || process.cwd();
const [cmd, name] = process.argv.slice(2);

function git(args) {
  return spawnSync("git", args, { cwd: ws, encoding: "utf8" });
}

function list() {
  const r = git(["worktree", "list", "--porcelain"]);
  if (r.status !== 0) {
    console.error(r.stderr || "git worktree list failed");
    process.exit(1);
  }
  console.log(r.stdout || "(none)");
}

function plan(slug) {
  const safe = String(slug || "omg-worker")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 40);
  const path = join(ws, "..", `omg-wt-${safe}`);
  const branch = `omg/${safe}`;
  const guide = {
    purpose: "Isolated workspace for parallel OMG executor work",
    create: `git -C "${ws}" worktree add -b ${branch} "${path}" HEAD`,
    remove: `git -C "${ws}" worktree remove "${path}" --force`,
    spawn_hint:
      'Use spawn_subagent with isolation: "worktree" when the harness supports it; otherwise run agents with cwd set to the worktree path.',
    path,
    branch,
  };
  console.log(JSON.stringify(guide, null, 2));
}

function asJson() {
  const r = git(["worktree", "list", "--porcelain"]);
  const blocks = (r.stdout || "").split("\n\n").filter(Boolean);
  const trees = blocks.map((b) => {
    const o = {};
    for (const line of b.split("\n")) {
      const [k, ...rest] = line.split(" ");
      o[k] = rest.join(" ") || true;
    }
    return o;
  });
  console.log(JSON.stringify({ workspace: ws, worktrees: trees }, null, 2));
}

switch (cmd) {
  case "list":
    list();
    break;
  case "plan":
    plan(name || "worker");
    break;
  case "json":
    asJson();
    break;
  default:
    console.log(`worktree-helper
  list
  plan <name>
  json`);
}
