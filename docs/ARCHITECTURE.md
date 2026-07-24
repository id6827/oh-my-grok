# Architecture

oh-my-grok enables Grok Build to orchestrate specialized agents through skills, agents, hooks, and file-based state.

```text
User prompt
    → Skills (slash / auto description match)
        → Agents (spawn_subagent)
            → Tools (search, edit, web, image, vision)
                → State (.omg/)
```

## Layers

1. **Skills** — user-invocable protocols (`skills/*/SKILL.md`)
2. **Agents** — role prompts (`agents/*.md`) for delegated work
3. **Hooks** — SessionStart prepares `.omg/`; more events planned
4. **State** — durable specs/plans under `.omg/`

## Core pipeline

```text
deep-interview → ralplan → autopilot
     specs/        plans/     code + QA + validation
```

## Grok extensions

- **web-research** skill — live documentation grounding
- **ui-mockup** skill + **visual-designer** agent — gen → vision → code → QA
- Prompt-level search-on-fail across execution skills

## Relationship to OMC

Behavioral contracts (ambiguity scoring, approval gates, phase machines) are preserved. Claude-specific runtime (Agent SDK, native teams, OpenClaw, full hook graph) is not required for Layer A operation. See PARITY-MATRIX.md.

## Packaging

Standard Grok plugin convention directories + root `plugin.json`. No npm runtime required for v0.1 prompt-only distribution.
