---
name: ui-mockup
description: >
  Generate a UI mockup with Grok Image Gen, analyze it with Vision, implement
  frontend code, and run Vision QA against screenshots. Use when the user asks
  for /ui-mockup, a design mockup, visual draft, or "design then build this UI".
argument-hint: "<UI description, e.g. dark settings page with profile card>"
disable-model-invocation: false
---

# UI Mockup (Grok-exclusive)

End-to-end design → code → visual verification using Grok Image Gen and Vision.

## Purpose

Turn a natural-language UI request into (1) an approved visual mockup, (2) a structured design brief, (3) working frontend code, and (4) Vision QA feedback loops until the UI is close to the mockup.

## Use When

- User invokes `/ui-mockup` or asks to mock up / design a screen before coding.
- No existing Figma/design asset; need a generated baseline.
- Frontend work where visual fidelity matters.

## Do Not Use When

- User already has a final design file and only wants implementation (use executor + visual-designer Vision QA only).
- Task is pure backend/API with no UI.
- User wants text-only architecture discussion (use `/ralplan` or architect agent).

## Execution Policy

- Generate **one** primary mockup first; do not spam multiple variants unless the user asks.
- **Never** implement code before the user approves the mockup (or explicitly says "skip approval, implement").
- Prefer the project's existing frontend stack; default to **React + Tailwind CSS** when greenfield.
- Cap Vision QA fix cycles at **3** unless the user raises the limit.
- Persist artifacts under `.omg/artifacts/ui-mockup/{slug}/`.

## Steps

### Phase 1 — Image generation

1. Parse the UI description from arguments and any project branding constraints (colors, fonts in repo).
2. Call **image generation** (`image_gen`) with a detailed prompt covering:
   - layout regions, hierarchy, density
   - color mode (light/dark), accent color
   - key components (nav, forms, tables, CTAs)
   - desktop vs mobile if specified (default desktop 16:9)
3. Show the generated image path to the user.
4. Save metadata: `.omg/artifacts/ui-mockup/{slug}/mockup-meta.md` (prompt, path, timestamp).

### Phase 2 — Approval gate

Use `ask_user_question`:

**Question:** "Approve this mockup for implementation?"

Options:

1. **Approve** (Recommended) — proceed to analysis + code
2. **Revise** — user describes changes; regenerate with `image_edit` or new `image_gen`
3. **Cancel** — stop without code changes

### Phase 3 — Visual analysis

1. Spawn or role-play **visual-designer**: `read_file` on the mockup image.
2. Produce Visual Brief (layout, palette, type, components, states).
3. Write brief to `.omg/artifacts/ui-mockup/{slug}/visual-brief.md`.

### Phase 4 — Implementation

1. Detect stack (package.json, existing components).
2. Delegate to **executor** (`spawn_subagent` subagent_type `executor` or implement carefully if solo):
   - Match Visual Brief tokens
   - Accessible focus states and semantic HTML
   - Reuse existing design system if present
3. Prefer isolated `isolation: "worktree"` for large greenfield UIs.

### Phase 5 — Vision QA

1. Obtain an implementation screenshot:
   - Prefer user-provided screenshot path, or
   - Project's existing capture script if documented, or
   - Ask user to capture and attach/path the screenshot
2. `read_file` both mockup and screenshot.
3. List severity-tagged deltas; fix **blocker** and **major** issues.
4. Repeat up to 3 cycles.
5. Write report: `.omg/artifacts/ui-mockup/{slug}/vision-qa.md`.

### Phase 6 — Handoff

Summarize for the user:

- Mockup path
- Files created/modified
- Residual minor visual diffs
- Suggested next steps (responsive pass, dark mode, a11y audit)

## Tool Usage

- `image_gen` / `image_edit` for mockups
- `read_file` on images for Vision
- `ask_user_question` for approval
- `spawn_subagent` for visual-designer / executor
- `web_search` only if stack docs are needed
- State/artifacts only under `.omg/`

## Escalation And Stop Conditions

- Stop if user cancels at approval.
- Stop after 3 Vision QA cycles with residual issues reported.
- If Image Gen fails, fall back to a textual wireframe + component inventory and ask whether to continue without a bitmap mockup.

## Final Checklist

- [ ] Mockup generated and path shown
- [ ] User approval (or explicit skip)
- [ ] Visual Brief written under `.omg/artifacts/ui-mockup/`
- [ ] Frontend code matches stack conventions
- [ ] Vision QA report written (or skipped with reason)
- [ ] Summary delivered to user

## Grok Capability Extensions

- This skill is Grok-native (Image Gen + Vision); there is no OMC equivalent.
- Combine with `/web-research` when implementing against a third-party component library's latest API.
