# Phase 0 findings: Imagine-video under ZDR

**Date:** 2026-07-29  
**Source handoff:** Fabula `.omg/handoffs/HANDOFF-omg-imagine-video-zdr.md`  
**Ralph story:** US-001  
**Status:** complete (research; no host code in oh-my-grok)

---

## Ownership split

| Layer | Owner | In this repo? |
|-------|--------|----------------|
| `image_to_video` / `reference_to_video` tool runtime + schema | **Grok Build host / platform** | **No** |
| Imagine skill Video docs | Bundled skill `~/.grok/bundled/skills/imagine/` (+ OMG mirror docs) | Partial (docs copy in repo) |
| `omg doctor` video readiness | **oh-my-grok** | **Yes** |
| Fabula viewer / ffmpeg workaround | Fabula app | No (consumer) |

---

## Reproduction (recorded)

1. ZDR-enabled Grok Build team (Fabula session).  
2. `image_gen` → session still path works.  
3. `image_to_video(image=<abs path>, prompt=…, duration=6, resolution_name=720p)`.  
4. **HTTP 400**:

```json
{
  "code": "invalid-argument",
  "error": "Zero Data Retention teams must provide output.upload_url for video generation."
}
```

5. Agent tool schema (as of 2026-07): `image`, `prompt`, `duration`, `resolution_name` only — **no** `output.upload_url` / `output_path`.

---

## Answers to handoff §10

### Q1. Is ZDR detection available to the agent runtime today (`team.flags.zdr`)?

| Finding | Evidence |
|---------|----------|
| **Not exposed to OMG agent/process env in a discoverable way** | `env` in this workspace: no `ZDR`, `ZERO_DATA_RETENTION`, or `team.flags.zdr` variable. Repo grep: no ZDR flags in oh-my-grok runtime. |
| **API behavior implies ZDR is enforced server-side** | 400 text names “Zero Data Retention teams”. |
| **Agent-facing detection: unknown / not documented** | Imagine skill does not document a flag. |

**Conclusion:** Treat agent-visible ZDR as **`unknown`** unless platform documents a field. OMG doctor should allow override via env (`GROK_ZDR=1`, `OMG_VIDEO_GEN_MODE=…`) until host exposes a stable signal.

### Q2. Internal presign helper for video?

| Finding | Evidence |
|---------|----------|
| **Not wired into Grok Build agent tools** | Tool schema has no upload URL param; no OMG CLI presign command. |
| **May exist server-side (unknown)** | API requires `output.upload_url` — implies *someone* must create a PUT target. Not available to agents. |

**Conclusion:** Agents cannot complete the ZDR path without host materialize **or** a documented presign surface. Prefer host-managed `output_path` (plan Option A).

### Q3. Preferred sink: session folder vs project-relative `output_path`?

| Choice | Recommendation |
|--------|----------------|
| **Product repos (Fabula `public/videos/`)** | **`output_path` required** (workspace-relative, host materializes). |
| **Interactive demos / no path** | **Session default** `.grok/sessions/<id>/videos/<n>.mp4` (Option C) **or** structured fail-fast — product call. |
| **This Phase 0 ADR pick** | **Primary: `output_path`**. Soft default to session `videos/` when ZDR and path omitted (better first-run than opaque 400). Document that shipping into `public/` always passes `output_path`. |

### Q4. Timeline for P0?

| Finding | Evidence |
|---------|----------|
| **Not known from repo** | No platform roadmap in oh-my-grok. |
| **Fabula status** | ffmpeg workaround shipped; blocked on platform. |

**Conclusion:** Timeline is **external**. OMG can ship doctor + docs immediately; host PR is the critical path.

---

## Tool surface inventory (agent)

| Tool | Known inputs (agent) | ZDR gap |
|------|----------------------|---------|
| `image_gen` | `prompt`, `aspect_ratio` | Works; returns session path |
| `image_edit` | `prompt`, `image`, `aspect_ratio` | Works |
| `image_to_video` | `image`, `prompt`, `duration`, `resolution_name` | Missing sink |
| `reference_to_video` | `prompt`, `images`, `aspect_ratio`, `duration`, `resolution_name` | Same |

---

## Exit criteria (Phase 0)

- [x] Answers Q1–Q4 with evidence or explicit unknown  
- [x] Ownership split recorded  
- [x] Repro + 400 body recorded  
- [x] Preferred sink ADR pick documented  

**Next:** H1 host contract (`docs/design/imagine-video-zdr-host-contract.md`).
