/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
export type TaskTool = 'builtin' | 'beads' | 'beads-rust';

export interface BeadsContextConfig {
  taskTool: TaskTool;
  injectInstructions: boolean;
  useMcp: boolean;
}
