# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Orquestração multiagente para [Grok Build](https://x.ai) / Grok CLI.**

Port de [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) para Grok, com upgrades nativos: **busca web/X em tempo real**, **mockups Image Gen** e **Vision UI QA**.

| | |
|--|--|
| **Versão OMG** | `0.9.0-rc.1` |
| **Raiz de estado** | `.omg/` (nunca `.omc/`) |
| **Pin OMC** | `4.15.7` @ `41a4c0f` |
| **Gates de produto** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Paridade** | **Near-complete** (não é clone 100% do host Claude) |

> Não aprenda o harness. Use o OMG.

### Status (2026-07)

| Eixo | Status |
|------|--------|
| Inventário de módulos | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Subconjunto Grok | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | mesmo protocolo do OMC; ferramentas renomeadas para Grok |

Checks opcionais: `npm run test:optional`.

---

## Pin de origem OMC

OMG rastreia um **commit OMC fixo** para re-diffs. Detalhe: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Campo | Valor |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Versão fixa** | **`4.15.7`** |
| **Commit fixo** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Assunto** | `chore: promote dev to main for v4.15.7 release` |
| **Data** | 2026-07-23 04:44:59 +0000 |
| **Forma curta** | `4.15.7` @ `41a4c0f` |

Ao atualizar o OMC de propósito:

1. Faça checkout/cache da árvore upstream nova.
2. Registre `version` + HEAD em `docs/OMC-SOURCE.md`.
3. Rode `port-inventory.mjs` e atualize `docs/OMC-PORT-STATUS.md`.
4. Diff o OMG em relação ao **pin anterior** (`41a4c0f…`) e avance o pin.

Cache local: `~/.grok/marketplace-cache/*` com `oh-my-claude-sisyphus@4.15.7`.

---

## Instalação

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

Em uma sessão Grok:

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

Cancele com `/cancel`. Estado em **`.omg/`**. Ideias vagas → `/deep-interview`. Spec pronta → `/ralplan` e aprovação explícita. Entrega multi-stream com worktrees isolados, issues canônicas e gates de review → `/orchestration`. UI sem design → `/ui-mockup`. Incógnitas do ecossistema → `/web-research`.

---

## `/orchestration` (Protocol v1.3 — entrega multi-worktree)

### Nested model (Protocol v1.3)

> Protocol defines execution semantics; Runtime Policy binds them to the host.

**Binding:** Protocol v1.3 · Policy **A′** (root materializes / sole Worker spawner) · Team = **recipe** (not a runtime type) · Hierarchical Execution Graph (containment + `dependsOn`).

```text
Root Coordinator → Coordinator (e.g. backend recipe) → Workers
omit kind ⇒ agent; ownership global; planning hierarchical
```

Full protocol: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).


**O lead nunca implementa código de produto.** Só decompõe a missão, cria artefatos de rastreio, lança **worktrees de implementação**, **worktrees de review** e governa o merge. Keyword: `orchestration` / `orchestrate` / `오케스트레이션`.

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "high-risk migration"
```

| Flag | Significado |
|------|---------|
| *(padrão)* | `--strategy conservative` (segurança primeiro, 1–3 impl workers concorrentes) |
| `--strategy balanced` | Despacho paralelo moderado (teto 4) |
| `--strategy aggressive` | Máximo despacho prático (teto 6); **mesmos gates de qualidade** por stream, não atalho sem AC |
| `--max-depth N` | Nesting depth ceiling (default 2) |
| `--max-parallel N` | Apenas **limite superior** final de concorrência: `min(strategy_cap, N, safety)` |
| `--interactive` | Confirmar lotes paralelos grandes e merges |

**A segurança sempre vence** a strategy (ex.: isolamento de worktree não provado → concorrência 1).

### Pipeline do worker (Plan → Goal → Execute)

Por worktree de implementação:

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (/goal if host allows) → Acceptance Contract → orch AC gate
  → Implement → tests → exit report → PR (Fixes #N)
```

Depois **worktrees de review** validam **Issue → executionGoal → AC → Impl → PR → Tests**. Merge só após review **APPROVE** + confirmação humana.

### Papéis e fonte da verdade

| Artefato | Papel |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | Estado runtime (status, locks, progress) |
| **Canonical Issue** (GitHub ou espelho board) | Contrato humano (scope, priority, ownership); **o orquestrador cria** antes do spawn |
| **Board** (`board.md`) | Apenas visão de dashboard |

Workers só podem atualizar **Acceptance / notes / risks / verification** da issue — não scope, priority, ownership ou dependencies. Impl workers capturam um **Issue Snapshot** no início; mudanças de scope em voo exigem aprovação do orquestrador.

### Modelos adaptativos do worker

- **Sessão lead:** modelo host mais forte (julgamento global).
- **Workers:** classificam a tarefa **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` (hoje muitos mapeiam para `grok-4.5` até o host oferecer mais slugs).
- Workers **não** fazem auto-upgrade de modelo; pedem **complexity escalation** e o orquestrador respawna.
- A complexidade também dirige a **profundidade de review** e orçamentos soft de **retry**.

Estado: `.omg/orchestration/` (checkout principal, propriedade do lead) + Layer-B `.omg/state/orchestration-state.json`. Protocolo completo: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).

---

## Execução Autopilot: `solo` vs `team`

`/autopilot` sempre orquestra **agents + skills**. Só muda a **fase de implementação**.

| Modo | Config | Como roda | O que você vê |
|------|--------|---------------|--------------|
| **`solo`** (padrão) | omit / `"solo"` | `spawn_subagent` na sessão + skills | Mesmo chat Grok; **sem tmux** |
| **`team`** | `"execution": "team"` | workers `omg team` CLI | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### Configurar (projeto ou usuário)

**Projeto**: `.grok/omg.jsonc` · **Usuário**: `~/.config/grok-omg/config.jsonc` · projeto vence.

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

A UI do Grok **não** abre painéis laterais estilo OMC. Times de processo usam **tmux**.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Time manual sem autopilot completo:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| Prefira **solo** se… | Prefira **team** se… |
|----------------------|------------------------|
| Coding diário em uma janela Grok | Workers CLI visíveis no **tmux** |
| Sem instalar tmux | Misturar **cursor / codex / gemini** |
| Feedback rápido no mesmo transcript | Implementadores longos isolados |

**Recomendação padrão: **solo**, a menos que já use tmux ou precise de multi-CLI.**

---

## O que você ganha

| Superfície | Qtd | Notas |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 46+ | omc→omg + `ui-mockup` + `web-research` + `orchestration` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Exclusivos Grok

- **`/orchestration`** — Protocol v1.3 Hierarchical Execution Graph: Coordinator|Worker, recipes, Runtime Policy A′, nested scopes
- **`/web-research`** — docs ao vivo → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → aprovação → Vision → código → Vision QA
- **Search-on-fail** — preferir `web_search` antes de retries cegos

### Modos de review

- **`/security-review`**
- **`/code-review`**

### Skills principais

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Id padrão **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Sem bridge: `dist/mcp/standalone-server.js`. Thin: `mcp/omg-state-server.mjs`.

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

## Layout do projeto

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Desenvolvimento

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

Helpers de re-port após atualizar o cache OMC:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Barra de qualidade:** core + smoke + MCP. **Residual full: 0 fail**. Ver `docs/GROK-PRODUCT-SUBSET.md`.

### Mapa de docs

| Doc | Propósito |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Pin upstream |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | Status por superfície |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Definição “done” Grok |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Primeira execução |
| [docs/settings-schema.md](docs/settings-schema.md) | Chaves de config |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Checklist de camadas |
| [parity-review/](parity-review/) | Notas de evidência |

---

## Licença

MIT. Copyright original oh-my-claudecode e contribuidores oh-my-grok. Ver [LICENSE](LICENSE) e [NOTICE](NOTICE).

## Créditos

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — design de orquestração, agents, skills, protocolos
- xAI Grok Build — plugin / skills / hooks / host MCP
