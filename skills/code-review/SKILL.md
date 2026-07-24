---
name: code-review
description: >
  Comprehensive code review (correctness, API contracts, tests, maintainability).
  Use when the user says code review, review code, review this PR, or /code-review.
argument-hint: "[path, PR, or description of changes]"
---

# Code Review

Run a structured review using the **code-reviewer** agent protocol.

## Steps

1. Scope from arguments; default to current branch diff vs main/master when unspecified.
2. Prefer `spawn_subagent` with `subagent_type` `code-reviewer` (or `oh-my-grok:code-reviewer`), read-only; otherwise follow `agents/code-reviewer.md` inline.
3. Cover: correctness, edge cases, API/backward compatibility, tests, error handling, performance footguns, clarity.
4. Severity-tag findings; separate blockers from nits.
5. Optionally note when a separate `/security-review` is warranted (auth, crypto, multi-tenant, file/network IO).

## Do Not

- Rewrite large unrelated areas.
- Mark "LGTM" without reading the actual diff.

## Grok Capability Extensions

- Use `web_search` only for framework-specific footguns when uncertain.
- Optional artifact: `.omg/artifacts/code-review/{slug}.md`.
