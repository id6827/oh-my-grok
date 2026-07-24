/**
 * Resolve plugin root with Grok-first env, Claude-era aliases as fallback.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

export function getPluginRoot(fallback?: string): string {
  const env =
    process.env.GROK_PLUGIN_ROOT ||
    process.env.CLAUDE_PLUGIN_ROOT ||
    process.env.OMG_PLUGIN_ROOT;
  if (env) return env;
  if (fallback) return fallback;
  // dist/adapters/grok → repo root
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../..");
}

export function getPluginDataDir(): string | undefined {
  return (
    process.env.GROK_PLUGIN_DATA ||
    process.env.CLAUDE_PLUGIN_DATA ||
    process.env.OMG_PLUGIN_DATA
  );
}

export function getConfigDir(homedir: string): string {
  return (
    process.env.GROK_CONFIG_DIR ||
    process.env.CLAUDE_CONFIG_DIR ||
    path.join(homedir, ".grok")
  );
}
