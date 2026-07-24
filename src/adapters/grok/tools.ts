/**
 * Claude Code tool names → Grok Build tool names (prompt / enforcer mapping).
 */
export const TOOL_MAP: Record<string, string> = {
  AskUserQuestion: "ask_user_question",
  TodoWrite: "todo_write",
  WebSearch: "web_search",
  WebFetch: "web_fetch",
  NotebookRead: "read_file",
  MultiEdit: "search_replace",
  Read: "read_file",
  Write: "search_replace",
  Edit: "search_replace",
  Grep: "grep",
  Glob: "list_dir",
  Bash: "run_terminal_command",
  Task: "spawn_subagent",
  Skill: "skill",
};

export function mapToolName(name: string): string {
  return TOOL_MAP[name] ?? name;
}
