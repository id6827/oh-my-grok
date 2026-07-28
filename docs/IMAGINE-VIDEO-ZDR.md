# Imagine video & Zero Data Retention (ZDR)

**Audience:** agents and humans shipping `.mp4` into product trees (e.g. Next.js `public/videos/`).  
**Related:** Fabula handoff, `docs/design/imagine-video-zdr-host-contract.md`, Imagine skill Video section.

---

## Matrix

| Team mode | Image (`image_gen` / `image_edit`) | Video (`image_to_video` / `reference_to_video`) |
|-----------|-------------------------------------|--------------------------------------------------|
| **Non-ZDR** | Session path works | Usually works without extra sink (verify in env) |
| **ZDR** | Session path works | **Requires a byte sink** — API: `output.upload_url` |

If the host is **not yet updated**, agents **cannot** pass `upload_url` through the tool schema. Symptom:

```text
HTTP 400 … Zero Data Retention teams must provide output.upload_url for video generation.
```

Until host ships `output_path` (or `output_upload_url`), use a **local fallback** (e.g. ffmpeg from an Imagine still) for demos only — not productized Imagine-video.

---

## Required parameters (after host P0)

| Param | When |
|-------|------|
| `image` / `images` | Always (video is image-driven) |
| `output_path` | **ZDR product ships** — e.g. `public/videos/peak-demo.mp4` |
| `output_upload_url` | Advanced; caller-supplied presigned PUT |
| neither on ZDR | Host may write `.grok/sessions/<id>/videos/<n>.mp4` **or** return `zdr_video_requires_sink` |

---

## Agent flow (product repo)

```text
1. image_gen / image_edit → still (session path)
2. image_to_video(
     image: <abs still path>,
     prompt: "slow push-in, …",
     duration: 6,
     resolution_name: "720p",
     output_path: "public/videos/peak-demo.mp4"   // when host supports it
   )
3. Use returned absolute path in app (or public URL /videos/peak-demo.mp4)
```

**Do not invent** `output_path` if the tool schema rejects unknown fields — check tool schema first (Imagine skill: “Don't assume tool behavior”).

---

## Fail-fast error (host)

```json
{
  "code": "zdr_video_requires_sink",
  "error": "Zero Data Retention teams need output_path or output_upload_url for video generation.",
  "remediation": ["Pass output_path…", "See docs/IMAGINE-VIDEO-ZDR.md"]
}
```

---

## `omg doctor`

```bash
node bin/omg.js doctor
# … includes:
# == video_gen ==
# video_gen: unknown | zdr_requires_sink | ok
```

Override / signal:

| Env | Effect |
|-----|--------|
| `OMG_VIDEO_GEN_MODE=ok` | Force `ok` |
| `OMG_VIDEO_GEN_MODE=zdr_requires_sink` | Force ZDR sink mode |
| `OMG_VIDEO_GEN_MODE=unknown` | Force unknown |
| `GROK_ZDR=1` or `XAI_ZDR=1` | Treat as `zdr_requires_sink` when mode unset |

---

## Content studio / interactive fiction

Peaks and trailer clips should land under the app’s static tree (`public/videos/…`), not only a vendor CDN URL. Prefer `output_path` once the host supports it.
