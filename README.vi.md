# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Điều phối đa agent cho [Grok Build](https://x.ai) / Grok CLI.**

Port từ [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) sang Grok, kèm nâng cấp gốc Grok: **web/X search realtime**, **Image Gen UI mockup**, **Vision UI QA**.

| | |
|--|--|
| **Phiên bản OMG** | `0.9.0-rc.1` |
| **Thư mục state** | `.omg/` (không dùng `.omc/`) |
| **Pin OMC** | `4.15.7` @ `41a4c0f` |
| **Cổng sản phẩm** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Parity** | **Near-complete** (không phải clone 100% host Claude) |

> Đừng học harness. Cứ dùng OMG.

### Trạng thái (2026-07)

| Trục | Trạng thái |
|------|--------|
| Kiểm kê module | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Tập con Grok | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | cùng protocol OMC; đổi tên tool cho Grok |

Kiểm tra tùy chọn: `npm run test:optional`.

---

## Pin nguồn OMC

OMG theo dõi **commit OMC cố định** để re-diff. Chi tiết: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Trường | Giá trị |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Phiên bản pin** | **`4.15.7`** |
| **Commit pin** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Tiêu đề** | `chore: promote dev to main for v4.15.7 release` |
| **Ngày** | 2026-07-23 04:44:59 +0000 |
| **Dạng ngắn** | `4.15.7` @ `41a4c0f` |

Khi nâng OMC có chủ đích:

1. Checkout/cache cây upstream mới.
2. Ghi `version` + HEAD vào `docs/OMC-SOURCE.md`.
3. Chạy lại `port-inventory.mjs` và cập nhật `docs/OMC-PORT-STATUS.md`.
4. Diff OMG so với **pin cũ** (`41a4c0f…`) rồi tiến pin.

Cache local: `~/.grok/marketplace-cache/*` với `oh-my-claude-sisyphus@4.15.7`.

---

## Cài đặt

```bash
# GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# Local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Xác minh:

```bash
grok plugin details oh-my-grok
grok inspect
```

Trong phiên Grok:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/orchestration --strategy balanced "ship auth + dashboard polish with PRs"
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Pipeline khuyến nghị

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  single-mission implement → QA → validate
   or
/orchestration   →  multi-stream worktrees → review gates → merge
```

Hủy bằng `/cancel`. State trong **`.omg/`**. Ý tưởng mơ hồ → `/deep-interview`. Spec sẵn → `/ralplan` rồi phê duyệt rõ ràng. Giao hàng multi-stream với worktree cô lập, issue chuẩn và cổng review → `/orchestration`. UI chưa có design → `/ui-mockup`. Ẩn số hệ sinh thái → `/web-research`.

---

## `/orchestration` (Protocol v1.3 — giao hàng multi-worktree)

### Nested model (Protocol v1.3)

> Protocol defines execution semantics; Runtime Policy binds them to the host.

**Binding:** Protocol v1.3 · Policy **A′** (root materializes / sole Worker spawner) · Team = **recipe** (not a runtime type) · Hierarchical Execution Graph (containment + `dependsOn`).

```text
Root Coordinator → Coordinator (e.g. backend recipe) → Workers
omit kind ⇒ agent; ownership global; planning hierarchical
```

Full protocol: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).


**Lead không bao giờ viết mã sản phẩm.** Chỉ phân rã nhiệm vụ, tạo artifact theo dõi, spawn **worktree implement**, **worktree review** và kiểm soát merge. Từ khóa: `orchestration` / `orchestrate` / `오케스트레이션`.

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "high-risk migration"
```

| Flag | Ý nghĩa |
|------|---------|
| *(mặc định)* | `--strategy conservative` (ưu tiên an toàn, 1–3 impl worker đồng thời) |
| `--strategy balanced` | Dispatch song song vừa phải (cap 4) |
| `--strategy aggressive` | Dispatch thực dụng tối đa (cap 6); **cùng cổng chất lượng** mỗi stream, không phải fast path bỏ AC |
| `--max-depth N` | Nesting depth ceiling (default 2) |
| `--max-parallel N` | Chỉ **trần cuối** concurrency: `min(strategy_cap, N, safety)` |
| `--interactive` | Xác nhận batch song song lớn và merge |

**An toàn luôn thắng** strategy (vd. worktree isolation chưa chứng minh → concurrency 1).

### Pipeline worker (Plan → Goal → Execute)

Mỗi worktree implement:

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (/goal if host allows) → Acceptance Contract → orch AC gate
  → Implement → tests → exit report → PR (Fixes #N)
```

Sau đó **worktree review** xác thực **Issue → executionGoal → AC → Impl → PR → Tests**. Chỉ merge sau review **APPROVE** + xác nhận người.

### Vai trò & nguồn sự thật

| Artifact | Vai trò |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | Trạng thái runtime (status, lock, progress) |
| **Canonical Issue** (GitHub hoặc board mirror) | Hợp đồng con người (scope, priority, ownership); **orchestrator tạo** trước spawn |
| **Board** (`board.md`) | Chỉ dashboard |

Worker chỉ được cập nhật **Acceptance / notes / risks / verification** của issue — không scope, priority, ownership, dependencies. Impl worker chụp **Issue Snapshot** lúc bắt đầu; đổi scope giữa chừng cần orchestrator duyệt.

### Mô hình worker thích ứng

- **Phiên lead:** mô hình host mạnh nhất (phán đoán toàn cục).
- **Worker:** phân loại task **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` (hiện thường map hết sang `grok-4.5` cho đến khi host có thêm slug).
- Worker **không** tự nâng model; yêu cầu **complexity escalation**, orchestrator respawn.
- Độ phức tạp cũng điều khiển **độ sâu review** và ngân sách soft **retry**.

State: `.omg/orchestration/` (checkout chính, lead sở hữu) + Layer-B `.omg/state/orchestration-state.json`. Protocol đầy đủ: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).

---

## Chạy Autopilot: `solo` vs `team`

`/autopilot` luôn điều phối **agents + skills**. Chỉ **giai đoạn implement** đổi theo config.

| Chế độ | Config | Cách chạy | Bạn thấy gì |
|------|--------|---------------|--------------|
| **`solo`** (mặc định) | omit / `"solo"` | `spawn_subagent` trong session + skills | Cùng chat Grok; **không tmux** |
| **`team`** | `"execution": "team"` | worker `omg team` CLI | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### Cấu hình (project hoặc user)

**Project**: `.grok/omg.jsonc` · **User**: `~/.config/grok-omg/config.jsonc` · project thắng.

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

### Quan sát worker (`execution: "team"`)

UI Grok **không** tự mở panel kiểu OMC. Team process dùng **tmux**.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Team thủ công không full autopilot:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| Nên **solo** khi… | Nên **team** khi… |
|----------------------|------------------------|
| Code hằng ngày một cửa sổ Grok | Worker CLI hiện trong **tmux** |
| Không cần cài tmux | Trộn **cursor / codex / gemini** |
| Phản hồi nhanh cùng transcript | Implement dài tách khỏi orchestrator |

**Mặc định: **solo**, trừ khi đã dùng tmux hoặc cần multi-CLI.**

---

## Bạn nhận được

| Bề mặt | SL | Ghi chú |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 46+ | omc→omg + `ui-mockup` + `web-research` + `orchestration` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Độc quyền Grok

- **`/orchestration`** — Protocol v1.3 Hierarchical Execution Graph: Coordinator|Worker, recipes, Runtime Policy A′, nested scopes
- **`/web-research`** — docs live → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → duyệt → Vision → code → Vision QA
- **Search-on-fail** — ưu tiên `web_search` trước retry mù

### Chế độ review

- **`/security-review`**
- **`/code-review`**

### Skills chính

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Id mặc định **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Không bridge: `dist/mcp/standalone-server.js`. Thin: `mcp/omg-state-server.mjs`.

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

## Bố cục project

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Phát triển

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

Helper re-port sau khi refresh cache OMC:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Thanh chất lượng:** core + smoke + MCP. **Residual full: 0 fail**. Xem `docs/GROK-PRODUCT-SUBSET.md`.

### Bản đồ docs

| Doc | Mục đích |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Pin upstream |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | Trạng thái từng bề mặt |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Định nghĩa “done” Grok |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Chạy lần đầu |
| [docs/settings-schema.md](docs/settings-schema.md) | Khóa config |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Checklist lớp |
| [parity-review/](parity-review/) | Ghi chú bằng chứng |

---

## Giấy phép

MIT. Bản quyền gốc oh-my-claudecode và đóng góp oh-my-grok. Xem [LICENSE](LICENSE) và [NOTICE](NOTICE).

## Ghi công

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — thiết kế điều phối, agents, skills, protocol
- xAI Grok Build — plugin / skills / hooks / host MCP
