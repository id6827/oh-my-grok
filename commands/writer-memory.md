<!-- Ported from oh-my-claudecode (MIT) — see NOTICE. -->

---
description: ""
---

# OMG writer-memory

This compatibility command keeps `/oh-my-grok:writer-memory` available without loading the full `writer-memory` skill description in every Grok Build session.

## Dispatch

1. Read the full bundled skill instructions from the active OMG plugin/install: `skills/writer-memory/SKILL.md`.
2. Follow that SKILL.md exactly, treating the user's arguments as:

```text
$ARGUMENTS
```

If the file is not directly readable from the current working directory, locate it under the active `GROK_PLUGIN_ROOT`/`OMC_PLUGIN_ROOT`, package root, or installed OMG plugin directory, then continue.
