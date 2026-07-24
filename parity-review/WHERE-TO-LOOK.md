# 에이전트 / 팀 / tmux 보는 법 (parity-review 이어하기)

## 리포트 위치 (안 보이는 문제)

| 경로 | 설명 |
|------|------|
| `.omg/artifacts/parity-review/2026-07-25/REPORT.md` | canonical (`.omg/**` gitignore → 일부 IDE에서 숨김) |
| `parity-review/REPORT-2026-07-25.md` | **IDE에서 보이는 복사본** |
| `parity-review/TEAM-LIVE-CHECKLIST.md` | live team 증거 |
| 이 파일 | 관찰 포인트 안내 |

---

## 질문 답: `/autopilot`이 에이전트·스킬을 쓰는가?

**둘 다 구현되어 있고, 모드에 따라 보이는 곳이 다릅니다.**

### 1) 기본: `execution: "solo"` (in-session)
- Grok Build **`spawn_subagent`** 로 서브에이전트 생성
- 스킬은 프롬프트/라우팅으로 로드 (`/ralph`, `/plan`, skill 카탈로그)
- **tmux 창이 생기지 않음** → OMC처럼 옆 패널에 안 보이는 게 정상
- 관찰: 메인 세션 로그, HUD `agents:N`, `.omg/state/autopilot-state.json`

### 2) 지금 설정: `execution: "team"` (`.grok/omg.jsonc`)
- 실행 단계를 **`omg team` CLI 워커**로 넘김
- 워커는 **tmux 세션**에 뜸 (`omg-omg-team-<name>`)
- 관찰: 아래 “보는 곳” 참고

설정 확인:
```bash
cat .grok/omg.jsonc   # autopilot.execution == "team"
```

---

## 보는 곳 (실제 관찰 포인트)

```bash
# 1) 팀 상태
node bin/omg.js team status
# 또는
cat .omg/state/team-state.json

# 2) tmux 목록 (OMC 스타일 패널의 본체)
tmux ls
# 예: omg-omg-team-grok-xxxxx

# 3) 붙어서 보기 (여기가 "작업 중 화면")
tmux attach -t omg-omg-team-grok-xxxxx
# 나가기: Ctrl-b 다음 d (detach)

# 4) 붙이지 않고 스냅샷만
tmux capture-pane -t omg-omg-team-grok-xxxxx -p

# 5) HUD 한 줄
node bin/omg.js hud
# 예: team:omg-team-grok-z8fvii(1xgrok)

# 6) 하트비트 / 플랜
ls .omg/state/team-bridge/<team-name>/
```

### 서브에이전트 vs 팀 워커 판단

| 신호 | in-session 서브에이전트 | omg team 워커 |
|------|-------------------------|---------------|
| `team-state.json` active | 없음 / false | `active: true`, workers[] |
| `tmux ls` 에 `omg-omg-team-*` | 없음 | 있음 |
| HUD `team:…` | 보통 없음 | `team:name(Nxagent)` |
| HUD `agents:N` | 증가할 수 있음 | 팀과 별개 카운트일 수 있음 |
| Grok UI 패널 | 세션 내부 툴 호출 | **자동으로 안 뜸 → tmux attach** |

---

## OMC처럼 안 보이는 이유

- OMC(Claude Code)는 호스트 UI/팀 표면이 다름.
- OMG **프로세스 팀**은 **tmux 기반**이라, Grok 채팅 창 옆에 자동으로 워커 패널이 뜨지 않음.
- **미구현이 아니라 관찰 채널이 다름**: `tmux attach` / `team status` / `hud` 가 정상 경로.
- 이 머신에서 live 검증 성공 예:
  - team `omg-team-grok-z8fvii`, tmux `omg-omg-team-grok-z8fvii`, `dry_run: false`
  - HUD: `team:omg-team-grok-z8fvii(1xgrok)`

---

## 직접 재현 (짧게)

```bash
cd /Users/sa/orca/projects/oh-my-grok-parity-review
node bin/omg.js team 1:grok "echo hello && sleep 5 && echo done"
node bin/omg.js team status
tmux ls
tmux attach -t "$(python3 -c 'import json;print(json.load(open(\".omg/state/team-state.json\"))[\"tmux_session\"]')"
# 확인 후
node bin/omg.js team shutdown
```
