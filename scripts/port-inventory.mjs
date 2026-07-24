#!/usr/bin/env node
/**
 * OMC → OMG path inventory.
 * Scans pinned OMC tree and writes CSV/JSON under .omg/artifacts/.
 *
 * Usage:
 *   node scripts/port-inventory.mjs
 *   OMC_ROOT=/path/to/omc node scripts/port-inventory.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OMG_ROOT = path.resolve(__dirname, "..");
const ARTIFACTS = path.join(OMG_ROOT, ".omg", "artifacts");

function resolveOmcRoot() {
  if (process.env.OMC_ROOT) return path.resolve(process.env.OMC_ROOT);
  const cache = path.join(homedir(), ".grok", "marketplace-cache");
  if (!fs.existsSync(cache)) return null;
  const entries = fs.readdirSync(cache, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const pkgPath = path.join(cache, e.name, "package.json");
    if (!fs.existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const n = pkg.name || "";
      if (
        n.includes("claudecode") ||
        n.includes("claude-sisyphus") ||
        n === "oh-my-claude-sisyphus"
      ) {
        return path.join(cache, e.name);
      }
    } catch {
      /* skip */
    }
  }
  // Prefer documented hash if present
  const pin = path.join(cache, "6c258a25db310b8a");
  if (fs.existsSync(path.join(pin, "package.json"))) return pin;
  return null;
}

function walkTs(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === "dist") continue;
      out.push(...walkTs(full, base));
    } else if (name.name.endsWith(".ts") || name.name.endsWith(".tsx")) {
      out.push(path.relative(base, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

function topLevelModule(rel) {
  const i = rel.indexOf("/");
  return i === -1 ? rel : rel.slice(0, i);
}

function omgExists(relPath) {
  return fs.existsSync(path.join(OMG_ROOT, relPath));
}

function statusForModule(mod, omcCount, omgSrcCount) {
  // Known non-src surfaces
  if (mod === "index.ts") {
    return omgExists("src/index.ts") || omgExists("runtime/src/index.ts")
      ? omgExists("src/index.ts")
        ? "ported"
        : "partial"
      : "missing";
  }
  if (omgSrcCount === 0) {
    // Check legacy runtime / hooks / skills coverage
    if (mod === "team" && omgExists("runtime/src/team.ts")) return "partial";
    if (mod === "hooks" && omgExists("hooks/scripts")) return "partial";
    if (mod === "hud" && omgExists("scripts/hud/omg-hud.mjs")) return "partial";
    if (mod === "mcp" && omgExists("mcp/omg-state-server.mjs")) return "partial";
    if (mod === "skills" && omgExists("skills")) return "partial";
    if (mod === "agents" && omgExists("agents")) return "partial";
    return "missing";
  }
  if (omgSrcCount >= omcCount * 0.8) return "ported";
  if (omgSrcCount > 0) return "partial";
  return "missing";
}

function main() {
  const omcRoot = resolveOmcRoot();
  if (!omcRoot) {
    console.error("OMC root not found. Set OMC_ROOT=...");
    process.exit(1);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(omcRoot, "package.json"), "utf8")
  );
  let gitHead = null;
  try {
    gitHead = fs
      .readFileSync(path.join(omcRoot, ".git", "HEAD"), "utf8")
      .trim();
  } catch {
    /* ignore */
  }

  const omcSrc = path.join(omcRoot, "src");
  const omcFiles = walkTs(omcSrc, omcSrc);
  const omgSrcRoot = path.join(OMG_ROOT, "src");
  const omgFiles = walkTs(omgSrcRoot, omgSrcRoot);
  const runtimeFiles = walkTs(
    path.join(OMG_ROOT, "runtime", "src"),
    path.join(OMG_ROOT, "runtime", "src")
  );

  const byMod = new Map();
  for (const f of omcFiles) {
    const m = topLevelModule(f);
    if (!byMod.has(m)) byMod.set(m, { omc: [], omg: [] });
    byMod.get(m).omc.push(f);
  }
  for (const f of omgFiles) {
    const m = topLevelModule(f);
    if (!byMod.has(m)) byMod.set(m, { omc: [], omg: [] });
    byMod.get(m).omg.push(f);
  }

  const modules = [...byMod.entries()]
    .map(([name, { omc, omg }]) => ({
      module: name,
      omcFiles: omc.length,
      omgSrcFiles: omg.length,
      status: statusForModule(name, omc.length, omg.length),
      omcPath: name === "index.ts" ? "src/index.ts" : `src/${name}/`,
      omgPath: name === "index.ts" ? "src/index.ts" : `src/${name}/`,
    }))
    .sort((a, b) => b.omcFiles - a.omcFiles);

  // Surface inventory (non-src)
  const surfaces = [
    {
      surface: "bridge/",
      omc: omgExists("bridge") ? "partial" : "missing",
      notes: "OMC has mcp-server.cjs, team-*, runtime-cli, cli, coordinator",
    },
    {
      surface: "scripts/hooks",
      omc: "partial",
      notes: "OMG has subset under hooks/scripts",
    },
    {
      surface: "bin/omg",
      omc: omgExists("bin/omg.js") ? "partial" : "missing",
      notes: "omc/oh-my-claudecode alias policy TBD",
    },
    {
      surface: "templates/",
      omc: omgExists("templates") ? "partial" : "missing",
      notes: "",
    },
    {
      surface: "benchmarks/",
      omc: omgExists("benchmarks") ? "partial" : "missing",
      notes: "",
    },
    {
      surface: "examples/",
      omc: omgExists("examples") ? "partial" : "missing",
      notes: "",
    },
  ];

  const summary = {
    generatedAt: new Date().toISOString(),
    omcRoot,
    omcPackage: { name: pkg.name, version: pkg.version },
    gitHead,
    totals: {
      omcTs: omcFiles.length,
      omgSrcTs: omgFiles.length,
      omgRuntimeTs: runtimeFiles.length,
      modules: modules.length,
      ported: modules.filter((m) => m.status === "ported").length,
      partial: modules.filter((m) => m.status === "partial").length,
      missing: modules.filter((m) => m.status === "missing").length,
    },
    moduleCoveragePct:
      modules.length === 0
        ? 0
        : Math.round(
            (modules.filter((m) => m.status === "ported" || m.status === "partial")
              .length /
              modules.length) *
              1000
          ) / 10,
    modules,
    surfaces,
    omgRuntimeFiles: runtimeFiles,
  };

  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const jsonPath = path.join(ARTIFACTS, "port-inventory.json");
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2) + "\n");

  const csvLines = [
    "module,omc_files,omg_src_files,status,omc_path,omg_path",
    ...modules.map(
      (m) =>
        `${m.module},${m.omcFiles},${m.omgSrcFiles},${m.status},${m.omcPath},${m.omgPath}`
    ),
  ];
  const csvPath = path.join(ARTIFACTS, "port-inventory.csv");
  fs.writeFileSync(csvPath, csvLines.join("\n") + "\n");

  console.log(`OMC root: ${omcRoot}`);
  console.log(`OMC ${pkg.name}@${pkg.version} — ${omcFiles.length} .ts files`);
  console.log(
    `Modules: ${summary.totals.ported} ported / ${summary.totals.partial} partial / ${summary.totals.missing} missing (${summary.moduleCoveragePct}% touched)`
  );
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${csvPath}`);
}

main();
