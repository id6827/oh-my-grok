#!/usr/bin/env node
/**
 * PreCompact: remind the model that OMG mode state lives on disk and should be
 * re-read after compaction. Optionally write a tiny snapshot index.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  readStdinJson,
  workspaceRoot,
  listActiveModes,
  ensureOmgTree,
  emitAdditionalContext,
} from "./lib/hook-io.mjs";

async function main() {
  const input = await readStdinJson();
  const ws = workspaceRoot(input);
  ensureOmgTree(ws);
  const modes = listActiveModes(ws);
  const now = new Date().toISOString();
  const snapDir = join(ws, ".omg", "state");
  try {
    mkdirSync(snapDir, { recursive: true });
    writeFileSync(
      join(snapDir, "precompact-snapshot.json"),
      JSON.stringify(
        {
          at: now,
          active_modes: modes.map((m) => ({
            mode: m.mode,
            file: m.file,
            phase: m.phase,
          })),
        },
        null,
        2
      ) + "\n"
    );
  } catch {
    /* ignore */
  }

  if (modes.length === 0) process.exit(0);

  const text = [
    "[OMG PreCompact] Conversation is about to compact.",
    `Active modes: ${modes.map((m) => m.mode).join(", ")}.`,
    "After compact, re-read `.omg/state/*-state.json` and continue the active skill protocol.",
    "Do not assume interview/autopilot/ralph finished unless active=false and phase is terminal.",
  ].join(" ");

  // PreCompact is passive on some harnesses; emit additionalContext when supported
  emitAdditionalContext("PreCompact", text);
  process.exit(0);
}

main().catch(() => process.exit(0));
