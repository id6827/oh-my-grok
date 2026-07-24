/**
 * Team orchestration: parse CLI specs, plan tmux sessions, dry-run without tmux.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { atomicWriteJsonSync as atomicWriteJson } from "../lib/atomic-write.js";
const AGENT_BINS = {
    codex: ["codex"],
    gemini: ["gemini"],
    claude: ["claude"],
    cursor: ["cursor-agent", "cursor"],
    grok: ["grok"],
    executor: ["grok"],
    antigravity: ["agy", "antigravity"],
};
/** Parse `2:codex` or `3:executor` */
export function parseAgentSpec(spec) {
    const m = String(spec).trim().match(/^(\d+)\s*:\s*([a-zA-Z0-9_-]+)$/);
    if (!m)
        throw new Error(`Invalid agent spec "${spec}". Use N:agent e.g. 2:codex`);
    const count = Math.max(1, Math.min(16, parseInt(m[1], 10)));
    const agent = m[2].toLowerCase();
    if (!AGENT_BINS[agent]) {
        throw new Error(`Unknown agent "${agent}". Supported: ${Object.keys(AGENT_BINS).join(", ")}`);
    }
    return { count, agent };
}
export function hasTmux() {
    const r = spawnSync("tmux", ["-V"], { encoding: "utf8" });
    return r.status === 0;
}
export function resolveAgentBin(agent) {
    for (const bin of AGENT_BINS[agent]) {
        const r = spawnSync("which", [bin], { encoding: "utf8" });
        if (r.status === 0 && r.stdout.trim())
            return r.stdout.trim();
    }
    return null;
}
export function teamStatePath(ws) {
    return join(ws, ".omg", "state", "team-state.json");
}
export function bridgeDir(ws, name) {
    return join(ws, ".omg", "state", "team-bridge", name);
}
export function planTeam(ws, spec, name, opts) {
    const dry = opts?.dryRun === true || !hasTmux() || process.env.OMG_TEAM_DRY_RUN === "1";
    const teamName = name ||
        `omg-team-${spec.agent}-${Date.now().toString(36).slice(-6)}`;
    const session = `omg-${teamName}`.replace(/[^a-zA-Z0-9_-]/g, "-");
    const bin = resolveAgentBin(spec.agent);
    const workers = Array.from({ length: spec.count }, (_, i) => ({
        id: `worker-${i + 1}`,
        status: "planned",
        heartbeat: join(bridgeDir(ws, teamName), `worker-${i + 1}.heartbeat.json`),
    }));
    if (!bin && !dry) {
        throw new Error(`CLI for agent "${spec.agent}" not found on PATH. Install it or use --dry-run.`);
    }
    const state = {
        active: true,
        name: teamName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        agent: spec.agent,
        count: spec.count,
        task: spec.task,
        tmux_session: session,
        dry_run: dry,
        workers,
    };
    mkdirSync(bridgeDir(ws, teamName), { recursive: true });
    atomicWriteJson(teamStatePath(ws), state);
    // write plan artifact
    const planPath = join(bridgeDir(ws, teamName), "plan.json");
    atomicWriteJson(planPath, {
        ...state,
        agent_bin: bin,
        tmux_available: hasTmux(),
        create_cmds: dry
            ? [`# dry-run: would create tmux session ${session}`]
            : [
                `tmux new-session -d -s ${session} -n worker-1`,
                ...workers.slice(1).map((w, i) => `tmux new-window -t ${session} -n ${w.id}`),
            ],
    });
    if (!dry && hasTmux()) {
        // create session
        spawnSync("tmux", ["new-session", "-d", "-s", session, "-n", "worker-1"], {
            encoding: "utf8",
        });
        for (let i = 1; i < workers.length; i++) {
            spawnSync("tmux", ["new-window", "-t", session, "-n", workers[i].id], { encoding: "utf8" });
        }
        // send a placeholder command into first pane (task text)
        const safeTask = spec.task.replace(/'/g, "'\\''");
        const cmd = bin === "grok"
            ? `echo 'OMG team task: ${safeTask}' && ${bin} -p '${safeTask}' || true`
            : `echo 'OMG team task for ${spec.agent}: ${safeTask}'`;
        spawnSync("tmux", ["send-keys", "-t", `${session}:0`, cmd, "Enter"], {
            encoding: "utf8",
        });
        state.workers = state.workers.map((w) => ({ ...w, status: "running" }));
        state.updated_at = new Date().toISOString();
        atomicWriteJson(teamStatePath(ws), state);
    }
    return state;
}
export function readTeamState(ws) {
    const p = teamStatePath(ws);
    if (!existsSync(p))
        return null;
    try {
        return JSON.parse(readFileSync(p, "utf8"));
    }
    catch {
        return null;
    }
}
export function shutdownTeam(ws, name) {
    const state = readTeamState(ws);
    if (!state)
        return null;
    if (name && state.name !== name) {
        throw new Error(`Active team is "${state.name}", not "${name}"`);
    }
    if (!state.dry_run && hasTmux()) {
        spawnSync("tmux", ["kill-session", "-t", state.tmux_session], {
            encoding: "utf8",
        });
    }
    state.active = false;
    state.updated_at = new Date().toISOString();
    state.workers = state.workers.map((w) => ({ ...w, status: "done" }));
    atomicWriteJson(teamStatePath(ws), state);
    return state;
}
//# sourceMappingURL=plan.js.map