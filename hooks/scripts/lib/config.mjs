/**
 * Load OMG project/user config (JSONC-ish: strip // and /* *\/ comments).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function stripJsonc(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function tryLoad(path) {
  if (!existsSync(path)) return null;
  try {
    return { path, data: JSON.parse(stripJsonc(readFileSync(path, "utf8"))) };
  } catch {
    return { path, data: null, error: "parse_error" };
  }
}

export function loadOmgConfig(ws = process.cwd()) {
  const candidates = [
    join(ws, ".grok", "omg.jsonc"),
    join(ws, ".grok", "omg.json"),
    join(ws, "omg.jsonc"),
    join(homedir(), ".config", "grok-omg", "config.jsonc"),
    join(homedir(), ".grok", "omg.jsonc"),
  ];
  for (const p of candidates) {
    const r = tryLoad(p);
    if (r && r.data) return r;
  }
  return { path: null, data: {} };
}

export function ambiguityThreshold(ws) {
  const { data, path } = loadOmgConfig(ws);
  const v = data?.deepInterview?.ambiguityThreshold ?? data?.omg?.deepInterview?.ambiguityThreshold;
  if (typeof v === "number" && v >= 0 && v <= 1) {
    return { threshold: v, source: path || "default", percent: Math.round(v * 100) };
  }
  return { threshold: 0.2, source: "default", percent: 20 };
}
