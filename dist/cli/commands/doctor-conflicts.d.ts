/**
 * Conflict diagnostic command
 * Scans for and reports plugin coexistence issues.
 */
import { inspectUnifiedMcpRegistrySync } from '../../installer/mcp-registry.js';
export interface WorkspaceMarkerStatus {
    /** Absolute path to the directory containing .omg-workspace, or null if absent. */
    markerRoot: string | null;
    /** True when OMG_STATE_DIR env var is set. */
    stateDirEnvSet: boolean;
    /** Value of OMG_STATE_DIR, or null when unset. */
    stateDirEnvValue: string | null;
    /** When both OMG_STATE_DIR and .omg-workspace are active, this is true (warn: OMG_STATE_DIR wins). */
    precedenceConflict: boolean;
}
export interface ConflictReport {
    hookConflicts: {
        event: string;
        command: string;
        isOmc: boolean;
    }[];
    claudeMdStatus: {
        hasMarkers: boolean;
        hasUserContent: boolean;
        path: string;
        companionFile?: string;
        files: ClaudeMdFileStatus[];
        dirtyFiles: string[];
        exactLegacyPaths: string[];
        manualReviewPaths: string[];
    } | null;
    legacySkills: {
        name: string;
        path: string;
    }[];
    envFlags: {
        disableOmc: boolean;
        skipHooks: string[];
    };
    configIssues: {
        unknownFields: string[];
    };
    windowsUnsafePluginHooks: {
        pluginRoot: string;
        event: string;
        command: string;
    }[];
    mcpRegistrySync: ReturnType<typeof inspectUnifiedMcpRegistrySync>;
    workspaceMarker: WorkspaceMarkerStatus;
    hasConflicts: boolean;
}
export interface ClaudeMdFileStatus {
    path: string;
    hasMarkers: boolean;
    hasUserContent: boolean;
    markerState: 'none' | 'complete' | 'corrupt' | 'symlink' | 'unreadable' | 'invalid-utf8';
    exactLegacy: boolean;
    manualReview: boolean;
}
/**
 * Check for hook conflicts in both profile-level (~/.grok/settings.json)
 * and project-level (./.claude/settings.json).
 *
 * Claude Code settings precedence: project > profile > defaults.
 * We check both levels so the diagnostic is complete.
 */
export declare function checkHookConflicts(): ConflictReport['hookConflicts'];
/**
 * Native Windows cannot execute plugin hooks that still route through sh/find-node.
 * Detect stale cache manifests so doctor can point users at setup/update repair
 * instead of reporting a generic hook conflict.
 */
export declare function checkWindowsUnsafePluginHooks(): ConflictReport['windowsUnsafePluginHooks'];
/** Analyze main and companion CLAUDE files without following symlinks. */
export declare function checkClaudeMdStatus(): ConflictReport['claudeMdStatus'];
/**
 * Check environment flags that affect OMG behavior
 */
export declare function checkEnvFlags(): ConflictReport['envFlags'];
/**
 * Check for legacy curl-installed skills that collide with plugin skill names.
 * Only flags skills whose names match actual installed plugin skills, avoiding
 * false positives for user's custom skills.
 */
export declare function checkLegacySkills(): ConflictReport['legacySkills'];
/**
 * Check for unknown fields in config files
 */
export declare function checkConfigIssues(): ConflictReport['configIssues'];
/**
 * Check for .omg-workspace marker presence and OMG_STATE_DIR precedence.
 *
 * Reports:
 *  - Whether a .omg-workspace marker was found (and where).
 *  - Whether OMG_STATE_DIR is set.
 *  - When both are set, emits a precedenceConflict flag (OMG_STATE_DIR wins per
 *    the resolution-order principle: OMG_STATE_DIR > .omg-workspace > git > cwd).
 */
export declare function checkWorkspaceMarker(): WorkspaceMarkerStatus;
/**
 * Run complete conflict check
 */
export declare function runConflictCheck(): ConflictReport;
/**
 * Format report for display
 */
export declare function formatReport(report: ConflictReport, json: boolean): string;
/**
 * Doctor conflicts command
 */
export declare function doctorConflictsCommand(options: {
    json?: boolean;
}): Promise<number>;
//# sourceMappingURL=doctor-conflicts.d.ts.map