# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**[Grok Build](https://x.ai) / Grok CLI 向けマルチエージェント・オーケストレーション。**

[oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) の Grok 移植。Grok ネイティブ拡張: **リアルタイム web/X 検索**、**Image Gen UI モック**、**Vision UI QA**。

| | |
|--|--|
| **OMG バージョン** | `0.9.0-rc.1` |
| **状態ルート** | `.omg/` (`.omc/` は使わない) |
| **OMC ピン** | `4.15.7` @ `41a4c0f` |
| **製品ゲート** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **パリティ** | **Near-complete**（Claude ホスト 100% クローンではない） |

> ハーネスを学ばない。OMG を使うだけ。

### ステータス（2026-07）

| 軸 | 状態 |
|------|--------|
| モジュール棚卸し | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Grok 製品定義 | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | OMC と同じプロトコル。ホスト用ツール名のみ Grok 向け |

任意チェック: `npm run test:optional`（HUD `--preset`、release dry-run、skill/drift smokes）。

---

## OMC ソースピン（アップストリーム・チェックポイント）

将来の re-diff のため **固定 OMC コミット** を追跡します。詳細: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md)。

| 項目 | 値 |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm パッケージ** | `oh-my-claude-sisyphus` |
| **ピン版** | **`4.15.7`** |
| **ピンコミット** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **件名** | `chore: promote dev to main for v4.15.7 release` |
| **日付** | 2026-07-23 04:44:59 +0000 |
| **短縮** | `4.15.7` @ `41a4c0f` |

OMC を意図的に上げるとき:

1. 新しい upstream を checkout / cache する。
2. `version` と `git rev-parse HEAD` を [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md) に記録。
3. `node scripts/port-inventory.mjs` を再実行し [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md) を更新。
4. **旧ピン**（`41a4c0f…`）を基準に OMG を re-diff してからピンを進める。

ローカル cache: `~/.grok/marketplace-cache/*` で `oh-my-claude-sisyphus@4.15.7`（または新ピン）の `package.json` を選ぶ。

---

## インストール

```bash
# From GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# From a local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

確認:

```bash
grok plugin details oh-my-grok
grok inspect
```

Grok セッションで:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## 推奨パイプライン

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  implement → QA → multi-agent validation
```

いつでも `/cancel`。ランタイム状態は **`.omg/`**。曖昧なアイデア → `/deep-interview`。スペック準備 → `/ralplan` 合意のあと明示承認。UI なし → `/ui-mockup`。調査 → `/web-research`。

---

## Autopilot 実行: `solo` vs `team`

`/autopilot` は常に **agents + skills** を編成します。**実装段階**の走らせ方だけ設定で変わります。

| モード | 設定 | 実行 | 見えるもの |
|------|--------|---------------|--------------|
| **`solo`** (既定) | omit `execution` / `"solo"` | セッション内 `spawn_subagent` + skill ルーティング | 同じ Grok チャット; **tmux なし** |
| **`team`** | `"execution": "team"` | `omg team` CLI ワーカー | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### 設定（プロジェクト / ユーザー）

**プロジェクト**（推奨）: `.grok/omg.jsonc` · **ユーザー**: `~/.config/grok-omg/config.jsonc` · プロジェクト優先。スキーマ: [`docs/settings-schema.md`](docs/settings-schema.md)。

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

### チームワーカーの観察（`execution: "team"`）

Grok チャットは OMC 風サイドパネルを自動表示しません。プロセスチームは **tmux ベース**です。

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

autopilot なしの手動チーム:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| **solo** が向くとき | **team** が向くとき |
|----------------------|------------------------|
| 1 つの Grok 窓での日常コーディング | **tmux** で見える CLI ワーカー |
| tmux 不要 | **cursor / codex / gemini** 混在 |
| 同一 transcript の速いフィードバック | 長い並列実装を分離 |

**既定のおすすめ: tmux 運用やマルチ CLI 分離が要るまで **solo**。**

---

## 構成

| 面 | 数 | メモ |
|---------|------:|-------|
| Agents | 20 | OMC セット + `visual-designer` |
| Skills | 45 | omc→omg + `ui-mockup` + `web-research` |
| MCP tools | ~54 | `.mcp.json` 経由 `omg-tools` |
| State | `.omg/` | specs / plans / artifacts / modes |

### Grok 専用

- **`/web-research`** — ライブ docs / releases / issues / X → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → 承認 → Vision brief → コード → Vision QA
- **Search-on-fail** — 失敗時は盲再試行の前に `web_search` を優先

### レビューモード

- **`/security-review`** — `security review` など
- **`/code-review`** — `code review` / PR レビュー

### 主要スキル

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### フック (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

プラグイン既定 id **`omg-tools`** → `mcp/run-tools-server.mjs` → 約 54 tools（LSP / AST / wiki / notepad / `state_*` …）。

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

bridge 無し時: `dist/mcp/standalone-server.js`。thin: `mcp/omg-state-server.mjs`（デバッグ用）。

### ローカル CLI

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

## レイアウト

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

## 開発

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

OMC キャッシュ更新後の re-port ヘルパ:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**製品品質バー:** core vitest + smoke + MCP。**Full suite residual:** 2026-07 時点 **0 fail**。**Grok “done” vs ホストクローン:** [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md)。

### ドキュメント地図

| 文書 | 用途 |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | アップストリーム・ピン |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | 面ごとの状態 |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Grok 完了定義 |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | フック vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | 初回 |
| [docs/settings-schema.md](docs/settings-schema.md) | 設定キー |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | レイヤー一覧 |
| [parity-review/](parity-review/) | 証拠ノート |

---

## ライセンス

MIT。oh-my-claudecode 原著作者と oh-my-grok 貢献者。 [LICENSE](LICENSE) / [NOTICE](NOTICE)。

## クレジット

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — オーケストレーション設計・agents・skills・プロトコル
- xAI Grok Build — plugin / skills / hooks / MCP ホスト
