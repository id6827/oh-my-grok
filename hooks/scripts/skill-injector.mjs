#!/usr/bin/env node
/**
 * OMG Skill Injector (Layer B, simplified)
 * UserPromptSubmit: if orchestration modes are active under .omg/state/,
 * re-inject protocol reminders so the agent does not drop the mode mid-session.
 *
 * Runs after keyword-detector. Fail-open always.
 */
import {
  readStdinJson,
  workspaceRoot,
  listActiveModes,
  emitAdditionalContext,
} from "./lib/hook-io.mjs";
import { refreshHud } from "./lib/hud.mjs";

const MODE_HINTS = {
  "deep-interview": [
    "Active mode: deep-interview.",
    "Continue Socratic protocol: ONE ask_user_question, score ambiguity, update `.omg/state/deep-interview-state.json`.",
    "Do not implement product code until pending-approval + explicit execution choice.",
  ].join(" "),
  autopilot: [
    "Active mode: autopilot.",
    "Continue the next incomplete phase (expand → plan → execute → QA → validate).",
    "Update `.omg/state/autopilot-state.json`; set active=false only when fully verified.",
  ].join(" "),
  ralph: [
    "Active mode: ralph.",
    "PRD-driven persistence: work the highest-priority story with passes:false in `.omg/prd.json` (or session PRD).",
    "Verify acceptance criteria with fresh evidence before marking passes:true.",
  ].join(" "),
  ultrawork: [
    "Active mode: ultrawork.",
    "Prefer parallel spawn_subagent for independent tasks; do not serialize independent work.",
  ].join(" "),
  ultraqa: [
    "Active mode: ultraqa.",
    "Cycle build/lint/test/fix until goals pass or the same error repeats 3 times.",
  ].join(" "),
  ralplan: [
    "Active mode: ralplan.",
    "Continue Planner → Architect → Critic consensus; write plans under `.omg/plans/`.",
  ].join(" "),
  orchestration: [
    "Active mode: orchestration Protocol v1.3 (Runtime Policy A′ default).",
    "Protocol defines execution semantics; Runtime Policy binds them to the host. Team is Recipe config only — not a runtime type.",
    "Hierarchical Execution Graph: Coordinator|Worker; containment + dependsOn. Root Coordinator NEVER implements product code.",
    "Policy A′: root materializes SoT + sole Worker spawner; children propose only; fallback is always root materialize.",
    "Freeze Must-reject: validate kind/role, dependsOn cycle/unknown, ownership, Resolver rejected — before any canonical scope/task/issue/lock materialize.",
    "Freeze Must-outcome: re-prompt same logical invocation → resume/repair (no duplicate scopes/issues/locks); never reject solely because already invoked.",
    "Containment≠ownership: parentScopeId/scopeId = containing Scope alias; childScopeId = Coordinator-owned nested Scope only (Workers own none).",
    "Recipe member role (implementer|reviewer|…) ≠ Protocol role (coordinator|worker); reject only Protocol kind/role conflicts.",
    "Ownership is global; planning is hierarchical. Conflict menu only: reassign/split/deps/issues/restart — no source edits.",
    "Lead stays on strongest model; classify each Worker task LOW|MEDIUM|HIGH|CRITICAL → OMG_MODEL_* (no hard-coded vendor IDs).",
    "SoT: Task JSON=runtime; Issue=human contract; board.md=view only. omit kind ⇒ agent.",
    "Before spawn: strategy (default conservative) + effective_parallel = min(strategy_cap, max-parallel, safety) counts leaf Workers; lock grant + Canonical Issue (1 leaf↔1 issue).",
    "Worker impl: Snapshot → Requirements → /ralplan → executionGoal → AC → root AC stamp → impl → goalHandoff → PR Fixes #N.",
    "Workers MUST NOT change Scope/Priority/Ownership/Dependencies; MUST NOT self-upgrade model — request complexity_escalation.",
    "Review depth by complexity; chain Issue→executionGoal→AC→Impl→PR→Tests; no implement. Merge only after Review APPROVE + human confirm.",
    "Cancel Soft: mode inactive + mark scopes cancelled; no hard process kill. Mode file `.omg/state/orchestration-state.json`; no MCP orchestration mode.",
  ].join(" "),
};

function hintForMode(modeName) {
  const key = String(modeName).toLowerCase();
  for (const [k, v] of Object.entries(MODE_HINTS)) {
    if (key.includes(k)) return v;
  }
  return `Active OMG mode: ${modeName}. Continue the skill protocol; keep \`.omg/state\` updated; set active=false only on terminal phase.`;
}

async function main() {
  const input = await readStdinJson();
  const ws = workspaceRoot(input);
  const modes = listActiveModes(ws);
  if (!modes.length) process.exit(0);

  // Skip pure cancel prompts — keyword-detector + clear handles them
  const prompt = String(
    input.prompt || input.userPrompt || input.message || input.text || ""
  );
  if (/\b(cancel\s*omg|stop\s*omg|cancelomg|stopomg|cancelomc|stopomc)\b/i.test(prompt)) {
    process.exit(0);
  }

  const parts = [
    "[OMG skill-injector] Active orchestration mode(s) detected:",
    ...modes.map((m) => `- ${m.mode} (${m.file}): ${hintForMode(m.mode)}`),
    "Honor these constraints for this turn.",
  ];

  try {
    refreshHud(ws, { last_hook: "skill-injector" });
  } catch {
    /* ignore */
  }

  emitAdditionalContext("UserPromptSubmit", parts.join("\n"));
  process.exit(0);
}

main().catch(() => process.exit(0));
