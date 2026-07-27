# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Orchestrazione multi-agent per [Grok Build](https://x.ai) / Grok CLI.**

Port di [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) su Grok, con upgrade nativi: **ricerca web/X real-time**, **mockup Image Gen**, **Vision UI QA**.

| | |
|--|--|
| **Versione OMG** | `0.9.0-rc.1` |
| **Root di stato** | `.omg/` (mai `.omc/`) |
| **Pin OMC** | `4.15.7` @ `41a4c0f` |
| **Gate di prodotto** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Parità** | **Near-complete** (non un clone 100% dell’host Claude) |

> Non imparare l’harness. Usa OMG.

### Stato (2026-07)

| Asse | Stato |
|------|--------|
| Inventario moduli | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Sottoinsieme Grok | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | stesso protocollo OMC; tool rinominati per Grok |

Check opzionali: `npm run test:optional`.

---

## Pin sorgente OMC

OMG traccia un **commit OMC fissato** per i re-diff. Dettaglio: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Campo | Valore |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Versione pin** | **`4.15.7`** |
| **Commit pin** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Oggetto** | `chore: promote dev to main for v4.15.7 release` |
| **Data** | 2026-07-23 04:44:59 +0000 |
| **Forma breve** | `4.15.7` @ `41a4c0f` |

Quando aggiorni OMC di proposito:

1. Checkout/cache del nuovo tree upstream.
2. Registra `version` + HEAD in `docs/OMC-SOURCE.md`.
3. Rilancia `port-inventory.mjs` e aggiorna `docs/OMC-PORT-STATUS.md`.
4. Diff OMG rispetto al **pin precedente** (`41a4c0f…`), poi avanza il pin.

Cache locale: `~/.grok/marketplace-cache/*` con `oh-my-claude-sisyphus@4.15.7`.

---

## Installazione

```bash
# GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# Local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Verifica:

```bash
grok plugin details oh-my-grok
grok inspect
```

In una sessione Grok:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Pipeline consigliata

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  implement → QA → multi-agent validation
```

Annulla con `/cancel`. Stato in **`.omg/`**. Idee vaghe → `/deep-interview`. Spec pronta → `/ralplan` e approvazione esplicita.

---

## Esecuzione Autopilot: `solo` vs `team`

`/autopilot` orchestra sempre **agents + skills**. Cambia solo la **fase di implementazione**.

| Modalità | Config | Come gira | Cosa vedi |
|------|--------|---------------|--------------|
| **`solo`** (default) | omit / `"solo"` | `spawn_subagent` in sessione + skills | Stesso chat Grok; **niente tmux** |
| **`team`** | `"execution": "team"` | worker CLI `omg team` | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### Configurare (progetto o utente)

**Progetto**: `.grok/omg.jsonc` · **Utente**: `~/.config/grok-omg/config.jsonc` · vince il progetto.

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

### Osservare i worker (`execution: "team"`)

L’UI Grok **non** apre pannelli laterali stile OMC. I team di processo usano **tmux**.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Team manuale senza autopilot completo:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| Preferisci **solo** se… | Preferisci **team** se… |
|----------------------|------------------------|
| Coding quotidiano in una finestra Grok | Worker CLI visibili in **tmux** |
| Senza installare tmux | Mescolare **cursor / codex / gemini** |
| Feedback rapido nello stesso transcript | Implementatori lunghi isolati |

**Raccomandazione default: **solo**, a meno che non usi già tmux o multi-CLI.**

---

## Cosa ottieni

| Superficie | N. | Note |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 45 | omc→omg + `ui-mockup` + `web-research` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Esclusivi Grok

- **`/web-research`** — docs live → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → approvazione → Vision → codice → Vision QA
- **Search-on-fail** — preferire `web_search` prima di retry ciechi

### Modalità review

- **`/security-review`**
- **`/code-review`**

### Skills principali

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Id server default **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Senza bridge: `dist/mcp/standalone-server.js`. Thin: `mcp/omg-state-server.mjs`.

### CLI locale

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

## Layout del progetto

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Sviluppo

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

Helper re-port dopo refresh della cache OMC:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Barra qualità:** core + smoke + MCP. **Residual full: 0 fail**. Vedi `docs/GROK-PRODUCT-SUBSET.md`.

### Mappa docs

| Doc | Scopo |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Pin upstream |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | Stato per superficie |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Definizione “done” Grok |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Primo avvio |
| [docs/settings-schema.md](docs/settings-schema.md) | Chiavi config |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Checklist layer |
| [parity-review/](parity-review/) | Note di evidenza |

---

## Licenza

MIT. Copyright originale oh-my-claudecode e contributor oh-my-grok. Vedi [LICENSE](LICENSE) e [NOTICE](NOTICE).

## Crediti

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — design di orchestrazione, agents, skills, protocolli
- xAI Grok Build — plugin / skills / hooks / host MCP
