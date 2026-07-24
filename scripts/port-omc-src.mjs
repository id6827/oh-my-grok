#!/usr/bin/env node
/**
 * Copy + transform OMC TypeScript sources into OMG src/.
 *
 * Usage:
 *   node scripts/port-omc-src.mjs --modules types,constants,utils,shared,platform
 *   node scripts/port-omc-src.mjs --modules lib --dry-run
 *   node scripts/port-omc-src.mjs --modules all --exclude __tests__
 *
 * Does NOT delete existing OMG-only files. Overwrites ported paths.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OMG_ROOT = path.resolve(__dirname, "..");
const DRY = process.argv.includes("--dry-run");

function argValue(name) {
  const i = process.argv.indexOf(name);
  if (i === -1) return null;
  return process.argv[i + 1] ?? null;
}

function resolveOmcRoot() {
  if (process.env.OMC_ROOT) return path.resolve(process.env.OMC_ROOT);
  const pin = path.join(homedir(), ".grok", "marketplace-cache", "6c258a25db310b8a");
  if (fs.existsSync(path.join(pin, "src"))) return pin;
  const cache = path.join(homedir(), ".grok", "marketplace-cache");
  if (!fs.existsSync(cache)) return null;
  for (const e of fs.readdirSync(cache, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const pkgPath = path.join(cache, e.name, "package.json");
    if (!fs.existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if ((pkg.name || "").includes("claude")) return path.join(cache, e.name);
    } catch {
      /* */
    }
  }
  return null;
}

/** Ordered TS-safe replacements (longer first where needed). */
const REPLACEMENTS = [
  [/oh-my-claudecode/g, "oh-my-grok"],
  [/oh-my-claude-sisyphus/g, "oh-my-grok"],
  [/Oh-My-ClaudeCode/g, "Oh-My-Grok"],
  [/Oh My ClaudeCode/g, "Oh My Grok"],
  [/\.omc\//g, ".omg/"],
  [/\.omc\b/g, ".omg"],
  // Brand tokens — careful with comments and strings
  [/\bOMC_STATE_DIR\b/g, "OMG_STATE_DIR"],
  [/\bOMC_SESSION_ID\b/g, "OMG_SESSION_ID"],
  [/\bCLAUDE_PLUGIN_ROOT\b/g, "GROK_PLUGIN_ROOT"],
  [/\bCLAUDE_PLUGIN_DATA\b/g, "GROK_PLUGIN_DATA"],
  [/\bCLAUDE_CONFIG_DIR\b/g, "GROK_CONFIG_DIR"],
  [/~\/\.claude\//g, "~/.grok/"],
  [/oh-my-claudecode\.js/g, "omg.js"],
  // Package imports that we shim
  [
    /from ['"]@anthropic-ai\/claude-agent-sdk['"]/g,
    "from '../shims/claude-agent-sdk.js'",
  ],
  [
    /from ['"]better-sqlite3['"]/g,
    "from '../shims/better-sqlite3.js'",
  ],
];

// Second-pass brand (after path fixes) — avoid breaking already-transformed
const BRAND_REPLACEMENTS = [
  // only whole-word OMC → OMG in identifiers/comments; keep "omc" path segments already .omg
  [/\bOMC\b/g, "OMG"],
  // omc CLI name in user-facing strings
  [/\bomc\b/g, "omg"],
];

function transformContent(content, rel) {
  let out = content;
  for (const [re, to] of REPLACEMENTS) out = out.replace(re, to);
  for (const [re, to] of BRAND_REPLACEMENTS) out = out.replace(re, to);

  // Fix relative shim imports that went wrong for nested depth
  // Leave as-is; modules may need manual fix for import depth

  // Header notice for ported files
  if (!out.includes("Ported from oh-my-claudecode") && !out.includes("Ported from OMC")) {
    const header =
      "/**\n * Ported from oh-my-claudecode (MIT) — see NOTICE.\n * Transformed for oh-my-grok / Grok Build.\n */\n";
    if (out.startsWith("#!") || out.startsWith("/**") || out.startsWith("/*") || out.startsWith("//")) {
      // keep existing header; append note after first block if short file
    } else {
      out = header + out;
    }
  }
  return out;
}

function walk(dir, base, excludeDirs) {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    const rel = path.relative(base, full).replace(/\\/g, "/");
    if (name.isDirectory()) {
      if (excludeDirs.has(name.name)) continue;
      out.push(...walk(full, base, excludeDirs));
    } else if (/\.(ts|tsx|d\.ts)$/.test(name.name)) {
      out.push(rel);
    }
  }
  return out;
}

function main() {
  const omcRoot = resolveOmcRoot();
  if (!omcRoot) {
    console.error("OMC root not found");
    process.exit(1);
  }
  const modulesArg = argValue("--modules") || "";
  const excludeArg = argValue("--exclude") || "";
  const excludeDirs = new Set(
    excludeArg
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  // Always skip node_modules if present
  excludeDirs.add("node_modules");

  const omcSrc = path.join(omcRoot, "src");
  const allMods = fs
    .readdirSync(omcSrc, { withFileTypes: true })
    .filter((d) => d.isDirectory() || d.name.endsWith(".ts"))
    .map((d) => d.name);

  let modules;
  if (modulesArg === "all") {
    modules = allMods.filter((m) => m !== "AGENTS.md");
  } else {
    modules = modulesArg
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (modules.length === 0) {
    console.error("Specify --modules types,constants,... or --modules all");
    process.exit(1);
  }

  let copied = 0;
  let skipped = 0;
  for (const mod of modules) {
    const srcPath = path.join(omcSrc, mod);
    if (!fs.existsSync(srcPath)) {
      console.warn(`skip missing OMC module: ${mod}`);
      skipped++;
      continue;
    }
    if (fs.statSync(srcPath).isFile()) {
      // single file e.g. index.ts
      const rel = mod;
      const dest = path.join(OMG_ROOT, "src", rel);
      const content = transformContent(fs.readFileSync(srcPath, "utf8"), rel);
      if (DRY) {
        console.log(`DRY ${rel}`);
      } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, content);
      }
      copied++;
      continue;
    }
    const files = walk(srcPath, omcSrc, excludeDirs);
    for (const rel of files) {
      const from = path.join(omcSrc, rel);
      const dest = path.join(OMG_ROOT, "src", rel);
      const content = transformContent(fs.readFileSync(from, "utf8"), rel);
      if (DRY) {
        console.log(`DRY ${rel}`);
      } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, content);
      }
      copied++;
    }
    console.log(`module ${mod}: ${files.length} files`);
  }
  console.log(`${DRY ? "DRY " : ""}copied=${copied} skipped=${skipped} → src/`);
}

main();
