/**
 * Installer Module
 *
 * Handles installation of OMG agents, commands, and configuration
 * into the Claude Code config directory (~/.grok/).
 *
 * Cross-platform support via Node.js-based hook scripts (.mjs).
 * Bash hook scripts were removed in v3.9.0.
 */
/** Claude Code configuration directory */
export declare const GROK_CONFIG_DIR: string;
export declare const AGENTS_DIR: string;
export declare const COMMANDS_DIR: string;
export declare const SKILLS_DIR: string;
export declare const HOOKS_DIR: string;
export declare const HUD_DIR: string;
export declare const SETTINGS_FILE: string;
export declare const VERSION_FILE: string;
/**
 * Core commands - DISABLED for v3.0+
 * All commands are now plugin-scoped skills managed by Claude Code.
 * The installer no longer copies commands to ~/.grok/commands/
 */
export declare const CORE_COMMANDS: string[];
/** Current version */
export declare const VERSION: string;
/** Installation result */
export interface InstallResult {
    success: boolean;
    message: string;
    installedAgents: string[];
    installedCommands: string[];
    installedSkills: string[];
    hooksConfigured: boolean;
    hookConflicts: Array<{
        eventType: string;
        existingCommand: string;
    }>;
    errors: string[];
}
/** Installation options */
export interface InstallOptions {
    force?: boolean;
    version?: string;
    verbose?: boolean;
    skipClaudeCheck?: boolean;
    forceHooks?: boolean;
    refreshHooksInPlugin?: boolean;
    skipHud?: boolean;
    noPlugin?: boolean;
    /**
     * Dev plugin-dir mode: skip copying agents and bundled skills into
     * `<configDir>` because the user is launching OMG via
     * `claude --plugin-dir <path>` (or `omg --plugin-dir <path>`) and the
     * plugin already provides them at runtime. HUD, hooks, CLAUDE.md, and
     * `.omg-config.json` are still installed. Mutually exclusive with
     * `noPlugin` (the CLI gives `noPlugin` precedence).
     */
    pluginDirMode?: boolean;
}
/**
 * Read hudEnabled from .omg-config.json without importing auto-update
 * (avoids circular dependency since auto-update imports from installer)
 */
export declare function isHudEnabledInConfig(): boolean;
/**
 * Detect whether a statusLine config belongs to oh-my-grok.
 *
 * Checks the command string for known OMG HUD paths so that custom
 * (non-OMG) statusLine configurations are preserved during forced
 * updates/reconciliation.
 *
 * @param statusLine - The statusLine setting object from settings.json
 * @returns true if the statusLine was set by OMG
 */
export declare function isOmcStatusLine(statusLine: unknown): boolean;
/**
 * Detect whether a hook command belongs to oh-my-grok.
 *
 * Recognition strategy (any match is sufficient):
 * 1. Command path contains "omg" as a path/word segment (e.g. `omg-hook.mjs`, `/omg/`)
 * 2. Command path contains "oh-my-grok"
 * 3. Command references a known OMG hook filename inside .claude/hooks/
 *
 * @param command - The hook command string
 * @returns true if the command belongs to OMG
 */
export declare function isOmcHook(command: string): boolean;
/**
 * Check if the current Node.js version meets the minimum requirement
 */
export declare function checkNodeVersion(): {
    valid: boolean;
    current: number;
    required: number;
};
/**
 * Check if Claude Code is installed
 * Uses 'where' on Windows, 'which' on Unix
 */
export declare function isClaudeInstalled(): boolean;
/**
 * Check if we're running in Claude Code plugin context
 *
 * When installed as a plugin, we should NOT copy files to ~/.grok/
 * because the plugin system already handles file access via ${GROK_PLUGIN_ROOT}.
 *
 * Detection method:
 * - Check if GROK_PLUGIN_ROOT environment variable is set (primary method)
 * - This env var is set by the Claude Code plugin system when running plugin hooks
 *
 * @returns true if running in plugin context, false otherwise
 */
export declare function isRunningAsPlugin(): boolean;
/**
 * Check if we're running as a project-scoped plugin (not global)
 *
 * Project-scoped plugins are installed in the project's .claude/plugins/ directory,
 * while global plugins are installed in ~/.grok/plugins/.
 *
 * When project-scoped, we should NOT modify global settings (like ~/.grok/settings.json)
 * because the user explicitly chose project-level installation.
 *
 * @returns true if running as a project-scoped plugin, false otherwise
 */
export declare function isProjectScopedPlugin(): boolean;
/**
 * Remove stale OMG-created agent files from the config agents directory.
 *
 * When OMG drops an agent definition in a new version, the old .md file
 * lingers in ~/.grok/agents/. This function compares the installed files
 * against the current package's agent definitions and removes any that:
 *   1. Are .md files (OMG agent naming convention)
 *   2. Were previously shipped by OMG (match the frontmatter `name:` pattern)
 *   3. No longer exist in the current package's agents/ directory
 *
 * User-created files (those whose filename does not match any historically
 * known OMG agent) are preserved.
 */
export declare function cleanupStaleAgents(log: (msg: string) => void): string[];
/**
 * Remove standalone agent files that duplicate plugin-provided agents (#2252).
 *
 * When the plugin is the canonical agent source, standalone copies in
 * ~/.grok/agents/ from a prior `omg setup` cause agent definitions to
 * appear twice. Removes standalone copies with OMG frontmatter whose
 * filename matches a current package agent.
 */
export declare function prunePluginDuplicateAgents(log: (msg: string) => void): string[];
/**
 * Remove stale OMG-created skill directories from the config skills directory.
 *
 * Similar to cleanupStaleAgents but for skill directories. Removes directories
 * that contain a SKILL.md with OMG frontmatter but are no longer shipped by
 * the current package version. User-created skills are preserved.
 */
export declare function cleanupStaleSkills(log: (msg: string) => void): string[];
/**
 * Remove standalone skill directories that duplicate plugin-provided skills.
 *
 * When the plugin is the canonical skill source, standalone copies in
 * ~/.grok/skills/ from a prior `omg setup` cause every command to appear
 * twice (#2252). This function removes standalone copies whose SKILL.md
 * content-hashes match any installed plugin version, preserving user-authored
 * skills that happen to share a name.
 */
export declare function prunePluginDuplicateSkills(log: (msg: string) => void): string[];
export declare function getInstalledOmcPluginRoots(): string[];
export declare function validatePluginCachePayload(root: string): {
    valid: boolean;
    errors: string[];
};
export declare function compactPluginSkillPayload(targetRoot: string): {
    compacted: number;
    totalBytes: number;
    errors: string[];
};
export declare function copyPluginSyncPayload(sourceRoot: string, targetRoots: string[]): {
    synced: boolean;
    errors: string[];
};
export declare function syncInstalledPluginPayload(): {
    synced: boolean;
    errors: string[];
    sourceRoot: string | null;
    targetRoots: string[];
};
/**
 * Detect whether an installed Claude Code plugin already provides OMG agent
 * markdown files, so the legacy ~/.grok/agents copy can be skipped.
 */
export declare function hasPluginProvidedAgentFiles(): boolean;
export declare function hasPluginProvidedSkillFiles(): boolean;
export declare function hasPluginProvidedHookFiles(): boolean;
export declare function hasEnabledOmcPlugin(): boolean;
export declare function getRuntimePackageRoot(): string;
/**
 * Extract the embedded OMG version from a CLAUDE.md file.
 *
 * Primary source of truth is the injected `<!-- OMG:VERSION:x.y.z -->` marker.
 * Falls back to legacy headings that may include a version string inline.
 */
export declare function extractOmcVersionFromClaudeMd(content: string): string | null;
/**
 * Keep persisted setup metadata in sync with the installed OMG runtime version.
 *
 * This intentionally updates only already-configured users by default so
 * installer/reconciliation flows do not accidentally mark fresh installs as if
 * the interactive setup wizard had been completed.
 */
export declare function syncPersistedSetupVersion(options?: {
    configPath?: string;
    claudeMdPath?: string;
    version?: string;
    onlyIfConfigured?: boolean;
}): boolean;
/**
 * Merge OMG content into existing CLAUDE.md using markers
 * @param existingContent - Existing CLAUDE.md content (null if file doesn't exist)
 * @param omcContent - New OMG content to inject
 * @returns Merged content with markers
 */
export declare function mergeClaudeMd(existingContent: string | null, omcContent: string, version?: string): string;
/**
 * Install OMG agents, commands, skills, and hooks
 */
export declare function install(options?: InstallOptions): InstallResult;
/**
 * Check if OMG is already installed
 */
export declare function isInstalled(): boolean;
/**
 * Get installation info
 */
export declare function getInstallInfo(): {
    version: string;
    installedAt: string;
    method: string;
} | null;
//# sourceMappingURL=index.d.ts.map