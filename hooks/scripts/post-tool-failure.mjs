#!/usr/bin/env node
/**
 * PostToolUseFailure: record failure + remind active modes (fail-open).
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  readStdinJson,
  workspaceRoot,
  listActiveModes,
  emitAdditionalContext,
  omgRoot,
} from "./lib/hook-io.mjs";
import { refreshHud } from "./lib/hud.mjs";

async function main() {
  const input = await readStdinJson();
  const ws = workspaceRoot(input);
  const modes = listActiveModes(ws);
  refreshHud(ws, { last_hook: "PostToolUseFailure" });

  try {
    const dir = join(omgRoot(ws), "state");
    mkdirSync(dir, { recursive: true });
    const path = join(dir, "last-tool-failure.json");
    writeFileSync(
      path,
      JSON.stringify(
        {
          at: new Date().toISOString(),
          toolName: input.toolName || input.tool_name,
          message: String(input.error || input.toolResult || "").slice(0, 2000),
          active_modes: modes.map((m) => m.mode),
        },
        null,
        2
      ) + "\n"
    );
  } catch {
    /* ignore */
  }

  if (modes.length) {
    emitAdditionalContext(
      "PostToolUseFailure",
      `[OMG] Tool failed while modes active (${modes.map((m) => m.mode).join(", ")}). Diagnose before continuing; use web_search for ecosystem errors; do not mark modes complete.`
    );
  }
  process.exit(0);
}

main().catch(() => process.exit(0));
