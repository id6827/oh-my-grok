# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**[Grok Build](https://x.ai) / Grok CLI용 멀티 에이전트 오케스트레이션.**

[oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode)를 Grok로 이식한 포트이며, Grok 네이티브 확장으로 **실시간 웹/X 검색**, **Image Gen UI 목업**, **Vision UI QA**를 제공합니다.

| | |
|--|--|
| **OMG 버전** | `0.9.0-rc.1` |
| **상태 루트** | `.omg/` (`.omc/` 사용 안 함) |
| **OMC 핀** | `4.15.7` @ `41a4c0f` (아래 참고) |
| **제품 게이트** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **패리티 라벨** | **Near-complete** 제품 이관 (Claude 호스트 100% 복제 아님) |

> 하네스를 배우지 마세요. 그냥 OMG를 쓰세요.

### 상태 스냅샷 (2026-07)

| 축 | 상태 |
|------|--------|
| OMC 핀 대비 모듈 인벤토리 | **100%** modules touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** / ~11225 pass — [`parity-review/VITEST-RESIDUAL-2026-07-25.md`](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Grok 제품 정의 | frozen — [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` 프로토콜 | OMC와 동일 (Planner/Architect/Critic + gate); 호스트 도구명만 Grok용 |

선택 검사: `npm run test:optional` (HUD `--preset`, release-pack dry-run, skill + drift-guard smokes).

---

## OMC 소스 핀 (업스트림 체크포인트)

OMG는 이후 re-diff를 위해 **고정된 OMC 커밋**을 추적합니다. 상세: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| 필드 | 값 |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm 패키지** | `oh-my-claude-sisyphus` |
| **핀 버전** | **`4.15.7`** |
| **핀 커밋** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **커밋 제목** | `chore: promote dev to main for v4.15.7 release` |
| **커밋 시각** | 2026-07-23 04:44:59 +0000 |
| **축약** | `4.15.7` @ `41a4c0f` |

OMC를 의도적으로 올릴 때:

1. 새 upstream 트리를 체크아웃/캐시합니다.
2. `version` + `git rev-parse HEAD`를 [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md)에 기록합니다.
3. `node scripts/port-inventory.mjs` 재실행 후 [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md)를 갱신합니다.
4. **이전 핀**(`41a4c0f…`)을 기준으로 OMG를 re-diff한 뒤 핀을 전진시킵니다.

로컬 캐시 팁: `~/.grok/marketplace-cache/*` 아래 `package.json`이 `oh-my-claude-sisyphus@4.15.7`(또는 새 핀)인 폴더를 고르세요.

---

## 설치

**필요 조건:** [Grok Build / Grok CLI](https://x.ai/cli) 설치 및 로그인 (`grok --version`).

> **중요:** `grok plugin details oh-my-grok` 는 **설치 후에만** 동작합니다. GitHub·마켓플레이스를 검색하지 않습니다.  
> Grok Build 마켓에서 “omg”를 검색해도, [공식 marketplace 카탈로그](https://github.com/xai-org/plugin-marketplace)에 등록되기 전에는 **나오지 않습니다.** 그때까지는 아래처럼 GitHub에서 직접 설치하세요.

### 권장 (공개 GitHub)

```bash
# GitHub shorthand (owner/repo) — 권장 원라인
grok plugin install id6827/oh-my-grok --trust

# 동일, 전체 URL
grok plugin install https://github.com/id6827/oh-my-grok.git --trust

# 태그·커밋 고정 (재현 가능 설치)
# grok plugin install id6827/oh-my-grok@v0.9.0-rc.1 --trust
# grok plugin install id6827/oh-my-grok@4cf6cd1 --trust

grok plugin enable oh-my-grok
```

`--trust` 는 신뢰 확인 프롬프트를 건너뜁니다 (플러그인은 코드 실행·머신 접근이 가능함).

### 로컬 체크아웃 (기여자 / 개발)

```bash
git clone https://github.com/id6827/oh-my-grok.git
cd oh-my-grok
# 선택: npm ci && npm run build   # dist / 로컬 CLI가 필요할 때

grok plugin install "$(pwd)" --trust
grok plugin enable oh-my-grok
```

### 확인 (설치 후에만)

```bash
grok plugin list
# oh-my-grok 가 포함된 줄이 보여야 함

grok plugin details oh-my-grok
# 버전, 경로, skills/agents/hooks/MCP 요약

grok inspect   # 선택: 호스트/플러그인 개요
```

`details` 가 `Plugin "oh-my-grok" not found` 이면 **이 머신에 미설치**입니다. `details` 가 아니라 먼저 `install` 하세요.

### 업데이트

업데이트 방법은 **처음 어떻게 설치했는지**에 따라 다릅니다 (`grok plugin list` 로 확인).

#### GitHub 설치 (일반 사용자)

`grok plugin install id6827/oh-my-grok` (또는 전체 git URL) 로 설치했다면 **Git** 소스로 등록됩니다:

```bash
# 원격에서 최신 트리를 받아 로컬 플러그인 캐시를 갱신
grok plugin update oh-my-grok

# 설치된 플러그인 전부 업데이트
grok plugin update
```

확인:

```bash
grok plugin list
grok plugin details oh-my-grok
```

스킬·훅이 새 버전을 읽도록 **Grok 세션을 새로 열거나 재시작**하세요.

#### 로컬 경로 설치 (기여자 / 개발)

`grok plugin list` 에 `local: /path/to/oh-my-grok` 가 보이면, `plugin update` 는 **GitHub를 당기지 않습니다.** 체크아웃을 직접 갱신하세요:

```bash
cd /path/to/oh-my-grok
git pull
# 선택: npm ci && npm run build
```

로컬 설치를 공개 GitHub 설치로 바꾸려면:

```bash
grok plugin uninstall oh-my-grok
grok plugin install id6827/oh-my-grok --trust
grok plugin enable oh-my-grok
```

#### 재설치 (업데이트가 꼬였거나 깨끗이 받을 때)

```bash
grok plugin uninstall oh-my-grok
grok plugin install id6827/oh-my-grok --trust
grok plugin enable oh-my-grok
```

태그·커밋 고정:

```bash
grok plugin install id6827/oh-my-grok@v0.9.1 --trust
# grok plugin install id6827/oh-my-grok@<full-sha> --trust
```

#### 버전을 올릴 때 배포 측에서 할 일

1. [id6827/oh-my-grok](https://github.com/id6827/oh-my-grok) 에 커밋·푸시.
2. `plugin.json` 의 **`version`** 을 올린다.
3. (권장) git 태그 푸시, 예: `v0.9.1`.
4. **Git** 으로 설치한 사용자는 `grok plugin update oh-my-grok`.

별도 `plugin publish` 명령은 없습니다. GitHub(또는 마켓플레이스 카탈로그 SHA pin)가 배포 채널입니다.

### 제거

```bash
grok plugin uninstall oh-my-grok       # 별칭: rm, remove
```

### 다른 사람에게 공유

다음 한 줄을 전달하면 됩니다:

```bash
grok plugin install id6827/oh-my-grok --trust && grok plugin enable oh-my-grok
```

저장소: [github.com/id6827/oh-my-grok](https://github.com/id6827/oh-my-grok)

### 빠른 체험 (Grok 세션 안)

```text
/deep-interview "스트릭 있는 습관 트래커 CLI를 만들고 싶어요"
/ralplan
/autopilot
/orchestration --strategy balanced "auth + 대시보드 polish PR 여러 개"
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "프로필 카드가 있는 다크모드 설정 페이지"
```

---

## 권장 파이프라인

```text
/deep-interview  →  명확성 게이트 스펙 (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic 합의 (.omg/plans/)
       ↓
/autopilot       →  단일 미션 구현 → QA → 검증
   또는
/orchestration   →  멀티 스트림 worktree → 리뷰 게이트 → 머지
```

언제든 `/cancel`. 런타임 상태는 **`.omg/`** 아래.

모호한 제품 아이디어 → 코드 전에 `/deep-interview`. 스펙 준비됨 → `/ralplan` 합의 후 **명시 승인** 뒤 실행. 멀티 스트림·워크트리·캐노니컬 이슈·리뷰 게이트 전달 → `/orchestration`. 디자인 없는 UI → `/ui-mockup`. 생태계 불확실 → `/web-research`.

---

## `/orchestration` (멀티 worktree 전달)

**리드는 제품 코드를 구현하지 않습니다.** 미션 분해, 추적 아티팩트, **구현 worktree** 스폰, **리뷰 worktree**, 머지 게이트만 담당합니다. 키워드: `orchestration` / `orchestrate` / `오케스트레이션`.

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "고위험 마이그레이션"
```

| 플래그 | 의미 |
|------|---------|
| *(기본)* | `--strategy conservative` (안정 우선, 동시 impl 1–3) |
| `--strategy balanced` | 중간 병렬 (상한 4) |
| `--strategy aggressive` | 최대 실무 디스패치 (상한 6); **스트림마다 동일 품질 게이트** (AC 스킵 아님) |
| `--max-parallel N` | 최종 동시성 **상한만**: `min(strategy_cap, N, safety)` |
| `--interactive` | 큰 병렬 배치·머지 확인 |

**Safety Override가 strategy보다 항상 우선** (예: worktree isolation 미증명 → 동시성 1).

### 워커 파이프라인 (Plan → Goal → Execute)

구현 worktree마다:

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (가능하면 /goal) → Acceptance Contract → Orch AC 승인
  → 구현 → 테스트 → exit report → PR (Fixes #N)
```

**리뷰 worktree**는 **Issue → executionGoal → AC → Impl → PR → Tests** 일관성을 검증합니다. 머지는 리뷰 **APPROVE** + 사람 확인 후.

### 역할과 진실 원천 (SoT)

| 아티팩트 | 역할 |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | 런타임 상태 (status, lock, progress) |
| **Canonical Issue** (GitHub 또는 보드 미러) | 사람 계약 (scope, priority, ownership); **스폰 전 오케스트레이터가 생성** |
| **Board** (`board.md`) | 대시보드 뷰 전용 |

워커는 이슈의 **Acceptance / notes / risks / verification** 만 수정 가능 — scope·priority·ownership·deps 는 불가. 구현 시작 시 **Issue Snapshot** 을 남겨 중도 스코프 변경은 오케 승인 필요.

### Adaptive worker 모델

- **리드 세션:** 호스트 최강 모델 (전역 판단).  
- **워커:** 태스크 **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` (현재 호스트는 종종 전부 `grok-4.5`).  
- 워커는 모델을 **스스로 올리지 않음** — **complexity escalation** 요청 후 오케가 respawn.  
- 복잡도는 **리뷰 깊이**·soft **재시도 예산**에도 반영.

상태: `.omg/orchestration/` (메인 체크아웃, 리드 소유) + Layer-B `.omg/state/orchestration-state.json`. 전문: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).
---

## Autopilot 실행: `solo` vs `team`

`/autopilot`은 항상 **에이전트 + 스킬**을 오케스트레이션합니다. **구현 단계** 방식만 설정으로 갈립니다.

| 모드 | 설정 | 실행 방식 | 보이는 것 |
|------|--------|---------------|--------------|
| **`solo`** (기본) | `execution` 생략 또는 `"solo"` | 세션 안 `spawn_subagent` + 스킬 라우팅 | 같은 Grok 채팅; **tmux 없음** |
| **`team`** | `"execution": "team"` | 구현을 `omg team` CLI 워커로 | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### 설정 (프로젝트 또는 사용자)

**프로젝트** (권장): `.grok/omg.jsonc`  
**사용자** (전 프로젝트): `~/.config/grok-omg/config.jsonc`  
프로젝트가 우선. 스키마: [`docs/settings-schema.md`](docs/settings-schema.md).

```jsonc
// .grok/omg.jsonc — 이 Grok 세션 안에서
{
  "autopilot": {
    "execution": "solo"
  }
}
```

```jsonc
// .grok/omg.jsonc — tmux 멀티 CLI 워커
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

### 팀 워커 관찰 (`execution: "team"`일 때)

Grok 채팅 UI는 OMC식 사이드 패널을 **자동으로 열지 않습니다**. 프로세스 팀은 **tmux 기반**입니다.

```bash
node bin/omg.js team status          # 또는: omg team status
tmux ls                              # omg-omg-team-* 찾기
tmux attach -t <tmux_session>        # 라이브 워커 (detach: Ctrl-b 다음 d)
node bin/omg.js hud                  # 한 줄: team:name(Nxagent)
cat .omg/state/team-state.json
```

autopilot 없이 수동 팀:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| **solo** 가 나을 때 | **team** 이 나을 때 |
|----------------------|------------------------|
| 한 Grok 창에서 일상 코딩 | **tmux** 에 보이는 CLI 워커 |
| tmux 설치/설정 없음 | **cursor / codex / gemini** 혼합 |
| 같은 트랜스크립트에서 빠른 피드백 | 긴 병렬 구현을 오케스트레이터와 분리 |

**기본 추천:** tmux를 이미 쓰거나 멀티 CLI 분리가 필요하기 전에는 **`solo`**.

---

## 구성 요소

| 표면 | 개수 | 메모 |
|---------|------:|-------|
| Agents | 20 | OMC 세트 + `visual-designer` |
| Skills | 46+ | omc→omg 이름 + `ui-mockup` + `web-research` + `orchestration` 등 |
| MCP tools | ~54 | 플러그인 `.mcp.json` → `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, 모드 상태 |

### Grok 전용

- **`/orchestration`** — 멀티 worktree 전달: Plan→Goal→AC→Execute, 리뷰 게이트, strategy, adaptive models
- **`/web-research`** — 라이브 문서, 릴리스, 이슈, X 신호 → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → 승인 → Vision 브리프 → 코드 → Vision QA
- **Search-on-fail** — 핵심 스킬이 맹목 재시도 전에 `web_search` 우선

### 리뷰 모드

- **`/security-review`** — 또는 `security review` / `보안 리뷰`
- **`/code-review`** — 또는 `code review` / `review this PR`

### 핵심 스킬 (하이라이트)

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### 훅 (Layer B)

`SessionStart` · `UserPromptSubmit` (keyword + skill-injector) · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` (persistent-mode + workflow-drift-guard 등) · `SessionEnd` · cancel 시 `.omg/state` 정리

### MCP (`omg-tools`)

플러그인 기본 서버 id **`omg-tools`** → `mcp/run-tools-server.mjs` → 전체 도구 (~54: LSP, AST, wiki, notepad, `state_*`, …).

```bash
npm run build && npm run build:bridge   # 권장 CJS 번들
npm run mcp:probe                       # ~54 tools 기대
```

bridge 없을 때: `dist/mcp/standalone-server.js` (`npm run build` 후).  
상태 전용 thin 서버: `mcp/omg-state-server.mjs` (수동/디버그, 기본 아님).

### 로컬 CLI

```bash
node bin/omg.js version
node bin/omg.js status      # 파일 HUD + threshold
node bin/omg.js hud --preset focused   # omcHud.preset 저장 후 렌더
node bin/omg.js state list
node bin/omg.js doctor
node bin/omg.js team status
npm test                    # smoke (build + foundation + hooks + team + hud)
npm run test:vitest:core    # 제품 vitest 게이트 (217)
npm run test:optional       # release dry-run + feature/drift smokes
```

---

## 프로젝트 레이아웃

```text
agents/           # 서브에이전트 정의
skills/*/SKILL.md # 슬래시 스킬
hooks/            # hooks.json + scripts
src/              # TypeScript 런타임 (OMC 규모 포트)
dist/             # tsc 출력
bridge/           # esbuild CJS (mcp-server, cli, team, …)
mcp/              # MCP 런처
bin/omg.js        # CLI (별칭: omg, omc, oh-my-grok)
docs/             # 아키텍처, OMC 핀, 포트 상태, 마이그레이션
parity-review/    # 패리티 증거 노트 (제품 게이트 아님)
plugin.json       # Grok 플러그인 매니페스트
```

---

## 개발

```bash
npm run build
npm run build:bridge          # mcp/cli/runtime/team + team-bridge + skill-bridge + coordinator
npm run test:vitest:core      # 제품 유닛 게이트 (217)
npm run test:smoke            # build + foundation + hooks + team + hud
npm run test:optional         # release pack dry-run + skill/drift smokes
npm run mcp:probe
node scripts/validate-parity.mjs
node scripts/port-inventory.mjs
node bin/omg.js doctor
grok plugin validate .
```

OMC 캐시 갱신 후 re-port 헬퍼 (위 핀 참고):

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**제품 품질 바:** core vitest + smoke + MCP probe.  
**전체 스위트:** `npm run test:vitest` residual는 2026-07 기준 **0 fail** — [`parity-review/VITEST-RESIDUAL-2026-07-25.md`](parity-review/VITEST-RESIDUAL-2026-07-25.md).  
**Grok “완료” vs Claude 호스트 복제:** [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md) · 표면 표: [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md).

### 문서 지도

| 문서 | 용도 |
|-----|---------|
| [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md) | **업스트림 핀 / re-pin 체크리스트** |
| [`docs/OMC-PORT-STATUS.md`](docs/OMC-PORT-STATUS.md) | 표면별 포트 상태 + 의도적 🟡 |
| [`docs/GROK-PRODUCT-SUBSET.md`](docs/GROK-PRODUCT-SUBSET.md) | Grok에서 “done”의 의미 (호스트 전체 복제 아님) |
| [`docs/HOOKS-PARITY.md`](docs/HOOKS-PARITY.md) | 훅 등록 vs OMC |
| [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md) | 첫 실행 가이드 |
| [`docs/settings-schema.md`](docs/settings-schema.md) | 설정 키 (`autopilot.execution`, team, …) |
| [`docs/PARITY-MATRIX.md`](docs/PARITY-MATRIX.md) | 레이어 체크리스트 |
| [`parity-review/`](parity-review/) | 증거 노트, residual close, optional wave 1–4 |

---

## 라이선스

MIT. oh-my-claudecode 원저작권(Yeachan Heo 및 기여자)과 oh-my-grok 기여자를 포함합니다. [LICENSE](LICENSE), [NOTICE](NOTICE) 참고.

## 크레딧

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — 오케스트레이션 설계, agents, skills, 런타임 프로토콜
- xAI Grok Build — plugin / skills / hooks / MCP 호스트 런타임
