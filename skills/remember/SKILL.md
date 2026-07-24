---
name: remember
description: Review reusable project knowledge and decide what belongs in project memory, notepad, or durable docs
---

# Remember

Use this skill when the user wants to preserve or organize useful knowledge discovered during a session.

## Goal
Promote durable, reusable knowledge into the right memory surface instead of leaving it buried in chat history.

## Memory surfaces
- **Project memory** — durable team/project knowledge
- **Notepad priority** — short high-signal context for the next turns
- **Notepad working** — temporary active-session notes
- **Docs / AGENTS / CLAUDE files** — durable instructions and conventions when they truly belong there

## Workflow
1. Gather the relevant session findings.
2. Classify each item:
   - durable project fact
   - temporary working note
   - operator preference or instruction
   - duplicate / stale / conflicting information
3. Propose the best destination for each item.
4. Write or update only the appropriate memory surface.
5. Call out duplicates or conflicts that should be cleaned up.

## Rules
- Do not dump everything into one store.
- Prefer project memory for durable team knowledge.
- Prefer notepad for short-lived working context.
- Keep entries concise and actionable.
- If something is uncertain, mark it as uncertain rather than storing it as fact.

## Output
- What was stored
- Where it was stored
- Any duplicates/conflicts found



## Grok Capability Extensions

- On build/test failures: use `web_search` / `web_fetch` for latest fixes and community issues before inventing workarounds.
- On UI work without a design: prefer the `/ui-mockup` skill (Image Gen → Vision analysis → code → Vision QA).
- For live docs/API research: use `/web-research` or call `web_search` directly.
- Prefer `spawn_subagent` with `isolation: "worktree"` for parallel executors when mutating code.
- Persist orchestration state under `.omg/` only (never `.omc/`).
- Use `ask_user_question` for structured one-at-a-time questions (not multi-question dumps).
