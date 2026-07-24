#!/usr/bin/env node
/**
 * Keep dist/runtime/* re-exports for existing consumers of the pre-port layout.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist", "runtime");
fs.mkdirSync(outDir, { recursive: true });

const files = {
  "atomic-write.js": `export { atomicWriteFileSync, atomicWriteJson } from "../lib/atomic-write.js";\n`,
  "state.js": `export { resolveStateDir, modePath, readMode, writeMode, listActiveModes } from "../lib/mode-state.js";\n`,
  "team.js": `export { parseAgentSpec, hasTmux, resolveAgentBin, planTeam, readTeamState, shutdownTeam, teamStatePath } from "../team/plan.js";\n`,
  "index.js": `export * from "./atomic-write.js";\nexport * from "./state.js";\nexport * from "./team.js";\n`,
};

for (const [name, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), body);
  // minimal .d.ts
  const dts = name.replace(/\.js$/, ".d.ts");
  fs.writeFileSync(
    path.join(outDir, dts),
    body.replace(/from "([^"]+)"/g, 'from "$1"').replace(/\.js"/g, '"')
  );
}
console.log("dist/runtime compat re-exports written");
