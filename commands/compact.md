<!-- Ported from oh-my-claudecode (MIT) — see NOTICE. -->

---
description: "Prepare OMG context for a manual Grok Build /compact handoff."
argument-hint: "[optional compaction note]"
---

# OMG Manual Context Compaction Helper

This command intentionally uses the plugin-scoped name `/oh-my-grok:compact` instead of the bare `/compact` command. Bare `/compact` is reserved for Grok Build's native compaction command and must not be shadowed by OMG.

OMG cannot invoke Grok Build's built-in `/compact` from a plugin command: `/compact` is a native slash command, not a prompt skill, and a prompt-skill call for `compact` is not a supported handoff. This helper is instruction-only and must not claim that OMG triggers compaction itself.

## Dispatch

1. Treat this as a request to prepare for manual Grok Build conversation compaction. Do not create a separate OMG summarizer and do not replace existing auto-compress behavior.
2. Preserve any user note for the compaction request:

```text
$ARGUMENTS
```

3. Tell the user to run Grok Build's built-in bare `/compact` command directly. If the note above is non-empty, tell them to include it with `/compact`.
4. Before handing off, remind the user that Grok Build's normal `PreCompact` lifecycle should run OMG's existing pre-compact hooks (`pre-compact`, project memory, and wiki preservation) when the native compaction occurs.
5. Do not invoke a `compact` skill, do not attempt to call `/compact` on the user's behalf, and do not manually summarize the session.

## User-facing handoff

Use this wording, adapting only the note text:

```text
OMG prepared the compaction context, but plugin commands cannot trigger Grok Build's native /compact directly. Run this as a bare Grok Build command now:

/compact $ARGUMENTS

Bare /compact remains Grok Build's native command; OMG does not shadow or invoke it.
```
