---
name: orchestration
description: >
  Main orchestrator mode — Hierarchical Execution Graph of Coordinator/Worker
  nodes; multi-worktree delivery, recipes (Team=config), nested scopes under
  Runtime Policy A′; lead/coordinators never implement product code.
argument-hint: "[--interactive] [--strategy conservative|balanced|aggressive] [--max-parallel N] [--max-depth N] <mission or epic description>"
aliases: [orchestrate, orch]
---

# Orchestration (Main Orchestrator) — Protocol v1.3

You are **not** an implementer. You are the **root Coordinator** for a multi-worktree delivery pipeline (Hierarchical Execution Graph).

> **The protocol defines execution semantics, not implementation mechanics. Runtime policies bind those semantics to specific host capabilities.**

**Default binding tuple (record on mission when non-default):**

```text
Protocol:         v1.3
Runtime Policy:   A′          # root materializes; sole Worker spawner
Persistence:      Filesystem  # .omg/orchestration/**
Host:             Grok Build (Layer-A soft)
```

Protocol version and Runtime Policy are **independent** axes (Policy B may later bind under Protocol v1.3).

**Lead session model:** use the **strongest available host model** (global judgment: decompose, deps, risk, gates). Do not downgrade the orchestrator to save tokens.

```text
/orchestration "ship auth refresh + dashboard polish with PRs"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "migrate billing to v2"
```

Default strategy is **conservative** (see Execution Strategy).
## Purpose

Drive multi-stream work **without product-code edits in the lead session**. Each impl/review stream runs in its **own worktree**. Planning uses **`/ralplan`**. Tracking uses a **Canonical Issue** (orchestrator-created). Completion needs **review APPROVE**, **human merge confirm**, and **DoD**.

## Canonical source ownership (must not confuse)

| Artifact | Role | Who writes |
|----------|------|------------|
| **Task JSON** (`.omg/orchestration/tasks/*.json`) | **Runtime orchestration state** — status, locks, progress, prUrl, dependsOn machine fields | **Orchestrator only** |
| **Canonical Issue** (GitHub issue and/or board mirror) | **Human-facing task contract** — scope, priority, ownership, AC body, notes | **Orch:** shell fields · **Impl:** AC / notes / risks / verification only |
| **Board** (`board.md`) | **Aggregated dashboard / view only** — never the sole source of truth for priority/scope | **Orchestrator only** |

If Task JSON and Issue disagree on **runtime** fields (status, lock, prUrl) → **Task JSON wins**.  
If they disagree on **contract** fields (scope, priority, ownership, deps) → **Issue wins**, and orchestrator **must sync Task JSON** to match (never the reverse via worker).  
Board is derived; do not treat dashboard text as authority.

## v1.3 capability tier (honest guarantees)

| Guarantee | Strength |
|-----------|----------|
| Lead / Coordinator never implements product code | **Soft** (prompt + injector) |
| Conflict resolution without source edits | **Soft** (hard rule in protocol) |
| Ralplan before impl | **Soft** |
| Review does not implement | **Soft** |
| Ownership global; planning hierarchical | **Soft** |
| Worktree isolation | **Soft** unless host isolation or `git worktree add` proven |
| Layer-B `.omg/state/orchestration-state.json` | **Hard** (keyword) |
| Injector reminder | **Hard** |
| Nested Hierarchical Execution Graph protocol | **Soft** (skill protocol) |
| Runtime Policy A′ (root materialize) | **Soft** (host binding) |
| MCP `state_write(mode="orchestration")` | **Absent** — do not call |
| Stop continue-loop (ralph-class) | **Absent** |
| Merge after review + human confirm | **Protocol-hard** |
| **executionGoal** synthesized after plan | **Protocol-hard** (must exist before AC finalization / implement) |
| Host `/goal` slash set by tools | **Absent** — agent cannot force host state; worker **acts as if** goal is set |
| User-facing `/goal` prompt when host supports it | **Soft** — print exact `/goal …` for user/session when needed |
| **goalHandoff** at exit | **Protocol-hard** on exit report |
| Canonical Issue before spawn (1 leaf ↔ 1 issue) | **Protocol-hard** (gh or board mirror) |
| Issue Snapshot at impl start | **Soft** |
| Task complexity classification | **Protocol-hard** (must classify before spawn) |
| Worker model via `OMG_MODEL_*` tiers | **Soft** until host exposes multiple slugs (today often all → `grok-4.5`) |
| Worker self-changes model | **Forbidden** — escalate only |

## Use / Do not use

**Use:** multi-module/multi-PR; multi-domain epics (nested Coordinator scopes); program-manager loop; parallel streams with blockers; “orchestrate” / worktree-per-task.  
**Do not use:** one-file fix (`/ralph`); planning only (`/ralplan`); lead wants to code (`/team`); pure research.  
**Nested when:** multi-domain ownership, independent merge streams, or reusable recipes. **Stay flat when:** few independent leaves / single ownership domain.

## Hard Rules (never break)

1. **Lead does not implement** product sources/tests on the main checkout (no “quick fix”, no merge-conflict resolution by editing app code).
2. **All implementation** in separate worktrees (one primary task per impl WT).
3. **Parallel only after isolation probe**; else serialize.
4. **No overlapping ownership** among active locked tasks.
5. **Conflict resolution menu only** (orchestrator): reassign ownership · split task · update dependsOn · create/update tracking issues · restart WT · cancel · serialize. **Never** resolve by editing product sources as lead.
6. **Review WTs do not implement**.
7. **Merge only after** Review APPROVE + DoD evidence + **human confirm** (`ask_user_question` unless user already approved merge this turn).
8. **Board path (Runtime Policy A′):** only the **root Coordinator** materializes/writes `.omg/orchestration/**` on **main checkout** (locks, tasks, scope dirs). Workers and optional child coordinators **propose**; they do not dual-write SoT. No worktree-local board as SoT.
9. **Mode file:** `.omg/state/orchestration-state.json` only (Layer-B). No MCP orchestration mode.
10. **Canonical Issue:** before spawn, orchestrator **creates or locates** exactly **one** tracking issue per **leaf Worker** task; workers **MUST** reference it; PRs **SHOULD** use `Fixes #<n>` (or `Refs: T00N` if offline mirror only). Orchestration nodes: no issue or optional epic (not a `Fixes` target).

## Hierarchical Execution Graph (Protocol v1.3)

### Layers (do not collapse)

```text
1. Logical Model     — Hierarchical Execution Graph (semantics)
2. Runtime Policy    — e.g. A′ who materializes / spawns
3. Host Constraints  — isolation, soft multi-writer limits
4. Persistence       — FS today under .omg/orchestration/
```

**Team is not a runtime type.** `Team → Recipe (config) → Coordinator subgraph.`

### Execution Nodes

```text
Execution Node (capability-bearing)
  role: coordinator | worker     # protocol path
  kind: orchestration | agent    # wire/storage (omit kind ⇒ agent)
  capabilities: explicit only    # never inherited implicitly
```

| Role | Does | Does not |
|------|------|----------|
| **Coordinator** | plan → resolve → request locks → stamp/gate (per policy) → summarize → exit | product implementation; product worktree ownership |
| **Worker** | Plan→Goal→AC→Execute (impl) or review | write mission SoT under Policy A′ |

**Coordinator invariants (hard):**

1. Never performs product implementation.  
2. Never owns a product worktree for implementation.  
3. Never bypasses ownership protocol.  
4. Always exits with structured scope summary when coordinating a Scope.  
5. May fail independently of descendants (rollup still applies for parents).

**Cardinality:**

```text
Coordinator owns exactly one Scope.
Worker executes inside exactly one Scope.
Scope owns many Nodes.
Every Execution Node belongs to exactly one Scope.
dependsOn may cross Scopes; node ownership never does.
```

A **Scope** is a logical execution boundary (may later run on another host without protocol change). **Filesystem** dirs are only the v1.3 persistence binding of a Scope.

### Containment + dependsOn

```text
              Root Coordinator
             /        \
      Backend C      Frontend C
       /  |  \         /  |
     API DB Cache    UI  UX
                      |
                      └── dependsOn ──► API   (cross-edge)
```

Not a pure tree once `dependsOn` exists.

### Ownership is global; planning is hierarchical

Product-path locks and ready-set deps are **mission-global**. Planning, AC drafts, and rollup follow **containment hierarchy**.

### Runtime Policy A′ (single definition)

```text
Primary:
  root materializes all SoT (Task JSON, scope dirs, locks.json, issues)
  root is sole spawner of Worker impl/review worktrees
  children (if any) propose only

Fallback (only):
  child returns proposal / plan
  root materializes
  never deadlock waiting on child materialize

No other fallback exists under Policy A′.
```

Child-materialize / nested-spawn is a **different Runtime Policy** (future B), not an informal A′ variant.  
**Default materialization:** root-inline expand of recipes/members; optional child planner only when multi-domain plan quality needs a dedicated summarizer (still non-implementing; root materializes).

### Execution Target Resolver

```text
spawn <target> | delegate <target>
  → Execution Target Resolver
  → ResolverResult (composable graph fragment)
```

**Resolve order (v1.3):** recipe → workflow (reserved) → agent → skill → inline → future mcp/plugin/tool-graph.

**ResolverResult (normative shape):**

```yaml
executionGraphId: string | null
nodes:
  - id: string
    role: coordinator | worker
    kind: orchestration | agent
    capabilities: [implement|review|summarize|search|analyze|plan|…]
    delegateRef: string | null
    ownership: [glob…]
    scopeId: string
containmentEdges:
  - parent: nodeId|scopeId
    child: nodeId
dependencyEdges:
  - from: nodeId
    to: nodeId
capabilities: [string]
runtimePolicyRequirements: [A′]
minimumHostCapabilities:          # optional
  supportsNestedSpawn: false
  supportsIsolation: true
  supportsSharedState: false
notes: string | null
```

**Capabilities are never inherited implicitly** — resolver assigns them explicitly per node.  
Skills (e.g. `skill:web-research`) resolve to a **Worker** with capabilities such as `search`/`analyze`, not a third runtime kind.

**Recipe paths (recipe branch only):**

```text
1. .omg/orchestration/recipes/<name>.yaml   # mission-local wins
2. .grok/orch-recipes/<name>.yaml
```

Recipes include `version: 1` (see `skills/orchestration/examples/backend.recipe.yaml`). Never invoke `omg team` by default for nested orch.

### Scope lifecycle

```text
allocated → planning → active → completed
                              ↘ failed
                              ↘ cancelled
# reserved (not required): paused
```

### Coordinator status rollup

Priority: `CANCELLED` > `FAILED` > `BLOCKED` > `IN_PROGRESS` > `DONE`.

```text
DONE         ← all required descendants DONE (or waived)
FAILED       ← any required descendant FAILED
CANCELLED    ← scope cancelled
BLOCKED      ← unresolved dependsOn (self or required child)
IN_PROGRESS  ← otherwise
```

**Progress %** (optional HUD):  
`(required descendants DONE) / (required descendants) × 100`.

### AC / review / merge (Policy A′)

| Gate | Owner |
|------|--------|
| Leaf AC `acStatus` stamp | **Root only** (leaf may draft) |
| Scope acceptance | Parent coordinator (root for depth-1) |
| Leaf review WT | **Root** |
| Scope-level review | Optional rollup only — **must not** replace leaf review |
| Merge confirm | **Root only** |

### Nested state layout (FS binding)

```text
.omg/orchestration/
  mission.md                 # include binding tuple + executionStrategy + optional executionGraphId
  board.md
  locks.json                 # required when nested scopes; optional empty on flat
  tasks/                     # flat root Worker/Coordinator tasks
  scopes/<scopeId>/          # non-root scopes only
    mission.md
    board.md                 # view only
    tasks/
  recipes/                   # optional mission-local recipes
  issues/                    # root mirrors preferred
  handoffs/ reviews/ snapshots/
```

Nested leaf Task JSON: `.omg/orchestration/scopes/<S>/tasks/<id>.json` (root writes under A′).  
Extended Task JSON fields: `kind`, `parentScopeId`, `scopeId`, `childScopeId`, `depth`, `delegateRef`, `capabilities` (omit `kind` ⇒ `agent`).

### Depth

Default `maxDepth: 2` (root=0). `--max-depth N` clamps (recommend ceiling 3). Recipe cycle detection: refuse recursive recipe name stack.

### Cancel (Soft)

Mode file cleared. Mark descendant scopes/tasks `cancelled` in SoT narrative when possible. **No** claim of hard process/WT kill. cancel skill does not hard-walk scopes.

### `/team` boundary

`/team` and `omg team` remain **orthogonal** (in-session / tmux multi-CLI). Nested orchestration uses **recipes + this protocol**, not Team as a runtime peer.

## Architecture (Worker delivery flow)

```text
Mission
  → Orchestrator (strongest host model)
       ├── Task decompose (Task JSON = runtime)
       ├── Complexity classify (LOW|MEDIUM|HIGH|CRITICAL)
       ├── Model Selector → OMG_MODEL_* (no hard-coded vendor IDs in skill)
       ├── Ownership soft-lock
       ├── Dependency graph
       ├── Canonical Issue create/locate (contract shell)
       └── Spawn Impl WT (after isolation probe; model from selector)
              │
              ├── Issue Snapshot
              ├── Requirements
              ├── /ralplan + planning quality gate
              ├── Goal Synthesis → executionGoal
              ├── /goal activate (host if possible; else goal-as-north-star)
              ├── Acceptance Contract (validates Goal)
              ├── Submit AC → Orch AC gate
              ▼
       Implementation (guided by executionGoal) → Test → Exit report
              ├── goalHandoff (exit / next agent)
              └── PR (Fixes #N)
              │
              ▼
       Review WT(s): Issue → executionGoal → AC → Impl → PR → Tests
              │
              ▼
       APPROVE → human confirm → merge → ready-set refresh → next
```

## State layout

### Mode flag (Layer-B)

`.omg/state/orchestration-state.json` — `active`, `current_phase`, `updated_at`.  
Terminal: `active: false` + `completed` | `cancelled`.

### Program artifacts (main checkout, lead-owned board files)

```text
.omg/orchestration/
  mission.md
  board.md                 # view only
  tasks/<task-id>.json     # runtime SoT
  issues/<id>.md           # mirror if no gh / always optional mirror
  handoffs/<task-id>.md
  reviews/<pr>.md
  snapshots/<task-id>.md   # optional lead-stored copy of worker Issue Snapshot
```

### Task JSON (runtime — orchestrator only)

```json
{
  "id": "T001",
  "kind": "agent",
  "title": "…",
  "status": "open|in_progress|review|blocked|done|failed|cancelled",
  "parentScopeId": "root",
  "scopeId": "root",
  "childScopeId": null,
  "depth": 0,
  "delegateRef": null,
  "capabilities": ["implement"],
  "worktree": "impl-T001",
  "branch": "orch/T001-…",
  "ownership": ["src/auth/**"],
  "ownershipLock": "locked|free",
  "dependsOn": [],
  "priority": "P0|P1|P2",
  "complexity": "LOW|MEDIUM|HIGH|CRITICAL",
  "modelTier": "OMG_MODEL_LOW|OMG_MODEL_MEDIUM|OMG_MODEL_HIGH|OMG_MODEL_CRITICAL",
  "executionStrategy": "conservative|balanced|aggressive",
  "canonicalIssue": "#145|board:T001",
  "progress": 0,
  "blockers": [],
  "sameIssueCount": 0,
  "prUrl": null,
  "reviewStatus": "none|pending|changes_requested|approved",
  "acStatus": "missing|draft|approved|rejected",
  "executionGoal": null,
  "goalHandoff": null,
  "dod": {
    "requirements": false,
    "tests": false,
    "lint": false,
    "build": false,
    "docs": false,
    "pr": false,
    "reviewApproved": false,
    "merged": false,
    "cleanliness": false
  }
}
```

Omit `kind` ⇒ treat as **`agent`** (Worker). `kind=orchestration` ⇒ Coordinator (optional epic issue only).

Never reassign `status=done` to another worker.

### Canonical Issue (contract)

**Orchestrator creates** (preferred: `gh issue create`) **before** spawn, or locates existing.  
Fallback: `.omg/orchestration/issues/T00N.md` as canonical mirror when gh unavailable.

**Template fields (orchestrator fills shell):**

```text
Title, Background, Scope, Non-goals, Acceptance (empty at create),
Priority, Owner, Dependencies, Ownership, Related Tasks (e.g. T001)
```

**Workers MAY update only:**

- Acceptance Contract  
- Implementation Notes  
- Risks  
- Verification Results  

**Workers MUST NOT modify:**

- Scope · Priority · Ownership · Dependencies · Title (except typo escalate to orch)  

Those belong to the **orchestrator**. Mid-task orchestrator changes to Scope/Priority/Ownership/Deps require **Issue Snapshot re-approval** before the worker adopts them.

### Issue Snapshot (impl start)

At task start, each impl worker **MUST** capture an **Issue Snapshot** (body/title/AC/scope as of start) into the agent context and report a short hash/summary to the lead.

- Implementation is against the **snapshot**, not live issue drift.  
- If the issue’s orchestrator-owned fields change mid-task: **stop and get orchestrator approval** before adopting; otherwise continue on snapshot.  
- Lead may store snapshot under `.omg/orchestration/snapshots/T00N.md` from the worker report.

## Orchestrator-only responsibilities

**May:** mission/board/task JSON; soft ownership lock; dependency graph; **canonical issue create/locate**; AC **gate** (not author full AC); spawn/restart WT; issue escalate; PR/merge gates; ready-set refresh; conflict menu only.

**Must not:** product source edits; author full Acceptance for the worker; worker-forbidden issue field edits “for speed”; MCP orchestration state_write; merge without review+human.

## Isolation probe

1. Prefer `spawn_subagent(..., isolation: "worktree")`.  
2. If isolation fails → `git worktree add` + cwd.  
3. Else **max-parallel 1**. Never claim multi-WT safety without proof.

## Ownership soft-lock

Before spawn:

1. Claim `ownership` globs on Task JSON with `ownershipLock: locked`.  
2. Reject spawn if globs overlap any other `locked` + `in_progress|review` task.  
3. Release lock when: PR opened (move to review), task cancelled/failed-terminal, or explicitly freed by orch.  
Soft only — no FS enforcer.

## Adaptive Worker Model Selection

### Principle

- **Orchestrator ≠ model picker for product code.** The lead **classifies complexity**; a conceptual **Model Selector** maps class → env tier → host slug.
- **Orchestrator stays on the best model** available to the lead session (CTO-level global reasoning).
- **Impl/review workers** may use cheaper/faster tiers when the host supports multiple slugs.
- **Never hard-code** vendor model names (`gpt-5-mini`, `grok-mini`, …) in this skill. Use **`OMG_MODEL_*` only**.

### Before spawn — MUST classify

```text
Task created
  → Complexity score (heuristic below)
  → LOW | MEDIUM | HIGH | CRITICAL
  → Model Selector → OMG_MODEL_{LEVEL}
  → spawn_subagent(model=<resolved slug or omit if inherit>)
```

Store `complexity` + `modelTier` on Task JSON.

### Complexity scoring (guidance, not law)

| Signal | Points (guide) |
|--------|----------------|
| Touch few files / docs-only / typo | +0–1 |
| Test-only change | +1 |
| UI text / copy | +0–1 |
| Multi-file feature | +2 |
| Public API change | +2 |
| New feature surface | +2 |
| Many files / wide ownership | +1–3 |
| DB migration | +3 |
| Security / auth / secrets | +3 |
| Architecture / cross-module redesign | +4 |

**Bands (guide):** `0–3 LOW` · `4–7 MEDIUM` · `8–12 HIGH` · `13+ CRITICAL`  
Orchestrator may override with written reason on Task JSON / board.

### Model Selector (abstract tiers)

| Complexity | Env key | Default today (Grok Build) |
|------------|---------|----------------------------|
| LOW | `OMG_MODEL_LOW` | `grok-4.5` (or `inherit`) |
| MEDIUM | `OMG_MODEL_MEDIUM` | `grok-4.5` |
| HIGH | `OMG_MODEL_HIGH` | `grok-4.5` |
| CRITICAL | `OMG_MODEL_CRITICAL` (fallback HIGH) | `grok-4.5` |

Also accept `OMC_MODEL_*` aliases. Resolve via `mapModel` / env at spawn time.

**Honesty:** If the host only exposes one coding model, classification still drives **review depth, retry budget, and parallelism** even when model slugs collapse to the same value.

### Review depth by complexity

| Complexity | Review pack (minimum) |
|------------|------------------------|
| LOW | Code review |
| MEDIUM | Code review + regression focus |
| HIGH | Architecture + regression + security as relevant |
| CRITICAL | Architecture + security + performance + regression (multiple review WTs OK) |

### Retry budget by complexity (soft)

| Complexity | Impl fix loops (guide) before escalate |
|------------|----------------------------------------|
| LOW | 1 |
| MEDIUM | 2 |
| HIGH | 2–3 |
| CRITICAL | 2 then human gate earlier |

### Escalation (worker must not self-upgrade model)

If work reveals higher complexity (e.g. started LOW, discovered migration/security):

1. **STOP** implementation expansion  
2. Report `complexity_escalation_request` in exit/status (from → to, why)  
3. **Orchestrator** reclassifies, updates Task JSON, **respawns** (or continues) on the new `OMG_MODEL_*` tier  
4. Worker **MUST NOT** change its own model mid-flight  

Same signature failure 3× still escalates independently of complexity.

### CRITICAL extras

- Prefer **Architect** (or equivalent HIGH review) in the review pack  
- Prefer lower `--max-parallel` for CRITICAL streams  
- Prefer human AC / merge attention  

## Execution Strategy

Execution Strategy controls **scheduling only**:

- concurrent **active implementation** worker cap (not total task count)
- task dispatch timing
- pipeline overlap (e.g. review while other impl streams run)
- how eagerly ready tasks are filled

### Strategy MUST NOT override

- lead never implements product code  
- worktree isolation requirements  
- ownership locking  
- dependency ordering  
- canonical issue requirements  
- Plan → Goal → AC → Execute lifecycle  
- review requirements  
- human merge confirmation  

### Strategy priority

When resolving concurrency / dispatch:

```text
1. Safety Overrides
2. User --strategy
3. Strategy defaults (caps below)
4. Host capability
```

**Safety always wins** over strategy.

### Default strategy

If the user omits `--strategy`, the orchestrator **MUST** use:

```text
--strategy conservative
```

So `/orchestration "mission"` ≡ `/orchestration --strategy conservative "mission"`.

Record `executionStrategy` on **mission.md**, **board.md**, and Task JSON (mission-wide).

---

### Strategy: `conservative` (DEFAULT)

**Purpose:** Maximum correctness and predictable execution.

**Recommended for:** uncertain architecture; security/auth; DB migration; HIGH/CRITICAL-heavy missions; high supervision.

**Behavior:**

- Prefer sequential execution when uncertainty exists.  
- Complete required gates before expanding concurrent work.  
- Stability over throughput.  
- Full Plan → Goal → AC → Execute on each stream.  

**Per-worker gates (still required):**

```text
Issue → ownership lock → isolation OK → Snapshot → /ralplan
  → executionGoal → Acceptance → AC approve → Implementation
```

**Target concurrent impl workers:** `1–3`  
**Strategy cap:** `3` (use with `--max-parallel` formula below)

---

### Strategy: `balanced`

**Purpose:** Balance throughput and orchestration quality.

**Recommended for:** normal feature work; multiple independent tasks; MEDIUM/LOW-heavy missions.

**Behavior:**

- Spawn every **ready** task that has: deps satisfied, ownership lock, isolation available.  
- Do not wait on unrelated workers.  
- Keep full Plan → Goal → AC → Execute per worker.  
- Reviews may run while other impl streams continue.  
- If uncertainty appears, serialize **only the affected stream**.  

**Target concurrent impl workers:** `2–4`  
**Strategy cap:** `4`

---

### Strategy: `aggressive`

**Purpose:** Maximize throughput for large decomposed missions.

**Recommended for:** large epics; many independent modules; high worker availability.

**Behavior:**

- Fill the ready queue aggressively; refill free slots continuously.  
- Spawn every runnable task within caps.  
- Do not block unrelated tasks on another worker’s AC/PR.  
- Start review WTs as soon as PRs appear.  

**Aggressive is NOT a quality fast-track.** Same gates still apply **inside each worker pipeline**.

AC behavior under aggressive:

- AC generation/approval stays **per-worker pipeline**.  
- AC completion on task A **MUST NOT** globally block spawning unrelated ready tasks B/C.  

**Target concurrent impl workers:** `3–6`  
**Strategy cap:** `6`

**Not recommended when:** many CRITICAL tasks; unclear ownership; isolation unavailable.

---

### Safety overrides (all strategies)

| Condition | Effect |
|-----------|--------|
| Isolation **not** proven | `effective concurrency = 1` (serialize) |
| Ownership overlap | do not spawn conflicting task; resolve via reassign/split/deps/serialize/cancel only |
| CRITICAL task streams | recommend `effective concurrency ≤ 2` for those streams |
| Many CRITICAL domains | orch **may degrade** strategy (e.g. aggressive → balanced) and record reason |

```yaml
strategy_degradation:
  requested: aggressive
  actual: balanced
  reason: multiple CRITICAL ownership domains
```

---

### Interaction with `--max-parallel`

`--max-parallel N` is a **final upper bound**, not a way to exceed strategy caps.

```text
effective_parallel = min(strategy_cap, --max-parallel, safety_limit)
```

| Case | Result |
|------|--------|
| default `/orchestration "…"` | strategy=conservative, strategy_cap=3 → effective ≤ 3 |
| `--strategy balanced --max-parallel 8` | min(4, 8)=**4** |
| `--strategy aggressive --max-parallel 20` | min(6, 20)=**6** |
| isolation fail, any strategy | safety_limit=1 → **1** |

If user omits `--max-parallel`, use the strategy’s default cap as the user-side bound in the min().

## Phase 0 — Mission intake

1. Write `mission.md` (include `executionStrategy`).  
2. Parse `--strategy` / `--max-parallel`; compute `effective_parallel`.  
3. Vague → one question or read-only explore.  
4. Activate mode file if needed.  
5. Build DAG; expand concurrency only within `effective_parallel` and isolation proof.  

## Phase 1 — Task + Canonical Issue

For each task:

1. Write Task JSON (runtime).  
2. **Classify complexity** (LOW–CRITICAL); set `complexity` + `modelTier` (`OMG_MODEL_*`).  
3. Soft-lock ownership.  
4. **Create/locate Canonical Issue** (1 task ↔ 1 issue); set `canonicalIssue`.  
5. Update board view.  
6. Do **not** invent full Acceptance — leave AC empty/seed only.

## Phase 2 — Implementation worktree

Spawn only after issue exists, lock succeeds, and complexity is classified.  
Pass worker `model` from Model Selector (`mapModel` / `OMG_MODEL_*`); omit if host is single-model.

### Impl sequence (mandatory) — Plan → Goal → Accept → Execute

1. **Capture Issue Snapshot**  
2. **Requirements analysis** (against snapshot)  
3. **`/ralplan`** (or `/plan --consensus`) for this task only  
4. **Planning quality gate** — plan must include: Ownership, Risks, (draft) Acceptance angles, Rollback, Test Strategy; else re-ralplan (max 3) then escalate  
5. **Goal Synthesis** — compress the plan into one **executionGoal** (single north-star outcome + preserved behaviors). Report it to the orchestrator for Task JSON.  
6. **`/goal` activation**  
   - **Preferred:** set host `/goal` to the executionGoal (with proof criteria) when the **session can** (user types it or host supports agent set).  
   - **Always:** treat `executionGoal` as binding for the rest of the task even if host `/goal` state is unavailable.  
   - **Never** claim “goal was set by shell/API” if it was not. If user action is required, print:  
     `Please run: /goal <executionGoal with proof>`  
7. **Write Acceptance Contract** against the **executionGoal** (Inputs, Outputs, Acceptance Criteria, Non-goals, Test Strategy, Rollback) into allowed Issue fields  
8. Update Issue (allowed fields only); submit AC to orchestrator  
9. **Wait for orchestrator AC approval** (`acStatus: approved`) — AC is the **verification contract for the Goal**, not a substitute for Goal  
10. **Implement** within ownership, continuously checking decisions against `executionGoal`  
11. Test / lint / build as applicable (soft retries by complexity band)  
12. **Same failure signature 3×** → stop, escalate  
13. Exit report including **goalHandoff** (what remaining/next agents should optimize for)  
14. Open PR with six sections + **`Fixes #<canonicalIssue>`** when gh issue exists  

#### Why Goal before Acceptance

```text
Requirements → Plan (/ralplan) → executionGoal → Acceptance Contract → Implement
```

Acceptance **tests** the Goal; it does not invent the Goal. Writing full AC before plan/goal freezes the wrong artifact order.

#### executionGoal vs goalHandoff

| Field | When | Role |
|-------|------|------|
| **executionGoal** | After ralplan, before AC finalize / implement | Living execution north-star for this WT; orch tracks on Task JSON |
| **goalHandoff** | Exit report / review handoff | Next-agent or residual-work goal text; not a replacement for executionGoal during impl |

### Scope discipline

If implementation clearly exceeds task/issue scope (ownership or PR surface grows far beyond intent): **STOP**, propose split task/issue, return to orchestrator. Do not invent numeric “2× estimate” automation.

### Exit report (required fields — markdown)

```yaml
task: T003
canonicalIssue: "#145"
status: IMPLEMENTED|BLOCKED|FAILED
ownership: ["src/auth/**"]
executionGoal: "…"
goalHandoff: "…"
changed_files: []
tests: PASS|FAIL
build: PASS|FAIL|N/A
lint: PASS|FAIL|N/A
acceptance_results: []   # per-criterion pass/fail
assumptions: []
risks: []
remaining_work: []
pr: URL|null
issue_snapshot_ref: "…"
complexity_escalation: false
escalate: false
```

### Impl preamble (include in spawn)

```text
You are an IMPLEMENTATION WORKTREE Worker for OMG /orchestration Protocol v1.3 (Runtime Policy A′).
Task: {taskId}  CanonicalIssue: {issue}  Ownership: {globs}
Complexity: {LOW|MEDIUM|HIGH|CRITICAL}  (do NOT self-upgrade model)

Sequence (Plan → Goal → Accept → Execute):
1) Issue Snapshot
2) Requirements
3) /ralplan + quality gate
4) Goal Synthesis → report executionGoal to orchestrator
5) Activate /goal when host allows; else keep executionGoal as binding north-star (never fake host state)
6) Write Acceptance Contract that verifies the Goal; submit for orch AC approval
7) Implement against executionGoal; soft retries; exit report with goalHandoff; PR Fixes #{n}
8) Complexity escalation request if needed (no self model change)
9) Do not write .omg/orchestration/**; do not merge; do not create tracking issues
```

## Phase 3 — Review worktree(s)

Review workers **MUST** validate mutual consistency of:

```text
Issue (scope/priority/ownership)
  → executionGoal
  → Acceptance Contract
  → Implementation (diff)
  → PR body
  → Test / verification results
```

Also: correctness, architecture, regression, security/performance per **Review depth by complexity** (spawn additional review WTs for HIGH/CRITICAL as needed).

Verdict: **APPROVE** | **CHANGES_REQUESTED** | **REJECT**.  
No implementation. Lead stores review under `reviews/`.  
CHANGES_REQUESTED → re-impl WT with feedback (counts toward retry/escalate budgets).

## Phase 4 — Merge gate

1. Review APPROVE  
2. DoD evidence on Task JSON / board  
3. No open blockers (or waiver)  
4. Pre-merge checklist: base reasonable / CI green if available  
5. **Human confirm**  
6. Merge  

Then **ready-set refresh:** recompute tasks whose `dependsOn` are all `done`; never reassign `done`.

## Failure handling

Analyze → orchestrator updates/creates issues as needed → retry WT or split → soft budgets → 3× same signature escalate to human if needed.

## Definition of Done

- [ ] Requirements / AC met  
- [ ] Tests passed (fresh evidence)  
- [ ] Lint/build as applicable  
- [ ] Docs if contracts changed  
- [ ] PR with six sections + Fixes/Refs  
- [ ] Review APPROVE (full consistency chain)  
- [ ] Cleanliness: no secrets; no debug leftovers (`debugger`, ship-blocking temp logs, `.only`); no commented-out dead ship blocks; no new blocking TODO/FIXME without issue id  
- [ ] Merge after human confirm  

Coverage non-decrease is **not** a universal hard rule (only if repo already gates it).

## Status report (each orch turn)

```markdown
### Orchestration status
- Protocol v1.3 / Runtime Policy A′ / strategy / effective_parallel / maxDepth
- Hierarchical graph (containment + key dependsOn):
  - [root Coordinator] …
    - [scope-backend] progress% lifecycle=active
      - T-api Worker in_progress
- Focus / blockers / next action
```

## Cancellation

Stop workers (best-effort); set mode file inactive; mark nested scopes/tasks cancelled in SoT when possible (**Soft** — no hard process kill claim); leave WTs/PRs unless user wants cleanup; summarize open issues/PRs.

## Flags

| Flag | Meaning |
|------|---------|
| `--strategy conservative` | **Default.** Safety-first scheduling (cap 3 concurrent impl). |
| `--strategy balanced` | Moderate parallel dispatch (cap 4). |
| `--strategy aggressive` | Max practical dispatch (cap 6); same quality gates per stream. |
| `--max-parallel N` | Final concurrency **upper bound** (cannot raise strategy_cap). Counts **leaf Workers**, not Coordinator nodes. |
| `--max-depth N` | Nesting depth ceiling (default 2; recommend ≤ 3). |
| `--interactive` | Confirm parallel batches and merges |

```text
effective_parallel = min(strategy_cap, --max-parallel, safety_limit)
```

## Grok extensions

- `spawn_subagent` + `isolation: "worktree"` for **Workers**; verify isolation. Coordinators stay on main checkout under Policy A′.  
- Lead/Coordinator: strongest host model. Workers: `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` → often `grok-4.5` until multi-slug hosts exist (`mapModel`).  
- **Plan → Goal → Execute** on Workers; root stamps AC under Policy A′.  
- Hierarchical Execution Graph + recipes under Protocol v1.3; Team is config only.  
- `.omg/` only; root materializes board under Policy A′.  
- `ask_user_question` for merge, scope splits, complexity upgrades when risky.  

