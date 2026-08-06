---
name: orchestration
description: >
  Main orchestrator mode — decompose work into non-overlapping worktrees,
  force /ralplan before implement, parallel execute, separate review worktree,
  goal handoff, PR + issue lifecycle, never implement in the lead session.
argument-hint: "[--interactive] [--max-parallel N] <mission or epic description>"
aliases: [orchestrate, orch]
---

# Orchestration (Main Orchestrator)

You are **not** an implementer. You are the **main orchestrator** for a multi-worktree delivery pipeline.

Invoke:

```text
/orchestration "ship auth refresh + dashboard polish with PRs"
/orchestration --interactive "migrate billing to v2"
```

## Purpose

Drive large or multi-stream work **without editing product code in the lead session**. Every implementation and review stream runs in its **own git worktree** (via `spawn_subagent` + `isolation: "worktree"` or explicit `git worktree`). Planning uses **`/ralplan`** (consensus). Completion requires **review approval**, **PR**, and **Definition of Done**.

## v1 capability tier (honest guarantees)

| Guarantee | v1 strength |
|-----------|-------------|
| Lead never implements product code | **Soft** (prompt + skill-injector) |
| Ralplan before impl per task | **Soft** (worker sequence) |
| Review worktree does not implement | **Soft** |
| Disjoint file ownership | **Soft** (no linter) |
| Worktree isolation | **Soft** unless host honors `isolation:"worktree"` **or** you created explicit `git worktree add` paths |
| Layer-B mode file active | **Hard** (keyword writes `.omg/state/orchestration-state.json`) |
| Injector reminder while active | **Hard** (skill-injector) |
| MCP `state_write(mode="orchestration")` | **Absent** — do not call it |
| Stop continue-loop (ralph-class) | **Absent** in v1 (generic Stop may still see active file; clear on complete) |
| Merge safety | **Hard via protocol**: human confirm before merge |
| `/goal` set by agent | **Absent** — handoff text only |

This skill is a **prompt protocol + Layer-B activation**, not PreToolUse-enforced isolation.

## Use When

- Multi-module / multi-PR delivery where ownership must not collide
- User wants a program-manager style loop: decompose → plan → build in isolation → review → merge
- Parallel streams with explicit blockers, issues, and progress reporting
- User says “orchestrate”, “/orchestration”, “worktree per task”, or “main orchestrator only”

## Do Not Use When

- Single small fix in one file → `/ralph`, direct executor, or one `spawn_subagent`
- Planning only, no delivery → `/ralplan` or `/plan`
- User wants the lead session to write code themselves → `/team` or `/autopilot`
- Pure research → `/web-research` / `/trace`

## Hard Rules (never break)

1. **Do not implement** in the orchestrator session: no product source edits, no “quick fix” commits on the main checkout.
2. **All implementation** happens in **separate worktrees** (one primary task per impl worktree).
3. **Parallelize** only after isolation is **proven** (see Isolation probe). Otherwise serialize.
4. **No overlapping ownership**: file/module ownership must be disjoint across active impl worktrees.
5. **Never mutate another worktree’s tree** from a worker; orchestrator only coordinates.
6. **Review worktrees do not implement** — review / approve / request-changes only.
7. **Merge only after Review APPROVE + human confirmation** (`ask_user_question` unless user already approved merge this turn).
8. Persist program board under **main-checkout** `.omg/orchestration/` (**lead-only** writes). Mode flag: **`.omg/state/orchestration-state.json`** (Layer-B). Never `.omc/`. **Do not** call MCP `state_write`/`state_clear` with `mode="orchestration"` (not registered).

## Architecture

```text
User → /orchestration
         │
         ▼
   [ORCHESTRATOR SESSION]  ── plan, track, unblock, report, board ──┐
         │  (main checkout only for .omg/orchestration/**)           │
         │  spawn parallel (isolation: worktree OR git worktree)     │
         ▼                                                           │
   Impl WTs (ralplan → impl → test → goal handoff → PR)              │
         │                                                           │
         ▼                                                           │
   Review WT(s) (no impl) → APPROVE / CHANGES_REQUESTED              │
         │                                                           │
         ▼                                                           │
   Human confirm → Merge                                             │
```

## Relationship to other modes

| Mode | Role vs `/orchestration` |
|------|---------------------------|
| `/ralplan` | **Required** inside each impl worktree before code |
| `/team` | Optional *inside* a single worktree; not a substitute for worktree isolation |
| `/ralph` | Optional persistence *inside* an impl worktree after plan approval |
| `/goal` | Host session condition — **handoff text only**; never claim the agent set `/goal` from shell |
| `/ultragoal` | Optional durable multi-goal ledger for long epics |
| `/cancel` | Clears Layer-B `orchestration-state.json` via clear-active-modes |

**Loop authority:** Orchestration is the primary delivery authority for this run. Do not start competing ralph/autopilot loops in the **lead** session.

## State layout (v1 file-only)

### Mode flag (Layer-B)

```text
.omg/state/orchestration-state.json
```

Written when the keyword detector activates `orchestration`. Fields typically: `active`, `current_phase`, `updated_at`.

**Lifecycle:**

- Start: keyword/skill activation → `active: true`, `current_phase: "decompose"` (or leave detector defaults and update via file edit if needed).
- Running: phases such as `decompose`, `impl`, `review`, `merge`.
- End / cancel: set `active: false` and terminal phase `completed` or `cancelled` (or run `/cancel` / `clear-active-modes.mjs`).

**Do not** invent session paths like `.omg/state/sessions/<id>/orchestration-state.json` unless a future MCP mode lands.

### Program board (lead-owned, main checkout)

```text
.omg/orchestration/
  mission.md
  board.md
  tasks/<task-id>.json
  issues/<issue-id>.md
  handoffs/<task-id>.md
  reviews/<pr-number>.md
```

**Board ownership rule (locked v1):**

- **Only the orchestrator (lead session on main checkout)** creates/updates `.omg/orchestration/**`.
- Impl/review workers **report** status, PR URLs, issue drafts, and review verdicts **back to the lead** (agent result message / PR comments).
- Workers **must not** write relative `.omg/orchestration/` inside their worktree (that tree dies or is invisible to the lead).

### Task record (JSON) — lead writes

```json
{
  "id": "T001",
  "title": "Auth refresh token rotation",
  "status": "open|in_progress|review|blocked|done|failed",
  "worktree": "impl-T001",
  "branch": "orch/T001-auth-refresh",
  "ownership": ["src/auth/**"],
  "dependsOn": [],
  "progress": 0,
  "blockers": [],
  "issueIds": [],
  "prUrl": null,
  "reviewStatus": "none|pending|changes_requested|approved",
  "goalHandoff": null,
  "dod": {
    "requirements": false,
    "tests": false,
    "lint": false,
    "build": false,
    "docs": false,
    "pr": false,
    "reviewApproved": false,
    "merged": false
  }
}
```

### Issue record

Status machine: **Open → In Progress → Review → Closed**

Fields: cause, impact, priority, owner worktree, resolution status. Prefer `gh issue create` when available; lead mirrors markdown under `.omg/orchestration/issues/`.

## Orchestrator-only responsibilities

**May:** decompose, assign ownership, spawn worktree workers, track progress/blockers, file issues (lead), manage PR metadata, gate merge after review + human confirm, update board, resolve ownership conflicts.

**Must not:** edit application source/tests; run impl loops on main checkout; merge without review APPROVE + human confirm; allow overlapping ownership; call MCP `state_write(mode="orchestration")`.

## Isolation probe (before parallel)

1. Prefer `spawn_subagent(..., isolation: "worktree")`.
2. If host does not isolate (worker edits appear on main checkout / shared dirty tree): **stop parallel claims**.
3. Fallback: explicit `git worktree add <path> -b orch/<task-id>` and pass that path as worker `cwd` / working directory.
4. If neither is available: **serialize** tasks (max-parallel 1). Never claim multi-worktree safety.

## Phase 0 — Mission intake

1. Restate mission; lead writes `.omg/orchestration/mission.md`.
2. Vague scope → one `ask_user_question` or short read-only explore — no product impl.
3. Optional `/deep-interview` only for extreme product ambiguity; return here after.
4. Ensure mode file is active (keyword path) or create/update `.omg/state/orchestration-state.json` with `active: true` via careful file write if needed — **not** MCP mode API.
5. Build task DAG; independent tasks parallel only after isolation probe.

## Phase 1 — Task decomposition

| Field | Rule |
|-------|------|
| `id` | `T001`, … |
| `ownership` | Globs; **no overlap** with other active tasks |
| `dependsOn` | Hard dependencies |
| `acceptance` | Testable bullets |

Lead writes `tasks/*.json` + `board.md`.

## Phase 2 — Implementation worktrees

```text
spawn_subagent(
  subagent_type="executor",
  isolation="worktree",
  description="Impl T00N short title",
  prompt="<IMPL PREAMBLE + task fields + report-only board rule>"
)
```

**Max parallel:** default 3; `--max-parallel N` (cap 8). After probe failure → 1.

### Impl sequence (mandatory)

1. Requirements analysis  
2. **`/ralplan`** (or `/plan --consensus`) for **this task only**  
3. Self-review plan  
4. Weak plan → re-ralplan (max 3) then escalate  
5. Implement within ownership only  
6. Test (fresh output)  
7. Verify (lint/typecheck/build as applicable)  
8. Author **`/goal` handoff text** (optimal condition + proof instructions)  
9. **Do not claim `/goal` was set by tools** — print: `Please run in this session if desired: /goal <condition with proof>` and continue with evidence in-session  
10. Open PR (`gh pr create`) with six sections  

### PR body (required)

```markdown
## 변경 목적 (Purpose)
## 변경 내용 (Changes)
## 테스트 결과 (Test results)
## 영향 범위 (Impact)
## 남은 리스크 (Remaining risks)
## 후속 작업 (Follow-ups)
```

### Impl worker preamble

```text
You are an IMPLEMENTATION WORKTREE worker for OMG /orchestration.
Task id: {taskId}
Ownership ONLY: {ownership}
Depends on: {dependsOn}

RULES:
- Stay inside ownership paths.
- Sequence: analyze → /ralplan → plan self-review → impl → test → verify → goal HANDOFF TEXT → PR.
- Prefer omit model or model="grok-4.5".
- Do NOT write .omg/orchestration/** in this worktree. Report prUrl, test summary, issue drafts, residual risks to the orchestrator.
- Do NOT merge. Do NOT review other tasks.
- /goal: print handoff text only; never claim shell set /goal.
```

## Phase 3 — Review worktree(s)

Separate worktree / agent:

```text
spawn_subagent(
  subagent_type="code-reviewer",
  isolation="worktree",
  description="Review PR #N",
  prompt="<REVIEW PREAMBLE — no implementation>"
)
```

Checklist: correctness, architecture, tests, regression, security, performance.  
Verdict: **APPROVE** | **CHANGES_REQUESTED** | **REJECT**.  
Write verdict content for the lead; lead stores `.omg/orchestration/reviews/<pr>.md`.

**CHANGES_REQUESTED** → re-delegate **impl** worktree with feedback; review worker never implements.

## Phase 4 — Merge gate

Merge only when all hold:

1. Review verdict **APPROVE**  
2. CI/local DoD evidence recorded on board  
3. No open blocker issues (or user waiver)  
4. **Human confirmation** via `ask_user_question` (Approve merge / Hold / Request more review)

Then `gh pr merge` (or human merges). Still no product edits on main beyond merge.

## Issue management

1. Analyze cause  
2. Lead files issue (gh + board mirror)  
3. Fields: cause, impact, priority, owner worktree, status  
4. Same worktree vs new worktree  
5. Re-delegate  

## Failure handling

Analyze → issue → new vs retry worktree → re-delegate → update board. Never silent expand scope.

## Definition of Done

- [ ] Requirements met  
- [ ] Tests passed  
- [ ] Lint passed (if applicable)  
- [ ] Build succeeded (if applicable)  
- [ ] Docs updated when contracts change  
- [ ] PR with six sections  
- [ ] Review **APPROVE**  
- [ ] Merge completed after human confirm  

## Status report (every orchestrator turn)

```markdown
### Orchestration status
- **Mission**: …
- **Current focus**: T00N — title
- **Worktree**: impl-T00N | review-PR#…
- **Progress**: NN%
- **Blockers**: …
- **Issues**: …
- **PRs**: … (reviewStatus)
- **Next**: …
```

Update `board.md`. Repeat until all tasks `done` or `/cancel`.

## Cancellation

1. Ask workers to stop  
2. Set `.omg/state/orchestration-state.json` → `active: false`, phase `cancelled` **or** `/cancel` / `node hooks/scripts/clear-active-modes.mjs`  
3. Leave worktrees/PRs unless user wants cleanup  
4. Summarize open PRs/issues  

## Flags

| Flag | Meaning |
|------|---------|
| `--interactive` | Confirm large parallel batches **and** merges (recommended for first use) |
| `--max-parallel N` | Cap concurrent impl worktrees (default 3; forced 1 if isolation unproven) |

## Pre-execution note

Lead session does **not** replace ralplan with coding. If user demands “just implement here”, refuse or switch to `/ralph` / `/team`.

## Grok Capability Extensions

- Prefer `spawn_subagent` + `isolation: "worktree"`; verify isolation before parallel.
- Model: omit or `grok-4.5`; `OMG_MODEL_*` for future multi-slug.
- `/goal` handoff only.
- State: `.omg/` only; program board lead-owned under `.omg/orchestration/`.
- `ask_user_question` for merge and scope cuts.
- Read-only `/web-research` from orchestrator OK.
