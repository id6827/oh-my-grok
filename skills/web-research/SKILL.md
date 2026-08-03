---
name: web-research
description: >
  Real-time technical research with Grok web/X search. Use for /web-research,
  latest API docs, breaking changes, GitHub issues, migration guides, and
  community failure modes before implementing.
argument-hint: "<topic, library, error message, or migration question>"
---

# Web Research (Grok-exclusive)

Produce a citable, decision-ready research brief using live web and X sources.

## Purpose

Before coding against a moving ecosystem (frameworks, cloud APIs, CLIs), gather **current** facts: versions, breaking changes, official docs, and real-world issues. Write a durable artifact under `.omg/artifacts/research/`.

## Use When

- User invokes `/web-research` or asks "what's the latest…", "breaking changes", "is X deprecated".
- Build errors that look ecosystem-wide (not local typos).
- deep-interview / planning needs Real-time Tech Spec verification.
- Autopilot QA hits an error that may already have a known fix upstream.

## Do Not Use When

- Question is answerable solely from this repo's code (use explore agent / grep).
- User forbids network tools or session has web search disabled.
- Pure opinion/architecture taste with no factual dependency.

## Execution Policy

- Prefer **primary sources**: official docs, release notes, RFCs, GitHub releases.
- Cross-check at least **two** independent sources for version/breaking-change claims when possible.
- Distinguish **fact** vs **inference**; date-stamp the brief.
- Do not paste giant doc dumps — synthesize with links/citations.
- Keep research bounded: default max ~8 web fetches unless user expands scope.

## Steps

### 1. Frame the question

- Restate the research question in one sentence.
- Extract entities: library names, versions, error strings, platforms.
- Define success: what decision this brief must unlock.

### 2. Search

1. `web_search` with precise queries (library + version + "breaking changes" / error snippet).
2. Open top official hits with `web_fetch` / `open_page`.
3. Optionally `x_keyword_search` / `x_semantic_search` for recent community reports (filter noise).
4. Prefer sources from the last 12–18 months unless historical context is required.

### 3. Synthesize

Write `.omg/artifacts/research/{slug}.md`:

```markdown
# Research: {title}

- Date: {ISO date}
- Question: ...
- Verdict: {1–3 sentence answer}

## Current versions / status
| Package | Version / status | Source |

## Breaking changes & gotchas
- ...

## Recommended approach for this repo
- ...

## Sources
1. [title](url) — note
2. ...

## Open questions
- ...
```

### 4. Deliver

- Give the user the Verdict first, then path to the full brief.
- If findings change implementation plan, call out the delta explicitly.
- Offer handoff: `/ralplan`, `/autopilot`, or direct executor fix.

## Tool Usage

- `web_search`, `web_fetch`, `open_page`
- `x_keyword_search`, `x_semantic_search`, `x_thread_fetch` when social signal matters
- `grep` / `read_file` to ground recommendations in **this** repo
- Write artifact with file tools under `.omg/artifacts/research/` only

## Integration

- **deep-interview**: when user names a framework, run a short research pass and inject version/gotcha notes into the next question or final spec Technical Context.
- **autopilot / ralph**: on repeated build failures, invoke this skill before the 3rd blind retry.
- **ui-mockup**: research component library APIs when implementing generated designs.

## Escalation And Stop Conditions

- Stop if tools are disabled; report offline limitation.
- Stop if sources conflict irreconcilably — present both sides and recommend a verification experiment.
- Never invent version numbers; if unknown, say so.
- **Blocked primary URL (403/timeout/challenge HTML):** do not invent content. Escalate that URL only via **`/insane-search`** (Phase 0–1 public-path read). Do not pull the full research brief into stealth-fetch tooling.

## Final Checklist

- [ ] Question restated
- [ ] Primary sources consulted
- [ ] Verdict is decision-ready
- [ ] Artifact written under `.omg/artifacts/research/`
- [ ] Sources listed with URLs

## Grok Capability Extensions

- Real-time web + X search is a Grok differentiator vs OMC's more limited doc scan.
- Always cite; do not present stale training knowledge as live truth when tools are available.
