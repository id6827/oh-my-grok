# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**面向 [Grok Build](https://x.ai) / Grok CLI 的多智能体编排。**

[oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) 的 Grok 移植，并提供 Grok 原生能力：**实时 web/X 搜索**、**Image Gen UI 稿**、**Vision UI QA**。

| | |
|--|--|
| **OMG 版本** | `0.9.0-rc.1` |
| **状态根目录** | `.omg/` （不要用 `.omc/`） |
| **OMC 钉选** | `4.15.7` @ `41a4c0f` |
| **产品门禁** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **对等** | **Near-complete**（不是 Claude 主机 100% 克隆） |

> 不必学框架，直接用 OMG。

### 状态快照（2026-07）

| 维度 | 状态 |
|------|--------|
| 模块清单 | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Grok 产品子集 | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | 协议与 OMC 相同；主机工具名改为 Grok |

可选检查：`npm run test:optional`（HUD `--preset`、release dry-run、skill/drift smokes）。

---

## OMC 源钉选（上游检查点）

为便于后续 re-diff，跟踪 **固定 OMC 提交**。详见 [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md)。

| 字段 | 值 |
|-------|--------|
| **上游** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm 包** | `oh-my-claude-sisyphus` |
| **钉选版本** | **`4.15.7`** |
| **钉选提交** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **提交说明** | `chore: promote dev to main for v4.15.7 release` |
| **日期** | 2026-07-23 04:44:59 +0000 |
| **简写** | `4.15.7` @ `41a4c0f` |

有意升级 OMC 时：

1. 检出/缓存新的上游树。
2. 在 [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md) 记录 `version` 与 `git rev-parse HEAD`。
3. 重跑 `node scripts/port-inventory.mjs` 并更新 [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md)。
4. 相对 **旧钉**（`41a4c0f…`）diff OMG，再推进钉选。

本地缓存：在 `~/.grok/marketplace-cache/*` 中选择 `package.json` 为 `oh-my-claude-sisyphus@4.15.7`（或新钉）的目录。

---

## 安装

```bash
# From GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# From a local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

验证:

```bash
grok plugin details oh-my-grok
grok inspect
```

在 Grok 会话中试试：

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/orchestration --strategy balanced "ship auth + dashboard polish with PRs"
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## 推荐流水线

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  single-mission implement → QA → validate
   or
/orchestration   →  multi-stream worktrees → review gates → merge
```

随时 `/cancel`。运行时状态在 **`.omg/`**。模糊想法 → `/deep-interview`。规格就绪 → `/ralplan` 共识后显式批准再执行。多流交付、隔离 worktree、规范 issue、评审门 → `/orchestration`。无设计 UI → `/ui-mockup`。生态未知 → `/web-research`。

---

## `/orchestration`（多 worktree 交付）

### Nested model (Protocol v1.3)

> Protocol defines execution semantics; Runtime Policy binds them to the host.

**Binding:** Protocol v1.3 · Policy **A′** (root materializes / sole Worker spawner) · Team = **recipe** (not a runtime type) · Hierarchical Execution Graph (containment + `dependsOn`).

```text
Root Coordinator → Coordinator (e.g. backend recipe) → Workers
omit kind ⇒ agent; ownership global; planning hierarchical
```

Full protocol: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).


**主会话从不实现产品代码。** 仅负责任务拆解、跟踪产物、生成**实现 worktree**、**评审 worktree** 与合并门禁。关键词：`orchestration` / `orchestrate` / `오케스트레이션`。

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "high-risk migration"
```

| 标志 | 含义 |
|------|---------|
| *(默认)* | `--strategy conservative`（安全优先，并发实现 worker 1–3） |
| `--strategy balanced` | 中等并行（上限 4） |
| `--strategy aggressive` | 实用最大并行（上限 6）；**每条流的质量门相同**，不是跳过 AC 的快路径 |
| `--max-depth N` | Nesting depth ceiling (default 2) |
| `--max-parallel N` | 仅作并发**最终上限**：`min(strategy_cap, N, safety)` |
| `--interactive` | 确认大批量并行与合并 |

**安全始终优先于 strategy**（例如 worktree 隔离未验证 → 并发为 1）。

### Worker 流水线（Plan → Goal → Execute）

每个实现 worktree：

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (/goal if host allows) → Acceptance Contract → orch AC gate
  → Implement → tests → exit report → PR (Fixes #N)
```

随后 **评审 worktree** 校验 **Issue → executionGoal → AC → Impl → PR → Tests**。仅在评审 **APPROVE** + 人工确认后合并。

### 角色与事实来源

| 产物 | 角色 |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | 运行时状态（status、lock、progress） |
| **Canonical Issue**（GitHub 或 board 镜像） | 人类契约（scope、priority、ownership）；**spawn 前由编排器创建** |
| **Board** (`board.md`) | 仅仪表盘视图 |

Worker 仅可更新 issue 的 **Acceptance / notes / risks / verification** — 不可改 scope、priority、ownership、dependencies。实现 worker 启动时抓取 **Issue Snapshot**，飞行中改 scope 需编排器批准。

### 自适应 worker 模型

- **主会话：** 最强主机模型（全局判断）。
- **Worker：** 将任务分为 **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL`（主机暂无更多 slug 时多映射到 `grok-4.5`）。
- Worker **不得**自行升级模型；应请求 **complexity escalation**，由编排器 respawn。
- 复杂度也驱动 **评审深度** 与软 **重试预算**。

状态：`.omg/orchestration/`（主 checkout，主会话拥有）+ Layer-B `.omg/state/orchestration-state.json`。完整协议：[`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md)。

---

## Autopilot 执行：`solo` vs `team`

`/autopilot` 始终编排 **agents + skills**。**实现阶段**如何跑由配置决定。

| 模式 | 配置 | 如何运行 | 你看到的 |
|------|--------|---------------|--------------|
| **`solo`** (默认) | omit `execution` / `"solo"` | 会话内 `spawn_subagent` + 技能路由 | 同一 Grok 对话；**无 tmux** |
| **`team`** | `"execution": "team"` | `omg team` CLI 工作进程 | **tmux**（`omg-omg-team-…`）；HUD `team:…` |

### 配置（项目 / 用户）

**项目**（推荐）：`.grok/omg.jsonc` · **用户**：`~/.config/grok-omg/config.jsonc` · 项目优先。模式见 [`docs/settings-schema.md`](docs/settings-schema.md)。

```jsonc
// .grok/omg.jsonc — solo
{
  "autopilot": {
    "execution": "solo"
  }
}
```

```jsonc
// .grok/omg.jsonc — team + tmux
{
  "autopilot": {
    "execution": "team",
    "team": {
      // grok | cursor | codex | claude | gemini | antigravity | executor
      "agentTypes": ["grok"]
    }
  }
}
```

### 观察团队工作进程（`execution: "team"`）

Grok 聊天 UI **不会**自动打开 OMC 式侧栏。进程团队基于 **tmux**。

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

不用完整 autopilot 的手动团队：

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| 更适合 **solo** | 更适合 **team** |
|----------------------|------------------------|
| 单窗口日常编码 | 在 **tmux** 中可见 CLI 工作进程 |
| 无需 tmux | 混用 **cursor / codex / gemini** |
| 同一 transcript 快速反馈 | 长时并行实现与编排隔离 |

**默认建议：除非已用 tmux 或需要多 CLI 隔离，否则用 **solo**。**

---

## 你将获得

| 表面 | 数量 | 说明 |
|---------|------:|-------|
| Agents | 20 | OMC 集合 + `visual-designer` |
| Skills | 46+ | omc→omg + `ui-mockup` + `web-research` + `orchestration` |
| MCP tools | ~54 | 经 `.mcp.json` 的 `omg-tools` |
| State | `.omg/` | specs、plans、artifacts、模式状态 |

### Grok 专属

- **`/orchestration`** — Protocol v1.3 Hierarchical Execution Graph: Coordinator|Worker, recipes, Runtime Policy A′, nested scopes
- **`/web-research`** — 实时文档/发布/议题/X → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → 批准 → Vision 简报 → 代码 → Vision QA
- **Search-on-fail** — 失败时优先 `web_search` 再盲重试

### 审查模式

- **`/security-review`** — 或说 security review
- **`/code-review`** — 或说 code review / review this PR

### 核心技能

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### 钩子 (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP（`omg-tools`）

插件默认 id **`omg-tools`** → `mcp/run-tools-server.mjs` → 约 54 工具（LSP、AST、wiki、notepad、`state_*` …）。

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

无 bridge 时：`dist/mcp/standalone-server.js`。精简：`mcp/omg-state-server.mjs`（调试用）。

### 本地 CLI

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

## 项目布局

```text
agents/           # subagent definitions
skills/*/SKILL.md # slash skills
hooks/            # hooks.json + scripts
src/              # TypeScript runtime (OMC-scale port)
dist/             # tsc output
bridge/           # esbuild CJS bundles
mcp/              # MCP launchers
bin/omg.js        # CLI (omg, omc, oh-my-grok)
docs/
parity-review/
plugin.json
```

---

## 开发

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

刷新 OMC 缓存后的 re-port 辅助：

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**产品质量线：** core vitest + smoke + MCP。**全量 residual：** 2026-07 起 **0 fail**。**Grok「完成」vs 主机克隆：** [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md)。

### 文档地图

| 文档 | 用途 |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | 上游钉选 |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | 各表面状态 |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Grok 完成定义 |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | 钩子 vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | 首次运行 |
| [docs/settings-schema.md](docs/settings-schema.md) | 配置键 |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | 层级清单 |
| [parity-review/](parity-review/) | 证据笔记 |

---

## 许可证

MIT。包含 oh-my-claudecode 原版权与 oh-my-grok 贡献者。见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)。

## 致谢

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — 编排设计、agents、skills、运行时协议
- xAI Grok Build — plugin / skills / hooks / MCP 主机运行时
