# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Мультиагентная оркестрация для [Grok Build](https://x.ai) / Grok CLI.**

Порт [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) на Grok с нативными расширениями: **realtime web/X search**, **Image Gen UI mockups**, **Vision UI QA**.

| | |
|--|--|
| **Версия OMG** | `0.9.0-rc.1` |
| **Корень состояния** | `.omg/` (не `.omc/`) |
| **Пин OMC** | `4.15.7` @ `41a4c0f` |
| **Продуктовые гейты** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Паритет** | **Near-complete** (не 100% клон хоста Claude) |

> Не учите harness. Просто используйте OMG.

### Статус (2026-07)

| Ось | Статус |
|------|--------|
| Инвентарь модулей | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Подмножество Grok | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | тот же протокол, что у OMC; инструменты переименованы под Grok |

Опциональные проверки: `npm run test:optional`.

---

## Пин исходников OMC

OMG отслеживает **зафиксированный commit OMC** для re-diff. Подробности: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Поле | Значение |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Версия пина** | **`4.15.7`** |
| **Commit пина** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Тема** | `chore: promote dev to main for v4.15.7 release` |
| **Дата** | 2026-07-23 04:44:59 +0000 |
| **Кратко** | `4.15.7` @ `41a4c0f` |

При намеренном обновлении OMC:

1. Checkout/cache нового upstream-дерева.
2. Записать `version` + HEAD в `docs/OMC-SOURCE.md`.
3. Перезапустить `port-inventory.mjs` и обновить `docs/OMC-PORT-STATUS.md`.
4. Diff OMG относительно **старого пина** (`41a4c0f…`), затем сдвинуть пин.

Локальный cache: `~/.grok/marketplace-cache/*` с `oh-my-claude-sisyphus@4.15.7`.

---

## Установка

```bash
# GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# Local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Проверка:

```bash
grok plugin details oh-my-grok
grok inspect
```

В сессии Grok:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/orchestration --strategy balanced "ship auth + dashboard polish with PRs"
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Рекомендуемый pipeline

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  single-mission implement → QA → validate
   or
/orchestration   →  multi-stream worktrees → review gates → merge
```

Отмена: `/cancel`. Состояние в **`.omg/`**. Смутные идеи → `/deep-interview`. Спека готова → `/ralplan` и явное одобрение. Multi-stream доставка с изолированными worktree, каноническими issue и review-гейтами → `/orchestration`. UI без дизайна → `/ui-mockup`. Неизвестности экосистемы → `/web-research`.

---

## `/orchestration` (Protocol v1.3 — multi-worktree доставка)

### Nested model (Protocol v1.3)

> Protocol defines execution semantics; Runtime Policy binds them to the host.

**Binding:** Protocol v1.3 · Policy **A′** (root materializes / sole Worker spawner) · Team = **recipe** (not a runtime type) · Hierarchical Execution Graph (containment + `dependsOn`).

```text
Root Coordinator → Coordinator (e.g. backend recipe) → Workers
omit kind ⇒ agent; ownership global; planning hierarchical
```

Full protocol: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).


**Lead никогда не пишет продуктовый код.** Он декомпозирует миссию, создаёт артефакты трекинга, спавнит **implementation worktree**, **review worktree** и контролирует merge. Ключевые слова: `orchestration` / `orchestrate` / `오케스트레이션`.

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "high-risk migration"
```

| Флаг | Смысл |
|------|---------|
| *(по умолчанию)* | `--strategy conservative` (безопасность, 1–3 concurrent impl worker) |
| `--strategy balanced` | Умеренный параллельный dispatch (cap 4) |
| `--strategy aggressive` | Максимальный практичный dispatch (cap 6); **те же quality gates** на поток, не skip-AC fast path |
| `--max-depth N` | Nesting depth ceiling (default 2) |
| `--max-parallel N` | Только финальный **верхний предел** concurrency: `min(strategy_cap, N, safety)` |
| `--interactive` | Подтверждать крупные параллельные batch и merge |

**Безопасность всегда важнее** strategy (напр. неподтверждённая isolation worktree → concurrency 1).

### Pipeline worker (Plan → Goal → Execute)

На каждый implementation worktree:

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (/goal if host allows) → Acceptance Contract → orch AC gate
  → Implement → tests → exit report → PR (Fixes #N)
```

Затем **review worktree** проверяют **Issue → executionGoal → AC → Impl → PR → Tests**. Merge только после review **APPROVE** + human confirm.

### Роли и source of truth

| Артефакт | Роль |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | Runtime-состояние (status, locks, progress) |
| **Canonical Issue** (GitHub или board mirror) | Человеческий контракт (scope, priority, ownership); **оркестратор создаёт** до spawn |
| **Board** (`board.md`) | Только dashboard |

Worker’ы могут обновлять только **Acceptance / notes / risks / verification** issue — не scope, priority, ownership, dependencies. Impl worker’ы берут **Issue Snapshot** при старте; смена scope в полёте требует одобрения оркестратора.

### Адаптивные модели worker

- **Lead-сессия:** сильнейшая host-модель (глобальное суждение).
- **Worker’ы:** классифицируют задачу **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` (сейчас часто всё на `grok-4.5`, пока host не даст больше slug).
- Worker’ы **не** повышают модель сами; запрашивают **complexity escalation**, оркестратор respawn’ит.
- Сложность также задаёт **глубину review** и soft **retry budgets**.

Состояние: `.omg/orchestration/` (main checkout, lead) + Layer-B `.omg/state/orchestration-state.json`. Полный протокол: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).

---

## Выполнение Autopilot: `solo` vs `team`

`/autopilot` всегда оркестрирует **agents + skills**. Меняется только **фаза реализации**.

| Режим | Config | Как бежит | Что видно |
|------|--------|---------------|--------------|
| **`solo`** (по умолчанию) | omit / `"solo"` | `spawn_subagent` в сессии + skills | Тот же чат Grok; **без tmux** |
| **`team`** | `"execution": "team"` | CLI-воркеры `omg team` | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### Настройка (проект или пользователь)

**Проект**: `.grok/omg.jsonc` · **Пользователь**: `~/.config/grok-omg/config.jsonc` · проект важнее.

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

### Наблюдение за воркерами (`execution: "team"`)

UI Grok **не** открывает боковые панели как OMC. Процессные команды — через **tmux**.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Ручная команда без полного autopilot:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| Выбирайте **solo**, если… | Выбирайте **team**, если… |
|----------------------|------------------------|
| Ежедневный coding в одном окне Grok | CLI-воркеры видны в **tmux** |
| Не нужен tmux | Смешивать **cursor / codex / gemini** |
| Быстрый feedback в одном transcript | Долгие параллельные implementers изолированы |

**По умолчанию: **solo**, если вы не живёте в tmux и не нужен multi-CLI.**

---

## Что вы получаете

| Поверхность | Кол-во | Заметки |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 46+ | omc→omg + `ui-mockup` + `web-research` + `orchestration` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Эксклюзивы Grok

- **`/orchestration`** — Protocol v1.3 Hierarchical Execution Graph: Coordinator|Worker, recipes, Runtime Policy A′, nested scopes
- **`/web-research`** — live docs → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → approval → Vision → code → Vision QA
- **Search-on-fail** — предпочитать `web_search` до слепых retry

### Режимы review

- **`/security-review`**
- **`/code-review`**

### Основные skills

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Id сервера по умолчанию **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Без bridge: `dist/mcp/standalone-server.js`. Thin: `mcp/omg-state-server.mjs`.

### Локальный CLI

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

## Структура проекта

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Разработка

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

Хелперы re-port после обновления cache OMC:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Планка качества:** core + smoke + MCP. **Full residual: 0 fail**. См. `docs/GROK-PRODUCT-SUBSET.md`.

### Карта документов

| Док | Назначение |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Upstream pin |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | Статус поверхностей |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Определение “done” Grok |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Первый запуск |
| [docs/settings-schema.md](docs/settings-schema.md) | Ключи config |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Чеклист слоёв |
| [parity-review/](parity-review/) | Заметки-доказательства |

---

## Лицензия

MIT. Исходный copyright oh-my-claudecode и вкладчики oh-my-grok. См. [LICENSE](LICENSE) и [NOTICE](NOTICE).

## Благодарности

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — дизайн оркестрации, agents, skills, протоколы
- xAI Grok Build — plugin / skills / hooks / MCP host
