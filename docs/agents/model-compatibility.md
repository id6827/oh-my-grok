<!-- Ported from oh-my-claudecode docs (MIT) — see NOTICE. Adapted for oh-my-grok / Grok Build. -->

# Model × Agent Compatibility Matrix

## Grok Build (this host) — start here

**Grok Build currently exposes one coding model: `grok-4.5`.** That is the default for every OMG agent and every complexity tier (LOW / MEDIUM / HIGH).

Do **not** treat Claude Sonnet / Opus / Haiku as host model IDs on Grok Build. Those names are **legacy tier aliases** only: the adapter maps `haiku`→LOW, `sonnet`→MEDIUM, `opus`→HIGH, and each tier resolves to `grok-4.5` unless overridden.

| Complexity tier | Default host slug | Legacy aliases |
|-----------------|-------------------|----------------|
| LOW | `grok-4.5` | `haiku`, `low` |
| MEDIUM | `grok-4.5` | `sonnet`, `medium` |
| HIGH | `grok-4.5` | `opus`, `high` |

### How to override when more slugs exist

Environment (also accepts `OMC_MODEL_*` aliases):

- `OMG_MODEL_LOW`
- `OMG_MODEL_MEDIUM`
- `OMG_MODEL_HIGH`

Config (project or user):

- Project: `.grok/omg.jsonc`
- User: `~/.config/grok-omg/config.jsonc`

```jsonc
{
  "routing": {
    "enabled": true,
    "defaultTier": "MEDIUM",
    "tierModels": {
      "LOW": "grok-4.5",
      "MEDIUM": "grok-4.5",
      "HIGH": "grok-4.5"
    }
  }
}
```

Set a value to `inherit` to force parent-session model inheritance. Adapter source: `src/adapters/grok/models.ts`.

### Agent pairing on Grok Build

Pick agents by **role and complexity**, not by shopping multi-provider model SKUs:

| Intent | Prefer agents | Tier |
|--------|---------------|------|
| Quick lookup / docs | `explore`, `writer` | LOW |
| Implementation / debug / tests | `executor`, `debugger`, `test-engineer` | MEDIUM |
| Architecture / plan / review | `architect`, `planner`, `code-reviewer`, `critic` | HIGH |

Spawn with omit/`inherit`/`grok-4.5`; complexity is carried by agent choice (`executor-low` vs `executor` vs `executor-high`).

---

## Multi-provider usage matrix (non–Grok Build hosts)

The sections below are a **usage matrix for multi-provider / multi-model hosts** (and OMC-era folklore about named agents). They are **not** Grok Build host routing. On Grok Build, ignore Claude/GPT/DeepSeek SKUs as defaults and use the section above.

This is a **usage matrix, not a benchmark report**. Numbers and per-task scores are deliberately out of scope.

### Recommendation matrix

| Agent | Role | Recommended (premium) | Recommended (cost-effective) | Avoid | Notes |
|---|---|---|---|---|---|
| Prometheus | Planning | Claude Opus 4.8, GPT-5.5 high | Sonnet 4.6 | — | Heavy reasoning; runs 1–2x per session |
| Hyperplan | Planning | Claude Opus 4.8, GPT-5.5 high | Sonnet 4.6 | — | Same as Prometheus |
| Sisyphus | Implementation | Sonnet 4.6 | DeepSeek V4 Pro, Kimi K2.5 | — | Token-heavy; cost matters most here |
| Hephaestus | Implementation | Sonnet 4.6, Kimi K2.5 | DeepSeek V4 Pro | **GPT-\* (tool-calling/format breakage)** | Tuned for non-GPT |
| Oracle | Review | Claude Opus 4.8, GPT-5.5 high | Sonnet 4.6 | — | Quality > cost; called sparingly |
| Aletheia | Review | Sonnet 4.6 | DeepSeek V4 Pro | — | |
| Hermes | Coordination | Sonnet 4.6 | DeepSeek V4 Flash | — | Coordinator only, not direct executor |

### Design rules

These four rules drive every recommendation above for multi-model hosts. If you only remember one thing, remember rule 3.

1. **Planning/Review = expensive; Implementation = cheap.**
   Token weight typically differs 5–20× between a single Prometheus/Oracle pass
   and a full Sisyphus implementation loop. Spend on the rare, decisive calls;
   economize on the high-volume ones.
2. **Hephaestus should not be paired with GPT-family models.**
   Tool-calling and structured-output formats break. Use Sonnet 4.6 / Kimi K2.5
   for premium and DeepSeek V4 Pro for cost-effective.
3. **Sisyphus is the highest-value cost lever.**
   Because Sisyphus dominates total tokens in any non-trivial session, swapping
   its implementation model typically moves total spend more than any other
   single change. Tune this slot first.
4. **DeepSeek V4 Pro/Flash is a first-class budget option on multi-provider hosts.**
   Treat V4 Pro as the default cost-effective choice for execution agents
   and V4 Flash as the default coordinator model where those providers exist.

### Starter presets (multi-provider only)

Pick the preset that matches your budget posture **only when the host actually exposes these model IDs**. On Grok Build, use `grok-4.5` / tier overrides instead.

#### Premium (max quality)

```yaml
agents:
  Prometheus:  { model: claude-opus-4-8 }
  Hyperplan:   { model: claude-opus-4-8 }
  Sisyphus:    { model: claude-sonnet-4-6 }
  Hephaestus:  { model: claude-sonnet-4-6 }   # never GPT-*
  Oracle:      { model: claude-opus-4-8 }
  Aletheia:    { model: claude-sonnet-4-6 }
  Hermes:      { model: claude-sonnet-4-6 }
```

#### Balanced (default on multi-provider hosts)

```yaml
agents:
  Prometheus:  { model: claude-sonnet-4-6 }
  Hyperplan:   { model: claude-sonnet-4-6 }
  Sisyphus:    { model: deepseek-v4-pro }
  Hephaestus:  { model: kimi-k2-5 }            # never GPT-*
  Oracle:      { model: claude-sonnet-4-6 }
  Aletheia:    { model: deepseek-v4-pro }
  Hermes:      { model: deepseek-v4-flash }
```

#### Budget (cost-first)

```yaml
agents:
  Prometheus:  { model: claude-sonnet-4-6 }
  Hyperplan:   { model: claude-sonnet-4-6 }
  Sisyphus:    { model: deepseek-v4-pro }
  Hephaestus:  { model: deepseek-v4-pro }      # never GPT-*
  Oracle:      { model: claude-sonnet-4-6 }
  Aletheia:    { model: deepseek-v4-pro }
  Hermes:      { model: deepseek-v4-flash }
```

### Out of scope

- Provider routing internals (tracked elsewhere).
- Benchmarks — this page is a usage matrix, not a benchmark report.
- Hermes deep-coordination patterns.
- Inventing Grok mini/3 slugs before the host exposes them.
