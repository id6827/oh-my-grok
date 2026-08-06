# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Orquestación multiagente para [Grok Build](https://x.ai) / Grok CLI.**

Puerto de [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) a Grok, con mejoras nativas: **búsqueda web/X en tiempo real**, **mockups Image Gen** y **Vision UI QA**.

| | |
|--|--|
| **Versión OMG** | `0.9.0-rc.1` |
| **Raíz de estado** | `.omg/` (nunca `.omc/`) |
| **Pin OMC** | `4.15.7` @ `41a4c0f` |
| **Puertas de producto** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Paridad** | **Near-complete** (no es un clon 100% del host Claude) |

> No aprendas el arnés. Usa OMG.

### Estado (2026-07)

| Eje | Estado |
|------|--------|
| Inventario de módulos | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Subconjunto Grok | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | mismo protocolo que OMC; herramientas renombradas para Grok |

Comprobaciones opcionales: `npm run test:optional`.

---

## Pin de fuente OMC (punto de control)

OMG sigue un **commit OMC fijado** para re-diff futuros. Detalle: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Campo | Valor |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Versión fijada** | **`4.15.7`** |
| **Commit fijado** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Asunto** | `chore: promote dev to main for v4.15.7 release` |
| **Fecha** | 2026-07-23 04:44:59 +0000 |
| **Forma corta** | `4.15.7` @ `41a4c0f` |

Al actualizar OMC a propósito:

1. Obtén/cachea el árbol upstream nuevo.
2. Registra `version` + `git rev-parse HEAD` en `docs/OMC-SOURCE.md`.
3. Vuelve a ejecutar `port-inventory.mjs` y actualiza `docs/OMC-PORT-STATUS.md`.
4. Diff OMG respecto al **pin anterior** (`41a4c0f…`), luego avanza el pin.

Caché local: `~/.grok/marketplace-cache/*` con `oh-my-claude-sisyphus@4.15.7`.

---

## Instalación

```bash
# GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# Local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Verificar:

```bash
grok plugin details oh-my-grok
grok inspect
```

En una sesión Grok:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/orchestration --strategy balanced "ship auth + dashboard polish with PRs"
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Pipeline recomendado

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  single-mission implement → QA → validate
   or
/orchestration   →  multi-stream worktrees → review gates → merge
```

Cancela con `/cancel`. Estado en **`.omg/`**. Ideas vagas → `/deep-interview`. Spec lista → `/ralplan` y aprobación explícita. Entrega multi-stream con worktrees aislados, issues canónicos y puertas de review → `/orchestration`. UI sin diseño → `/ui-mockup`. Incógnitas → `/web-research`.

---

## `/orchestration` (entrega multi-worktree)

**El lead nunca implementa código de producto.** Solo descompone la misión, crea artefactos de seguimiento, lanza **worktrees de implementación**, **worktrees de review** y gobierna el merge. Keyword: `orchestration` / `orchestrate` / `오케스트레이션`.

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "high-risk migration"
```

| Flag | Significado |
|------|---------|
| *(por defecto)* | `--strategy conservative` (seguridad primero, 1–3 impl workers concurrentes) |
| `--strategy balanced` | Despacho paralelo moderado (tope 4) |
| `--strategy aggressive` | Máximo despacho práctico (tope 6); **mismas puertas de calidad** por stream, no un atajo sin AC |
| `--max-parallel N` | Solo **límite superior** final de concurrencia: `min(strategy_cap, N, safety)` |
| `--interactive` | Confirmar lotes paralelos grandes y merges |

**La seguridad siempre gana** sobre la strategy (p. ej. aislamiento de worktree no probado → concurrencia 1).

### Pipeline del worker (Plan → Goal → Execute)

Por worktree de implementación:

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (/goal if host allows) → Acceptance Contract → orch AC gate
  → Implement → tests → exit report → PR (Fixes #N)
```

Luego **worktrees de review** validan **Issue → executionGoal → AC → Impl → PR → Tests**. Merge solo tras review **APPROVE** + confirmación humana.

### Roles y fuente de verdad

| Artefacto | Rol |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | Estado runtime (status, locks, progress) |
| **Canonical Issue** (GitHub o espejo board) | Contrato humano (scope, priority, ownership); **el orquestador lo crea** antes del spawn |
| **Board** (`board.md`) | Solo vista de dashboard |

Los workers solo pueden actualizar **Acceptance / notes / risks / verification** del issue — no scope, priority, ownership ni dependencies. Los impl workers capturan un **Issue Snapshot** al inicio; cambios de scope en vuelo requieren aprobación del orquestador.

### Modelos adaptativos del worker

- **Sesión lead:** modelo host más fuerte (juicio global).
- **Workers:** clasifican la tarea **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` (hoy a menudo todos mapean a `grok-4.5` hasta que el host ofrezca más slugs).
- Los workers **no** se auto-upgraden de modelo; piden **complexity escalation** y el orquestador respawnea.
- La complejidad también impulsa la **profundidad de review** y presupuestos blandos de **reintentos**.

Estado: `.omg/orchestration/` (checkout principal, propiedad del lead) + Layer-B `.omg/state/orchestration-state.json`. Protocolo completo: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).

---

## Ejecución Autopilot: `solo` vs `team`

`/autopilot` siempre orquesta **agents + skills**. Solo cambia la **fase de implementación**.

| Modo | Config | Cómo corre | Qué ves |
|------|--------|---------------|--------------|
| **`solo`** (por defecto) | omit / `"solo"` | `spawn_subagent` en sesión + skills | Mismo chat Grok; **sin tmux** |
| **`team`** | `"execution": "team"` | workers `omg team` CLI | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### Configurar (proyecto o usuario)

**Proyecto**: `.grok/omg.jsonc` · **Usuario**: `~/.config/grok-omg/config.jsonc` · gana el proyecto. Esquema: `docs/settings-schema.md`.

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

### Observar workers (`execution: "team"`)

La UI de Grok **no** abre paneles laterales estilo OMC. Los equipos de proceso usan **tmux**.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Equipo manual sin autopilot completo:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| Prefiere **solo** si… | Prefiere **team** si… |
|----------------------|------------------------|
| Coding diario en una ventana Grok | Workers CLI visibles en **tmux** |
| Sin instalar tmux | Mezclar **cursor / codex / gemini** |
| Feedback rápido en el mismo transcript | Implementadores largos aislados |

**Recomendación por defecto: **solo**, salvo que ya uses tmux o necesites multi-CLI.**

---

## Qué obtienes

| Superficie | Cant. | Notas |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 46+ | omc→omg + `ui-mockup` + `web-research` + `orchestration` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Exclusivos Grok

- **`/orchestration`** — entrega multi-worktree: Plan→Goal→AC→Execute, puertas de review, strategies, modelos adaptativos
- **`/web-research`** — docs en vivo, releases, issues, X → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → aprobación → Vision → código → Vision QA
- **Search-on-fail** — preferir `web_search` antes de reintentos ciegos

### Modos de review

- **`/security-review`**
- **`/code-review`**

### Skills principales

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Id de servidor por defecto **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Sin bridge: `dist/mcp/standalone-server.js`. Thin: `mcp/omg-state-server.mjs`.

### CLI local

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

## Layout del proyecto

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Desarrollo

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

Helpers de re-port tras refrescar la caché OMC:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Barra de calidad:** core vitest + smoke + MCP. **Residual full suite: 0 fail** (2026-07). **“Done” en Grok:** `docs/GROK-PRODUCT-SUBSET.md`.

### Mapa de docs

| Doc | Propósito |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Pin upstream |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | Estado por superficie |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Definición “done” Grok |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Primer arranque |
| [docs/settings-schema.md](docs/settings-schema.md) | Claves de config |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Checklist de capas |
| [parity-review/](parity-review/) | Notas de evidencia |

---

## Licencia

MIT. Copyright original de oh-my-claudecode y contribuidores de oh-my-grok. Ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

## Créditos

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — diseño de orquestación, agents, skills, protocolos
- xAI Grok Build — plugin / skills / hooks / host MCP
