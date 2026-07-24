#!/usr/bin/env node
/**
 * Validate OMG agent/skill inventory against expected OMC parity set + Grok extras.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED_AGENTS = [
  "analyst",
  "architect",
  "code-reviewer",
  "code-simplifier",
  "critic",
  "debugger",
  "designer",
  "document-specialist",
  "executor",
  "explore",
  "git-master",
  "planner",
  "qa-tester",
  "scientist",
  "security-reviewer",
  "test-engineer",
  "tracer",
  "verifier",
  "writer",
  "visual-designer", // Grok-only
];

const EXPECTED_SKILLS = [
  "ai-slop-cleaner",
  "ask",
  "autopilot",
  "autoresearch",
  "cancel",
  "ccg",
  "configure-notifications",
  "debug",
  "deep-dive",
  "deep-interview",
  "deepinit",
  "external-context",
  "hud",
  "learner",
  "local-build-reminder",
  "mcp-setup",
  "merge-readiness",
  "omg-doctor",
  "omg-reference",
  "omg-setup",
  "omg-teams",
  "plan",
  "project-session-manager",
  "ralph",
  "ralplan",
  "release",
  "remember",
  "sciomc",
  "self-improve",
  "setup",
  "skill",
  "skillify",
  "team",
  "trace",
  "ultragoal",
  "ultraqa",
  "ultrawork",
  "verify",
  "visual-verdict",
  "wiki",
  "writer-memory",
  "ui-mockup", // Grok-only
  "web-research", // Grok-only
];

function listNames(dir, kind) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => {
      if (kind === "agents") return d.isFile() && d.name.endsWith(".md");
      return d.isDirectory() && fs.existsSync(path.join(dir, d.name, "SKILL.md"));
    })
    .map((d) => (kind === "agents" ? d.name.replace(/\.md$/, "") : d.name))
    .sort();
}

const agents = listNames(path.join(ROOT, "agents"), "agents");
const skills = listNames(path.join(ROOT, "skills"), "skills");

let errors = 0;

function diff(label, expected, actual) {
  const exp = new Set(expected);
  const act = new Set(actual);
  const missing = expected.filter((x) => !act.has(x));
  const extra = actual.filter((x) => !exp.has(x));
  console.log(`\n${label}: expected ${expected.length}, found ${actual.length}`);
  if (missing.length) {
    console.error("  MISSING:", missing.join(", "));
    errors++;
  }
  if (extra.length) {
    console.warn("  EXTRA:", extra.join(", "));
  }
  if (!missing.length && !extra.length) console.log("  OK");
}

diff("Agents", EXPECTED_AGENTS, agents);
diff("Skills", EXPECTED_SKILLS, skills);

// Frontmatter name check
for (const a of agents) {
  const body = fs.readFileSync(path.join(ROOT, "agents", `${a}.md`), "utf8");
  if (!body.startsWith("---")) {
    console.error(`Agent ${a}: missing frontmatter`);
    errors++;
  }
}
for (const s of skills) {
  const body = fs.readFileSync(path.join(ROOT, "skills", s, "SKILL.md"), "utf8");
  if (!/^---\nname:\s*/m.test(body)) {
    console.error(`Skill ${s}: missing name frontmatter`);
    errors++;
  }
}

// Plugin manifest
const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, "plugin.json"), "utf8"));
if (plugin.name !== "oh-my-grok") {
  console.error("plugin.json name must be oh-my-grok");
  errors++;
}

if (errors) {
  console.error(`\nFAILED with ${errors} error group(s)`);
  process.exit(1);
}
console.log("\nParity inventory OK");
