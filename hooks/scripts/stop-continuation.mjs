#!/usr/bin/env node
/**
 * OMG Stop continuation gate (Layer B, simplified)
 * Keeps the agent working when an OMG mode is active under .omg/state/.
 *
 * Grok Stop semantics:
 * - Only gate reason === "end_turn"
 * - block with { decision: "block", reason }
 * - respect stopHookActive; give up after MAX_BLOCKS
 */
import {
  readStdinJson,
  workspaceRoot,
  listActiveModes,
  emitStopBlock,
  readJsonSafe,
} from "./lib/hook-io.mjs";
import { refreshHud } from "./lib/hud.mjs";
import { join } from "node:path";

const MAX_BLOCKS_PER_TURN = 4;

const TERMINAL_PHASES = new Set([
  "completed",
  "complete",
  "failed",
  "cancelled",
  "canceled",
  "aborted",
  "done",
  "pending approval",
  "pending-approval",
  "pending_approval",
  "awaiting approval",
  "awaiting-approval",
  "handoff",
]);

function normalizePhase(mode) {
  const raw =
    mode.phase ||
    mode.data?.current_phase ||
    mode.data?.state?.current_phase ||
    mode.data?.status ||
    "";
  return String(raw).trim().toLowerCase();
}

function isTerminal(mode) {
  const phase = normalizePhase(mode);
  if (!phase) return false;
  if (TERMINAL_PHASES.has(phase)) return true;
  if (phase.startsWith("pending")) return true;
  // deep-interview: active false already filtered; phase pending-approval
  if (mode.data?.active === false) return true;
  return false;
}


function prdProgress(ws) {
  const paths = [
    join(ws, ".omg", "prd.json"),
    join(ws, ".omg", "state", "prd.json"),
  ];
  for (const p of paths) {
    const prd = readJsonSafe(p);
    if (!prd?.userStories) continue;
    const stories = prd.userStories;
    const done = stories.filter((s) => s.passes === true).length;
    const next = stories.find((s) => !s.passes);
    return {
      total: stories.length,
      done,
      nextId: next?.id || null,
      nextTitle: next?.title || null,
    };
  }
  return null;
}

function continuationReason(modes, ws) {
  const names = modes.map((m) => m.mode).join(", ");
  const primary = modes[0];
  const phase = normalizePhase(primary);
  const prd = prdProgress(ws);
  const prdHint = prd
    ? ` PRD ${prd.done}/${prd.total} stories pass; next=${prd.nextId || "none"} ${prd.nextTitle || ""}.`
    : "";

  if (String(primary.mode).includes("deep-interview") || phase === "deep-interview") {
    return [
      "[OMG Stop gate] deep-interview is still active.",
      "Continue the interview protocol: one question via ask_user_question,",
      "update `.omg/state/deep-interview-state.json`, score ambiguity,",
      "and only stop when ambiguity ≤ threshold and a pending-approval spec is written,",
      "or the user explicitly cancels.",
      `Active modes: ${names}`,
    ].join(" ");
  }

  if (String(primary.mode).includes("autopilot")) {
    return [
      "[OMG Stop gate] autopilot is still active.",
      "Continue the next incomplete autopilot phase (plan → execute → QA → validate).",
      "Update `.omg/state/autopilot-state.json`. Do not claim completion until tests/build pass",
      "and validators approve, then set active=false.",
      `Active modes: ${names}`,
    ].join(" ");
  }

  if (String(primary.mode).includes("ralph")) {
    return [
      "[OMG Stop gate] ralph is still active.",
      "Keep implementing and verifying until acceptance criteria pass.",
      "Update `.omg/state/ralph-state.json` and `.omg/prd.json`.",
      prdHint,
      `Active modes: ${names}`,
    ].join(" ");
  }

  return [
    `[OMG Stop gate] Active OMG mode(s): ${names}.`,
    "Continue the skill protocol until the mode reaches a terminal phase",
    "(completed / pending-approval / cancelled) and set active=false in `.omg/state/`.",
    prdHint,
    "If the user asked to stop, run /cancel and clear state instead of idling.",
  ].join(" ");
}

function lastMessageSuggestsDone(msg) {
  if (!msg || typeof msg !== "string") return false;
  const m = msg.toLowerCase();
  // User-facing completion signals — allow stop
  return (
    /\b(pending approval|spec is ready|ambiguity:\s*\d|all phases complete|cancelled|canceled)\b/i.test(
      m
    ) && /\b(active\s*=\s*false|state cleaned|interview complete|smoke-test)\b/i.test(m)
  );
}

async function main() {
  const input = await readStdinJson();
  const reason = input.reason || input.stopReason || "";
  if (reason && reason !== "end_turn") process.exit(0);

  // Avoid infinite stop loops
  if (input.stopHookActive === true) {
    // Allow a few blocks, then open
    const n = Number(input.stopContinuationCount || input.continuationCount || 0);
    // Grok may not send count; use plugin data file soft counter optional — fail open after message
    if (n >= MAX_BLOCKS_PER_TURN) process.exit(0);
  }

  const ws = workspaceRoot(input);
  let modes = listActiveModes(ws).filter((m) => !isTerminal(m));

  // Deep-interview special path name
  const di = readJsonSafe(join(ws, ".omg", "state", "deep-interview-state.json"));
  if (di && di.active === true) {
    const phase = String(di.current_phase || di.state?.current_phase || "").toLowerCase();
    if (!TERMINAL_PHASES.has(phase) && !phase.includes("pending")) {
      if (!modes.some((m) => String(m.mode).includes("deep-interview"))) {
        modes.push({
          file: "deep-interview-state.json",
          mode: "deep-interview",
          phase: di.current_phase,
          data: di,
        });
      }
    }
  }

  if (modes.length === 0) process.exit(0);

  // If assistant already reported terminal completion, allow stop
  if (lastMessageSuggestsDone(input.lastAssistantMessage)) {
    process.exit(0);
  }

  // Cap continuations when stopHookActive (second+ fire)
  if (input.stopHookActive === true) {
    // After first continuation, only re-block if clearly still mid-protocol
    const msg = String(input.lastAssistantMessage || "");
    if (msg.length > 80 && !/ask_user_question|next question|ambiguity|phase \d/i.test(msg)) {
      // Agent may be stuck; allow stop
      process.exit(0);
    }
  }

  try {
    refreshHud(ws, { last_hook: "Stop", stop_blocked: true });
  } catch {
    /* ignore */
  }

  emitStopBlock(continuationReason(modes, ws));
  process.exit(0);
}

main().catch(() => process.exit(0));
