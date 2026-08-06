# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Multi-Agenten-Orchestrierung für [Grok Build](https://x.ai) / Grok CLI.**

Port von [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) auf Grok, mit nativen Erweiterungen: **Echtzeit-Web/X-Suche**, **Image-Gen-UI-Mockups**, **Vision-UI-QA**.

| | |
|--|--|
| **OMG-Version** | `0.9.0-rc.1` |
| **State-Root** | `.omg/` (nie `.omc/`) |
| **OMC-Pin** | `4.15.7` @ `41a4c0f` |
| **Produkt-Gates** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Parität** | **Near-complete** (kein 100%-Klon des Claude-Hosts) |

> Lerne nicht das Harness. Nutze OMG.

### Status (2026-07)

| Achse | Status |
|------|--------|
| Modul-Inventar | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Grok-Teilmenge | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | gleiches Protokoll wie OMC; Host-Tools für Grok umbenannt |

Optionale Checks: `npm run test:optional`.

---

## OMC-Quell-Pin (Upstream-Checkpoint)

OMG trackt einen **festen OMC-Commit** für spätere Re-Diffs. Details: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Feld | Wert |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Gepinnte Version** | **`4.15.7`** |
| **Gepinnter Commit** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Betreff** | `chore: promote dev to main for v4.15.7 release` |
| **Datum** | 2026-07-23 04:44:59 +0000 |
| **Kurzform** | `4.15.7` @ `41a4c0f` |

Bei bewusstem OMC-Upgrade:

1. Neuen Upstream-Tree auschecken/cachen.
2. `version` + HEAD in `docs/OMC-SOURCE.md` eintragen.
3. `port-inventory.mjs` neu laufen lassen und `docs/OMC-PORT-STATUS.md` aktualisieren.
4. OMG gegen den **alten Pin** (`41a4c0f…`) diffen, dann Pin vorrücken.

Lokaler Cache: `~/.grok/marketplace-cache/*` mit `oh-my-claude-sisyphus@4.15.7`.

---

## Installation

```bash
# GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# Local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Prüfen:

```bash
grok plugin details oh-my-grok
grok inspect
```

In einer Grok-Session:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/orchestration --strategy balanced "ship auth + dashboard polish with PRs"
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Empfohlene Pipeline

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  single-mission implement → QA → validate
   or
/orchestration   →  multi-stream worktrees → review gates → merge
```

Jederzeit `/cancel`. State unter **`.omg/`**. Vage Ideen → `/deep-interview`. Spec bereit → `/ralplan` und explizite Freigabe. Multi-Stream-Delivery mit isolierten Worktrees, kanonischen Issues und Review-Gates → `/orchestration`. UI ohne Design → `/ui-mockup`. Ökosystem-Unbekannte → `/web-research`.

---

## `/orchestration` (Multi-Worktree-Delivery)

**Der Lead implementiert nie Produktcode.** Er zerlegt die Mission, erzeugt Tracking-Artefakte, spawnt **Implementierungs-Worktrees**, **Review-Worktrees** und steuert den Merge. Keyword: `orchestration` / `orchestrate` / `오케스트레이션`.

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "high-risk migration"
```

| Flag | Bedeutung |
|------|---------|
| *(Standard)* | `--strategy conservative` (Sicherheit zuerst, 1–3 parallele Impl-Worker) |
| `--strategy balanced` | Moderater Parallel-Dispatch (Cap 4) |
| `--strategy aggressive` | Max. praktischer Dispatch (Cap 6); **gleiche Qualitätsgates** pro Stream, kein AC-Skip-Fast-Path |
| `--max-parallel N` | Nur finale **Obergrenze** der Concurrency: `min(strategy_cap, N, safety)` |
| `--interactive` | Große Parallel-Batches und Merges bestätigen |

**Sicherheit gewinnt immer** über Strategy (z. B. unbewiesene Worktree-Isolation → Concurrency 1).

### Worker-Pipeline (Plan → Goal → Execute)

Pro Implementierungs-Worktree:

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (/goal if host allows) → Acceptance Contract → orch AC gate
  → Implement → tests → exit report → PR (Fixes #N)
```

Danach validieren **Review-Worktrees** **Issue → executionGoal → AC → Impl → PR → Tests**. Merge nur nach Review **APPROVE** + menschlicher Bestätigung.

### Rollen & Source of Truth

| Artefakt | Rolle |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | Runtime-State (status, locks, progress) |
| **Canonical Issue** (GitHub oder Board-Spiegel) | Menschlicher Vertrag (scope, priority, ownership); **Orchestrator erstellt** vor Spawn |
| **Board** (`board.md`) | Nur Dashboard-Ansicht |

Worker dürfen nur **Acceptance / notes / risks / verification** der Issue aktualisieren — nicht scope, priority, ownership oder dependencies. Impl-Worker erfassen beim Start einen **Issue Snapshot**; Scope-Änderungen im Flug brauchen Orchestrator-Freigabe.

### Adaptive Worker-Modelle

- **Lead-Session:** stärkstes Host-Modell (globale Urteilskraft).
- **Worker:** klassifizieren Task **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` (heute oft alle auf `grok-4.5`, bis der Host mehr Slugs bietet).
- Worker **dürfen** Modelle nicht selbst upgraden; sie fordern **complexity escalation**, der Orchestrator respawnt.
- Komplexität steuert auch **Review-Tiefe** und soft **Retry-Budgets**.

State: `.omg/orchestration/` (Haupt-Checkout, Lead-Eigentum) + Layer-B `.omg/state/orchestration-state.json`. Vollständiges Protokoll: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).

---

## Autopilot-Ausführung: `solo` vs `team`

`/autopilot` orchestriert immer **Agents + Skills**. Nur die **Implementierungsphase** hängt von der Config ab.

| Modus | Config | Wie es läuft | Was du siehst |
|------|--------|---------------|--------------|
| **`solo`** (Standard) | omit / `"solo"` | In-Session `spawn_subagent` + Skills | Gleicher Grok-Chat; **kein tmux** |
| **`team`** | `"execution": "team"` | `omg team` CLI-Worker | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### Konfigurieren (Projekt oder User)

**Projekt**: `.grok/omg.jsonc` · **User**: `~/.config/grok-omg/config.jsonc` · Projekt gewinnt.

```jsonc
// .grok/omg.jsonc — solo
{
  "autopilot": { "execution": "solo" }
}
```

```jsonc
// .grok/omg.jsonc — team + tmux
{
  "autopilot": {
    "execution": "team",
    "team": { "agentTypes": ["grok"] }
  }
}
```

### Team-Worker beobachten (`execution: "team"`)

Die Grok-Chat-UI öffnet **keine** OMC-Seitenpanels. Prozessteams laufen über **tmux**.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Manuelles Team ohne volles Autopilot:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| **solo** bevorzugen wenn… | **team** bevorzugen wenn… |
|----------------------|------------------------|
| Alltägliches Coding in einem Grok-Fenster | Sichtbare CLI-Worker in **tmux** |
| Kein tmux nötig | **cursor / codex / gemini** mischen |
| Schnelles Feedback im selben Transcript | Lange parallele Implementierer isoliert |

**Standardempfehlung: **solo**, außer du lebst in tmux oder brauchst Multi-CLI.**

---

## Was du bekommst

| Oberfläche | Anz. | Notizen |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 46+ | omc→omg + `ui-mockup` + `web-research` + `orchestration` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Grok-Exklusiv

- **`/orchestration`** — Multi-Worktree-Delivery: Plan→Goal→AC→Execute, Review-Gates, Strategies, adaptive Modelle
- **`/web-research`** — Live-Docs → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → Freigabe → Vision → Code → Vision QA
- **Search-on-fail** — `web_search` vor blinden Retries

### Review-Modi

- **`/security-review`**
- **`/code-review`**

### Kern-Skills

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Standard-Server-ID **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 Tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Ohne Bridge: `dist/mcp/standalone-server.js`. Thin: `mcp/omg-state-server.mjs`.

### Lokales CLI

```bash
node bin/omg.js version
node bin/omg.js status
node bin/omg.js hud --preset focused
node bin/omg.js state list
node bin/omg.js doctor
node bin/omg.js team status
npm test
npm run test:vitest:core
npm run test:optional
```

---

## Projektlayout

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Entwicklung

```bash
npm run build
npm run build:bridge
npm run test:vitest:core
npm run test:smoke
npm run test:optional
npm run mcp:probe
node scripts/validate-parity.mjs
node scripts/port-inventory.mjs
node bin/omg.js doctor
grok plugin validate .
```

Re-Port-Helfer nach OMC-Cache-Refresh:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Qualitätsleiste:** core + smoke + MCP. **Full residual: 0 fail**. Siehe `docs/GROK-PRODUCT-SUBSET.md`.

### Dokumenten-Karte

| Dok | Zweck |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Upstream-Pin |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | Status pro Oberfläche |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Grok-„done“-Definition |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Erster Start |
| [docs/settings-schema.md](docs/settings-schema.md) | Config-Keys |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Layer-Checkliste |
| [parity-review/](parity-review/) | Evidenznotizen |

---

## Lizenz

MIT. Original-Copyright oh-my-claudecode und oh-my-grok-Beiträger. Siehe [LICENSE](LICENSE) und [NOTICE](NOTICE).

## Credits

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — Orchestrierungsdesign, Agents, Skills, Protokolle
- xAI Grok Build — Plugin / Skills / Hooks / MCP-Host
