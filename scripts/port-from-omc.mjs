#!/usr/bin/env node
/**
 * Port OMC (oh-my-claudecode) prompt/content files to OMG (oh-my-grok).
 * Idempotent: safe to re-run on already-ported files.
 *
 * Usage: node scripts/port-from-omc.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRY = process.argv.includes("--dry-run");

/** Ordered replacements: longer/more-specific first. */
const REPLACEMENTS = [
  // Brand / product
  [/oh-my-claudecode/g, "oh-my-grok"],
  [/Oh-My-ClaudeCode/g, "Oh-My-Grok"],
  [/Oh My ClaudeCode/g, "Oh My Grok"],
  [/oh-my-claude-sisyphus/g, "oh-my-grok"],
  [/\bOMC\b/g, "OMG"],
  [/\bomc\b/g, "omg"],
  // Paths / env
  [/\.omc\//g, ".omg/"],
  [/\.omc\b/g, ".omg"],
  [/CLAUDE_PLUGIN_ROOT/g, "GROK_PLUGIN_ROOT"],
  [/CLAUDE_PLUGIN_DATA/g, "GROK_PLUGIN_DATA"],
  [/CLAUDE_CONFIG_DIR/g, "GROK_CONFIG_DIR"],
  [/~\/\.claude\//g, "~/.grok/"],
  [/\.claude\/omc\.jsonc/g, ".grok/omg.jsonc"],
  [/~\/\.config\/claude-omc\//g, "~/.config/grok-omg/"],
  [/\.claude\/settings\.json/g, ".grok/config.toml"],
  // Claude Code tool → Grok tool (prompt text)
  [/\bAskUserQuestion\b/g, "ask_user_question"],
  [/\bTodoWrite\b/g, "todo_write"],
  [/\bWebSearch\b/g, "web_search"],
  [/\bWebFetch\b/g, "web_fetch"],
  [/\bNotebookRead\b/g, "read_file"],
  [/\bMultiEdit\b/g, "search_replace"],
  // Task agent invocation patterns
  [
    /Task\s*\(\s*subagent_type\s*=\s*"oh-my-grok:([^"]+)"/g,
    'spawn_subagent(subagent_type="$1"',
  ],
  [
    /Task\s*\(\s*subagent_type\s*=\s*"([^"]+)"/g,
    'spawn_subagent(subagent_type="$1"',
  ],
  [/Skill\s*\(\s*"oh-my-grok:([^"]+)"\s*\)/g, 'skill("/$1")'],
  [/Skill\s*\(\s*"([^"]+)"\s*\)/g, 'skill("/$1")'],
  // Slash command brand
  [/\/oh-my-grok:/g, "/"],
];

/** Frontmatter transforms for agent files. */
function transformAgentFrontmatter(content) {
  // Strip Claude-only frontmatter keys that confuse Grok or are meaningless
  let out = content;
  out = out.replace(/^model:\s*(opus|sonnet|haiku|inherit).*$/m, "model: inherit");
  out = out.replace(/^level:\s*\d+\s*$/m, "");
  out = out.replace(/^color:\s*\S+\s*$/m, "");
  // Map disallowedTools to a Grok-friendly note in frontmatter
  if (/^disallowedTools:\s*/m.test(out)) {
    out = out.replace(/^disallowedTools:.*$/m, "permission_mode: plan");
    // For agents that were write-blocked, keep plan mode only if READ-ONLY intent
    // Some agents only blocked Write/Edit — plan is close enough for architect/critic
  }
  // Clean blank lines inside frontmatter
  out = out.replace(/^---\n([\s\S]*?)\n---/, (_, body) => {
    const cleaned = body
      .split("\n")
      .filter((l) => l.trim() !== "")
      .join("\n");
    return `---\n${cleaned}\n---`;
  });
  return out;
}

function transformContent(content, filePath) {
  let out = content;
  for (const [re, to] of REPLACEMENTS) {
    out = out.replace(re, to);
  }

  // Fix double-application artifacts
  out = out.replace(/oh-my-grok-grok/g, "oh-my-grok");
  out = out.replace(/\.omg\/omg\//g, ".omg/");
  out = out.replace(/GROK_GROK_/g, "GROK_");

  if (filePath.includes(`${path.sep}agents${path.sep}`) && filePath.endsWith(".md")) {
    out = transformAgentFrontmatter(out);
  }

  // Skills: strip OMC-only frontmatter noise; keep name/description/argument-hint
  if (filePath.endsWith("SKILL.md")) {
    out = out.replace(/^level:\s*\d+\s*$/m, "");
    out = out.replace(/^pipeline:\s*.*$/m, "");
    out = out.replace(/^handoff-policy:\s*.*$/m, "");
    out = out.replace(/^handoff:\s*.*$/m, "");
    out = out.replace(/^---\n([\s\S]*?)\n---/, (_, body) => {
      const cleaned = body
        .split("\n")
        .filter((l) => l.trim() !== "")
        .join("\n");
      return `---\n${cleaned}\n---`;
    });

    // Append Grok capability block once
    if (!out.includes("## Grok Capability Extensions")) {
      out += `

## Grok Capability Extensions

- On build/test failures: use \`web_search\` / \`web_fetch\` for latest fixes and community issues before inventing workarounds.
- On UI work without a design: prefer the \`/ui-mockup\` skill (Image Gen → Vision analysis → code → Vision QA).
- For live docs/API research: use \`/web-research\` or call \`web_search\` directly.
- Prefer \`spawn_subagent\` with \`isolation: "worktree"\` for parallel executors when mutating code.
- Persist orchestration state under \`.omg/\` only (never \`.omc/\`).
- Use \`ask_user_question\` for structured one-at-a-time questions (not multi-question dumps).
`;
    }
  }

  return out;
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

function renameOmcDirs() {
  const skillsDir = path.join(ROOT, "skills");
  const renames = [
    ["omc-doctor", "omg-doctor"],
    ["omc-reference", "omg-reference"],
    ["omc-setup", "omg-setup"],
    ["omc-teams", "omg-teams"],
  ];
  for (const [from, to] of renames) {
    const src = path.join(skillsDir, from);
    const dst = path.join(skillsDir, to);
    if (fs.existsSync(src) && !fs.existsSync(dst)) {
      if (DRY) console.log(`rename ${from} -> ${to}`);
      else fs.renameSync(src, dst);
    }
  }
}

function main() {
  renameOmcDirs();

  const targets = [
    ...walk(path.join(ROOT, "agents")),
    ...walk(path.join(ROOT, "skills")),
  ].filter((f) => {
    const ext = path.extname(f);
    return [".md", ".sh", ".mjs", ".ts", ".json", ".py", ".jsonc"].includes(ext);
  });

  let changed = 0;
  for (const file of targets) {
    const raw = fs.readFileSync(file, "utf8");
    const next = transformContent(raw, file);
    if (next !== raw) {
      changed++;
      const rel = path.relative(ROOT, file);
      if (DRY) console.log(`would update: ${rel}`);
      else fs.writeFileSync(file, next);
    }
  }

  // Rename skill name frontmatter for renamed dirs
  for (const name of ["omg-doctor", "omg-reference", "omg-setup", "omg-teams"]) {
    const skillPath = path.join(ROOT, "skills", name, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;
    let c = fs.readFileSync(skillPath, "utf8");
    const before = c;
    c = c.replace(/^name:\s*om[cg]-/m, `name: ${name}`);
    c = c.replace(/^name:\s*.*$/m, `name: ${name}`);
    // only first name line
    c = before.replace(/^name:\s*\S+/m, `name: ${name}`);
    if (!DRY && c !== before) fs.writeFileSync(skillPath, c);
  }

  console.log(`${DRY ? "Dry-run: " : ""}processed ${targets.length} files, ${changed} changed`);
}

main();
