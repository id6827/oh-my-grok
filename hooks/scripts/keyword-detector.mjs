#!/usr/bin/env node
/**
 * OMG Keyword Detector (Layer B, simplified)
 * UserPromptSubmit: detect magic keywords and inject skill routing context.
 * Also seeds lightweight .omg/state/* files for mode tracking (Stop gate uses them).
 */
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import {
  readStdinJson,
  workspaceRoot,
  ensureOmgTree,
  writeJson,
  emitAdditionalContext,
} from "./lib/hook-io.mjs";

/** Priority order: first match wins for primary skill; cancel always wins. */
const RULES = [
  {
    name: "cancel",
    skill: "cancel",
    // cancelomg / stopomg / cancelomc compatibility
    re: /\b(cancel\s*omg|stop\s*omg|cancelomg|stopomg|cancelomc|stopomc|cancel\s*omc|stop\s*omc)\b/i,
    activate: null,
  },
  {
    name: "deep-interview",
    skill: "deep-interview",
    re: /\b(deep[\s-]?interview|socratic\s+interview|ouroboros)\b/i,
    activate: "deep-interview",
  },
  {
    name: "autopilot",
    skill: "autopilot",
    re: /\b(auto[\s-]?pilot|full\s+auto)\b/i,
    activate: "autopilot",
  },
  {
    name: "ralph",
    skill: "ralph",
    re: /\bralph\b/i,
    activate: "ralph",
  },
  {
    name: "ultrawork",
    skill: "ultrawork",
    re: /\b(ultra\s*work|ultrawork|\bulw\b)\b/i,
    activate: "ultrawork",
  },
  {
    name: "ultraqa",
    skill: "ultraqa",
    re: /\b(ultra\s*qa|ultraqa)\b/i,
    activate: "ultraqa",
  },
  {
    name: "ralplan",
    skill: "ralplan",
    re: /\b(ralplan|ral\s*plan)\b/i,
    activate: "ralplan",
  },
  {
    name: "ui-mockup",
    skill: "ui-mockup",
    re: /\b(ui[\s-]?mockup|mock\s*up\s+(the\s+)?ui)\b/i,
    activate: null,
  },
  {
    name: "web-research",
    skill: "web-research",
    re: /\b(web[\s-]?research|realtime\s+docs?\s+scan)\b/i,
    activate: null,
  },
];

function extractPrompt(input) {
  return (
    input.prompt ||
    input.userPrompt ||
    input.message ||
    input.text ||
    (typeof input.content === "string" ? input.content : "") ||
    ""
  );
}

function activateMode(ws, mode, prompt, sessionId) {
  const statePath = join(ws, ".omg", "state", `${mode}-state.json`);
  const now = new Date().toISOString();
  // Do not clobber a rich skill-owned state file (e.g. deep-interview with interview_id).
  if (existsSync(statePath)) {
    try {
      const existing = JSON.parse(readFileSync(statePath, "utf8"));
      if (
        existing &&
        (existing.state?.interview_id ||
          existing.interview_id ||
          existing.state?.rounds)
      ) {
        existing.active = true;
        existing.updated_at = now;
        existing.source = existing.source || "keyword-detector";
        writeJson(statePath, existing);
        return;
      }
    } catch {
      /* create fresh below */
    }
  }
  writeJson(statePath, {
    active: true,
    mode,
    current_phase: mode,
    session_id: sessionId || null,
    activated_at: now,
    updated_at: now,
    source: "keyword-detector",
    task_preview: String(prompt).slice(0, 500),
    state: {
      active: true,
      current_phase: mode,
    },
  });
}

function skillContext(skill, prompt) {
  return [
    `[OMG keyword-detector] Detected intent for skill \`/${skill}\`.`,
    `You MUST follow the oh-my-grok skill \`/${skill}\` (load and obey its SKILL.md protocol).`,
    `Persist orchestration state under \`.omg/\` only.`,
    `User prompt: ${String(prompt).slice(0, 1200)}`,
  ].join("\n");
}

async function main() {
  const input = await readStdinJson();
  const prompt = extractPrompt(input);
  if (!prompt || !String(prompt).trim()) process.exit(0);

  const ws = workspaceRoot(input);
  ensureOmgTree(ws);
  const sessionId = input.sessionId || process.env.GROK_SESSION_ID || "";

  const matched = [];
  for (const rule of RULES) {
    if (rule.re.test(prompt)) matched.push(rule);
  }
  if (matched.length === 0) process.exit(0);

  // cancel wins alone
  const primary =
    matched.find((m) => m.name === "cancel") || matched[0];

  if (primary.activate) {
    try {
      activateMode(ws, primary.activate, prompt, sessionId);
    } catch {
      /* fail-open */
    }
  }

  // ralph implies ultrawork companion state (OMC parity lite)
  if (primary.name === "ralph") {
    try {
      activateMode(ws, "ultrawork", prompt, sessionId);
    } catch {
      /* ignore */
    }
  }

  emitAdditionalContext("UserPromptSubmit", skillContext(primary.skill, prompt));
  process.exit(0);
}

main().catch(() => process.exit(0));
