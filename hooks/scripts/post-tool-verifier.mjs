#!/usr/bin/env node
/**
 * PostToolUse: lightweight verifier / mode reminder (OMC post-tool-verifier lite).
 * Passive — never blocks. Refreshes HUD; if a mode is active and a shell tool failed,
 * injects a short recovery hint via additionalContext when the harness supports it.
 */
import {
  readStdinJson,
  workspaceRoot,
  listActiveModes,
  emitAdditionalContext,
} from "./lib/hook-io.mjs";
import { refreshHud } from "./lib/hud.mjs";

async function main() {
  const input = await readStdinJson();
  const ws = workspaceRoot(input);
  refreshHud(ws, { last_hook: "PostToolUse" });

  const modes = listActiveModes(ws);
  if (!modes.length) process.exit(0);

  const tool = String(input.toolName || input.tool_name || "");
  const isShell =
    /run_terminal|bash|shell/i.test(tool) ||
    tool === "Bash";

  // Detect failure signals in common payload shapes
  const result = input.toolResult || input.tool_result || input.result || "";
  const resultStr = typeof result === "string" ? result : JSON.stringify(result || "");
  const failed =
    input.isError === true ||
    /exit code [1-9]/i.test(resultStr) ||
    /Command failed/i.test(resultStr);

  if (isShell && failed) {
    emitAdditionalContext(
      "PostToolUse",
      [
        "[OMG post-tool-verifier] Shell tool reported failure while modes active:",
        modes.map((m) => m.mode).join(", ") + ".",
        "Use web_search for known fixes if ecosystem-related; update .omg/state; do not mark the mode complete.",
      ].join(" ")
    );
  }
  process.exit(0);
}

main().catch(() => process.exit(0));
