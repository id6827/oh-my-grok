/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { spawnSync } from 'child_process';
const OMC_CLI_BINARY = 'omg';
const OMC_PLUGIN_BRIDGE_PREFIX = 'node "$GROK_PLUGIN_ROOT"/bridge/cli.cjs';
function commandExists(command, env) {
    const lookupCommand = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(lookupCommand, [command], {
        stdio: 'ignore',
        env,
    });
    return result.status === 0;
}
export function resolveOmcCliPrefix(options = {}) {
    const env = options.env ?? process.env;
    const omcAvailable = options.omcAvailable ?? commandExists(OMC_CLI_BINARY, env);
    if (omcAvailable) {
        return OMC_CLI_BINARY;
    }
    const pluginRoot = typeof env.GROK_PLUGIN_ROOT === 'string' ? env.GROK_PLUGIN_ROOT.trim() : '';
    if (pluginRoot) {
        return OMC_PLUGIN_BRIDGE_PREFIX;
    }
    return OMC_CLI_BINARY;
}
function resolveInvocationPrefix(commandSuffix, options = {}) {
    void commandSuffix;
    return resolveOmcCliPrefix(options);
}
export function formatOmcCliInvocation(commandSuffix, options = {}) {
    const suffix = commandSuffix.trim().replace(/^omg\s+/, '');
    return `${resolveInvocationPrefix(suffix, options)} ${suffix}`.trim();
}
export function rewriteOmcCliInvocations(text, options = {}) {
    if (!text.includes('omg ')) {
        return text;
    }
    return text
        .replace(/`omg ([^`\r\n]+)`/g, (_match, suffix) => {
        const prefix = resolveInvocationPrefix(suffix, options);
        return `\`${prefix} ${suffix}\``;
    })
        .replace(/(^|\n)([ \t>*-]*)omg ([^\n]+)/g, (_match, lineStart, leader, suffix) => {
        const prefix = resolveInvocationPrefix(suffix, options);
        return `${lineStart}${leader}${prefix} ${suffix}`;
    });
}
//# sourceMappingURL=omg-cli-rendering.js.map