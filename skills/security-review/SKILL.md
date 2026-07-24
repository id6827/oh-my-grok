---
name: security-review
description: >
  Focused security review of changes or a target area (OWASP, secrets, authz,
  injection, data exposure). Use when the user says security review, review
  security, 보안 리뷰, or /security-review.
argument-hint: "[path or description of what to review]"
---

# Security Review

Run a read-only security pass using the **security-reviewer** agent protocol.

## Steps

1. Determine scope from arguments and git diff (`git diff` / `git status`) when no path is given.
2. Prefer `spawn_subagent` with `subagent_type` `security-reviewer` (or `oh-my-grok:security-reviewer`) and `capability_mode: "read-only"` when available; otherwise follow `agents/security-reviewer.md` inline.
3. Require findings with: file:line, category, severity (HIGH/MEDIUM/LOW), exploitability note, and remediation sketch.
4. Always scan for secrets (keys, tokens, passwords) and flag dependency audit commands to run (`npm audit`, etc.) if a package ecosystem is present.
5. End with a prioritized risk summary and pass/fail recommendation for merge.

## Do Not

- Implement fixes unless the user explicitly asks after the review.
- Skip auth, input validation, or trust-boundary checks on touched surfaces.

## Grok Capability Extensions

- Use `web_search` for CVE/advisory lookup on named dependencies when versions look risky.
- Persist optional report under `.omg/artifacts/security-review/{slug}.md` when the review is non-trivial.
