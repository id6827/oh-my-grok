# H1 host contract: ZDR Imagine-video tools

**Date:** 2026-07-29  
**Ralph story:** US-002  
**Status:** implementation-ready specification for **Grok Build host**  
**Note:** This is **not** implemented inside `oh-my-grok` (no video tool runtime in-repo). Platform must ship runtime + schema.

---

## Goal

Make `image_to_video` and `reference_to_video` succeed for **Zero Data Retention (ZDR)** teams by providing a **client-owned byte sink**, and return an **absolute filesystem path** (same convention as `image_gen`).

---

## Tool input schema (agent-facing)

### `image_to_video`

```ts
{
  image: string;                 // required: path | HTTPS URL | data:image/...
  prompt?: string;
  duration?: 6 | 10;             // default 6
  resolution_name?: "480p" | "720p";
  /** Workspace-relative or absolute under workspace; host materializes .mp4 here */
  output_path?: string;
  /** Advanced: pre-signed PUT URL; pass-through to API output.upload_url */
  output_upload_url?: string;
}
```

### `reference_to_video`

```ts
{
  prompt: string;
  images: string[];              // 2–7 refs
  aspect_ratio: string;
  duration?: 6 | 10;
  resolution_name?: "480p" | "720p";
  output_path?: string;
  output_upload_url?: string;
}
```

**Rules**

| Condition | Behavior |
|-----------|----------|
| Non-ZDR | Existing behavior; `output_*` optional |
| ZDR + `output_path` | Host materialize (algorithm below) |
| ZDR + `output_upload_url` only | Call API with that URL; if API does not return bytes, host must still obtain file via documented download **or** require both URL + path |
| ZDR + neither | Prefer session default **or** fail-fast `zdr_video_requires_sink` (see Phase 0 ADR: soft session default recommended) |
| Path escapes workspace | **Reject** before API |

**Allowed roots for relative `output_path`:** workspace root, including `public/`, `.omg/assets/`, `.grok/sessions/<id>/videos/`. Reject `..` segments after normalize.

---

## Host algorithm (`output_path` under ZDR)

1. `resolve(workspace, output_path)`; ensure `realpath` stays inside workspace.  
2. `mkdir -p` parent directory.  
3. Create ephemeral presigned PUT URL **or** use host-side streaming if API supports writing through the host.  
4. Call vendor video API with `output.upload_url` when required.  
5. If object landed only in cloud: download to `output_path`.  
6. Verify file exists and size > 0 (optional: `ffprobe` duration).  
7. Return:

```ts
{
  path: string;          // absolute filesystem path
  duration_sec: number;
  width?: number;
  height?: number;
  poster_path?: string;  // optional frame 0
}
```

---

## Structured fail-fast error

When ZDR and no usable sink (if hard-fail mode):

```json
{
  "code": "zdr_video_requires_sink",
  "error": "Zero Data Retention teams need output_path or output_upload_url for video generation.",
  "remediation": [
    "Pass output_path (e.g. public/videos/peak-demo.mp4)",
    "Or pass output_upload_url from a presign helper",
    "See docs/IMAGINE-VIDEO-ZDR.md and Imagine skill § Video (ZDR)"
  ]
}
```

Do **not** call the vendor API only to surface the raw 400 string.

---

## Non-ZDR regression

- Calls without `output_path` / `output_upload_url` must keep working.  
- Test matrix: non-ZDR smoke + ZDR with path + ZDR without path (default or fail).

---

## Security

- Path traversal blocked.  
- No write outside workspace.  
- Max path length e.g. 4096; max video size per platform policy.  
- Presign TTL short-lived.

---

## Session default (Option C)

If product chooses soft default when ZDR and no path:

```text
$GROK_SESSION_DIR/videos/<n>.mp4
# e.g. .grok/sessions/<sessionId>/videos/1.mp4
```

Mirror of session `images/` layout. Return absolute path.

---

## Tracker issue (copy-paste)

```markdown
### Title
ZDR teams cannot use image_to_video: tool lacks output.upload_url / local materialize path

### Summary
image_to_video returns 400 "Zero Data Retention teams must provide output.upload_url"
but the Grok Build tool schema does not accept upload_url or output_path. Agents cannot
land .mp4 assets for product repos (e.g. Fabula public/videos). image_gen still works.

### Ask
- Host-managed output_path (or session videos/ mirror of images/)
- OR expose output_upload_url + presign helper
- Fail-fast structured error + Imagine skill ZDR docs
- omg doctor video readiness flag

### Spec
See oh-my-grok `docs/design/imagine-video-zdr-host-contract.md`

### Repro
image_gen → image_to_video(path) → 400 invalid-argument output.upload_url
```

---

## Acceptance (host PR)

- [ ] ZDR + `output_path` → playable `.mp4` on disk  
- [ ] Tool result includes absolute `path`  
- [ ] Missing sink → structured error **or** session default (documented)  
- [ ] Non-ZDR regression green  
- [ ] `reference_to_video` same sink rules  

---

## Out of scope for oh-my-grok repo

Runtime implementation of Imagine-video tools. This document is the contract for the host team.
