---
name: insane-search
description: >
  Read a public URL when normal web_fetch / open_page is blocked or thin.
  Grok-adapted Phase 0–1 public-endpoint fallback inspired by fivetaku/insane-search
  (MIT). Use for /insane-search, blocked pages, 403/timeout on a known URL, platform
  public APIs (HN, Reddit RSS, Bluesky, arXiv, etc.). NOT a replacement for
  /web-research topic briefs. Does NOT install curl_cffi, Playwright, or yt-dlp.
  Korean: 사이트 차단, 페이지 안 열림, URL 403, 레딧 안 읽혀, 아카이브로 읽어.
argument-hint: "<URL or blocked page + optional goal>"
---

# Insane Search (OMG / Grok)

**Read one public URL that the normal host fetch cannot.**  
Not: “research a topic.” That is **`/web-research`**.

Inspired by [fivetaku/insane-search](https://github.com/fivetaku/insane-search) (MIT).  
This skill is a **Grok-native Phase 0–1 playbook**, not a full port of their Python engine.

## Why this is not a full upstream port

| Full upstream (Claude plugin) | This OMG skill |
|-------------------------------|----------------|
| `python3 -m engine` + Phase 0→3 | Host tools only: `web_fetch`, `open_page`, `web_search`, X tools |
| `curl_cffi` TLS impersonation | **Not included** (ToS / dual-use / heavy deps) |
| Playwright / real Chrome grid | **Not included** (host MCP may exist separately; do not auto-install) |
| yt-dlp auto media stack | **Not included** (optional later skill if needed) |
| Claude WebFetch / AskUserQuestion / star setup | Grok tools + `ask_user_question`; no star nag |
| Goal: maximize “open any public page” | Goal: **unblock public URL** inside OMG without owning a stealth fetch product |

**Full port is discouraged because:**

1. **Different product axis** — OMG is multi-agent orchestration + Grok tools, not a WAF-bypass product.  
2. **Maintenance** — WAF profiles, browser grids, and auto-pip installs rot weekly.  
3. **Legal / ToS** — TLS fingerprint spoofing and bot-manager evasion sit in dual-use territory; we stay on **public endpoints and honest fetch**.  
4. **Overlap** — Grok already has strong `web_search`, `web_fetch`/`open_page`, and **native X tools** (often better than X syndication hacks).  
5. **Failure modes** — Shipping a full engine couples every research session to Python/browser install failures.

So we **borrow the idea** (escalate only when blocked; prefer official public APIs) and **reject** cloning the whole stack.

## Use When

- User invokes **`/insane-search`** with a **URL** (or “this link won’t open”).  
- `web_fetch` / `open_page` returned **403/402/timeout/empty challenge HTML**.  
- Platform has a **known public API** (see Phase 0 table) and normal HTML fetch is useless.  
- You need **page text / OGP / JSON**, not a multi-source research brief.

## Do Not Use When

- User wants “latest React 19 breaking changes” with no URL → **`/web-research`**.  
- Answer is only in this repo → explore / grep.  
- Site needs **login, paywall, or CAPTCHA** → stop; say auth required (no credential bypass).  
- User forbids network tools.  
- Simple search would suffice without a stuck URL.

## Relationship to `/web-research`

```text
/web-research          →  topic → search + synthesize → .omg/artifacts/research/
/insane-search <url>   →  one URL → public-path read → short extract
```

If research hits a blocked primary URL:

1. Note the failure in the brief.  
2. Run **`/insane-search`** (or this skill’s steps) on that URL only.  
3. Fold the extract back into the research verdict.

Do **not** replace the whole research skill with this one.

## Execution Policy

- **Public content only.** No login, no cookie jar, no password fields.  
- Prefer **official public APIs / syndication** over scraping HTML.  
- Prefer **primary sources** when rewriting URLs (official, then archive.org).  
- Bound work: default **≤6** host fetches unless user expands.  
- Write optional artifact under `.omg/artifacts/insane-search/` when useful.  
- Never invent page content; if all paths fail, report paths tried.

## Steps

### 0. Classify

- Extract **URL(s)** and user goal (full text / title only / API JSON / captions — captions may be **unsupported** here).  
- If no URL and only a topic → redirect to `/web-research`.  
- Detect domain → check Phase 0 table.

### 1. Phase 0 — Platform public endpoints (try first)

| Platform | Prefer |
|----------|--------|
| **X / Twitter** | Grok **`x_keyword_search` / `x_semantic_search` / `x_thread_fetch`** (native). Do not invent private API tokens. |
| **Reddit** | `https://www.reddit.com{path}.rss` or `…/.json` (public) |
| **Hacker News** | Firebase / HN API (`https://hacker-news.firebaseio.com/v0/…`) |
| **Bluesky** | Public AT Protocol endpoints when applicable |
| **arXiv** | `export.arxiv.org` / abs API |
| **Stack Overflow / SE** | Public API or question URL via fetch |
| **GitHub** | Prefer raw / API (`api.github.com`) over scrape |
| **YouTube** | Title/description via `web_search` or oEmbed if available; **full captions via yt-dlp are out of scope** for this skill |
| **Naver / KR blogs** | Try mobile URL or public RSS if known; else Phase 1 |

Use `web_fetch` / `open_page` on these **transformed** URLs, not the blocked HTML shell.

### 2. Phase 1 — Lightweight public probes

Try in order (stop on usable text ≥ ~200 chars or structured JSON):

1. Same URL with `web_fetch` / `open_page` again (transient errors).  
2. `web_search` with `site:domain` + distinctive title snippet.  
3. Archive: `https://web.archive.org/web/{url}` (if policy allows).  
4. Textize / reader-style public proxies **only if** user allows third-party readers (e.g. Jina-style `https://r.jina.ai/http://…`) — **optional**, mention third party.  
5. Mobile host variants (`m.`, `?mobile=1`) when safe and public.  
6. OGP-only: if HTML is thin, extract `og:title` / `og:description` from whatever HTML you got and say so.

### 3. Phase 2–3 (explicitly NOT automated here)

| Upstream does | We do |
|---------------|--------|
| `curl_cffi` profile grid | **Skip** — do not run or pip-install stealth fetchers |
| Playwright / Chrome MCP full grid | **Only if** user already has browser MCP and explicitly wants it; one navigate + snapshot, then stop. No auto-install. |

If Phase 0–1 fail and user needs more: report **honest failure** + suggest (a) open in browser, (b) paste text, (c) wait for host `web_fetch` improvement, (d) optional external Claude plugin for full insane-search.

### 4. Deliver

Short response:

```markdown
# Insane-search: {url}

- Status: ok | partial | failed
- Paths tried: …
- Extract: (key text / JSON summary)
- Artifact: .omg/artifacts/insane-search/{slug}.md  (if written)
- Next: /web-research | stop (auth) | manual browser
```

## Tool Usage

**Prefer**

- `web_fetch`, `open_page`, `web_search`  
- `x_*` for X/Twitter  
- file write under `.omg/artifacts/insane-search/`  

**Avoid**

- Undocumented raw HTTP clients for bot evasion  
- Installing `curl_cffi`, Playwright, yt-dlp as part of this skill  
- Logging into sites  

## Integration

- **web-research**: on blocked primary URL → invoke this skill for that URL only.  
- **external-context**: same escalation when a doc URL 403s.  
- **autopilot / ralph**: do not call on every failure; only when a **specific URL** is required and fetch failed.

## Escalation And Stop Conditions

- **auth_required / paywall / CAPTCHA** → stop; no bypass.  
- **All Phase 0–1 exhausted** → fail with paths tried; do not claim “insane-search always works”.  
- **Topic research without URL** → hand off to `/web-research`.

## Final Checklist

- [ ] URL (or clear “topic → use web-research”) classified  
- [ ] Phase 0 public API checked for known platforms  
- [ ] Phase 1 probes tried before giving up  
- [ ] No stealth-tool install performed  
- [ ] Auth/paywall not bypassed  
- [ ] User got status + extract or honest failure  

## Attribution

Approach inspired by [fivetaku/insane-search](https://github.com/fivetaku/insane-search) (MIT © 2026 fivetaku).  
OMG implementation is original Grok playbook text; it does not vendor their `engine/` Python package.

## Grok Capability Extensions

- Prefer Grok **native X tools** over third-party X HTML scrapes.  
- Prefer `web_search` when the “blocked page” is actually a discoverability problem (wrong URL).  
- Persist extracts under `.omg/` only.
