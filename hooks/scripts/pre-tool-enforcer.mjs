#!/usr/bin/env node
/**
 * OMG PreToolUse enforcer (simplified vs OMC).
 * - Deny catastrophic shell patterns on run_terminal_command / Bash
 * - Fail-open on parse errors
 */
import { readStdinJson } from "./lib/hook-io.mjs";

const DANGEROUS = [
  // wipe roots
  /rm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+|--force\s+)*\/(\s|$)/,
  /rm\s+-rf\s+\/\s*$/,
  /rm\s+-rf\s+\/\*/,
  // disk destroy
  /mkfs\./i,
  /dd\s+if=.+\s+of=\/dev\/(sd|disk|nvme)/i,
  // fork bomb
  /:\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;/,
  // curl|bash raw install without path (high risk one-liners)
  /curl\s+[^|]+\|\s*(ba)?sh\b/i,
  /wget\s+[^|]+\|\s*(ba)?sh\b/i,
];

function toolName(input) {
  return String(input.toolName || input.tool_name || "").toLowerCase();
}

function commandFrom(input) {
  const ti = input.toolInput || input.tool_input || {};
  return String(ti.command || ti.cmd || "");
}

function isShellTool(name) {
  return (
    name === "run_terminal_command" ||
    name === "bash" ||
    name.includes("run_terminal") ||
    name === "shell"
  );
}

async function main() {
  let input;
  try {
    input = await readStdinJson();
  } catch {
    process.exit(0);
  }

  const name = toolName(input);
  if (!isShellTool(name)) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  }

  const cmd = commandFrom(input);
  if (!cmd.trim()) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  }

  for (const re of DANGEROUS) {
    if (re.test(cmd)) {
      process.stdout.write(
        JSON.stringify({
          decision: "deny",
          reason: `[OMG pre-tool-enforcer] Blocked dangerous command pattern: ${re}. Refusing: ${cmd.slice(0, 200)}`,
        })
      );
      process.exit(0);
    }
  }

  process.stdout.write(JSON.stringify({ decision: "allow" }));
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
  process.exit(0);
});
