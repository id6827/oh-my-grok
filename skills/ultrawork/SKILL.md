---
name: ultrawork
description: Parallel execution engine for high-throughput task completion
argument-hint: "<task description with parallel work items>"
---

<Purpose>
Ultrawork is a parallel execution engine and execution protocol for independent work. It emphasizes intent grounding, parallel context gathering, dependency-aware task graphs for non-trivial work, and concise evidence-backed execution summaries. It is a component, not a standalone persistence mode -- it provides parallelism and routing guidance, but not persistence, verification loops, or long-lived state management.
</Purpose>

<Use_When>
- Multiple independent tasks can run simultaneously
- User says "ulw", "ultrawork", or wants parallel execution
- You need to delegate work to multiple agents at once
- Task benefits from concurrent execution but the user will manage completion themselves
</Use_When>

<Do_Not_Use_When>
- Task requires guaranteed completion with verification -- use `ralph` instead (ralph includes ultrawork)
- Task requires a full autonomous pipeline -- use `autopilot` instead (autopilot includes ralph which includes ultrawork)
- There is only one sequential task with no parallelism opportunity -- delegate directly to an executor agent
- User needs session persistence for resume -- use `ralph` which adds persistence on top of ultrawork
</Do_Not_Use_When>

<Why_This_Exists>
Sequential task execution wastes time when tasks are independent. Ultrawork enables firing multiple agents simultaneously and routing each to the right model tier, reducing total execution time while controlling token costs. It is designed as a composable component that ralph and autopilot layer on top of.
</Why_This_Exists>

<Execution_Policy>
- Fire all independent agent calls simultaneously -- never serialize independent work
- Prefer omitting `model` (inherit host) on spawn_subagent; when illustrating tiers, use `model="grok-4.5"` only (safe Grok Build slug today). Do not pass Claude aliases (`haiku`/`sonnet`/`opus`) as host slugs
- Read `docs/shared/agent-tiers.md` before first delegation for agent selection guidance
- Use `run_in_background: true` for operations over ~30 seconds (installs, builds, tests)
- Run quick commands (git status, file reads, simple checks) in the foreground
- Resolve intent and uncertainty before implementation; explore first, ask only when still blocked
- For non-trivial tasks, produce a dependency-aware plan with parallel waves before execution
- Keep delegated-task reports concise: short summary, files touched, verification status, blockers
- Manual QA is required for implemented behavior, not just diagnostics
</Execution_Policy>

<Steps>
1. **Read agent reference**: Load `docs/shared/agent-tiers.md` for tier selection
2. **Ground intent first**: Confirm whether the request is implementation, investigation, evaluation, or research; do not code before that is clear
3. **Gather context in parallel**:
   - direct tools for quick reads/searches
   - exploration/docs agents for broad context
4. **Classify tasks by independence**: Identify which tasks can run in parallel vs which have dependencies
5. **Create a task graph for non-trivial work**:
   - Parallel Execution Waves
   - Dependency Matrix
   - acceptance criteria and verification steps per task
6. **Route to correct complexity tiers** (intent only; host slug is `grok-4.5` today via mapModel / OMG_MODEL_LOW|MEDIUM|HIGH):
   - Simple lookups/definitions: LOW complexity
   - Standard implementation: MEDIUM complexity
   - Complex analysis/refactoring: HIGH complexity
7. **Fire independent tasks simultaneously**: Launch all parallel-safe tasks at once
8. **Run dependent tasks sequentially**: Wait for prerequisites before launching dependent work
9. **Background long operations**: Builds, installs, and test suites use `run_in_background: true`
10. **Verify when all tasks complete** (lightweight):
   - Build/typecheck passes
   - Affected tests pass
   - Manual QA completed for implemented behavior
   - No new errors introduced
</Steps>

<Tool_Usage>
- Prefer `spawn_subagent(subagent_type="executor", prompt=...)` (omit model → inherit host)
- When an explicit slug is needed: `model="grok-4.5"` only (Grok Build host slug today)
- Complexity intent (LOW / MEDIUM / HIGH) maps via `mapModel` and env overrides `OMG_MODEL_LOW` / `OMG_MODEL_MEDIUM` / `OMG_MODEL_HIGH` when multi-model hosts exist; never pass `haiku`/`sonnet`/`opus` as host slugs
- Use `run_in_background: true` for package installs, builds, and test suites
- Use foreground execution for quick status checks and file operations
</Tool_Usage>

<Examples>
<Good>
Three independent tasks fired simultaneously:
```
// Prefer omit model (inherit). Optional explicit slug today: model="grok-4.5"
// Complexity intent: LOW / MEDIUM / HIGH → mapModel / OMG_MODEL_* when multi-model available
spawn_subagent(subagent_type="executor", prompt="Add missing type export for Config interface")
spawn_subagent(subagent_type="executor", model="grok-4.5", prompt="Implement the /api/users endpoint with validation")
spawn_subagent(subagent_type="executor", model="grok-4.5", prompt="Add integration tests for the auth middleware")
```
Why good: Independent tasks fired at once; safe Grok slugs only (or inherit).
</Good>

<Good>
Correct use of background execution:
```
spawn_subagent(subagent_type="executor", model="grok-4.5", prompt="npm install && npm run build", run_in_background=true)
spawn_subagent(subagent_type="executor", prompt="Update the README with new API endpoints")
```
Why good: Long build runs in background while short task runs in foreground.
</Good>

<Bad>
Sequential execution of independent work:
```
result1 = spawn_subagent(executor, "Add type export")  # wait...
result2 = spawn_subagent(executor, "Implement endpoint")     # wait...
result3 = spawn_subagent(executor, "Add tests")              # wait...
```
Why bad: These tasks are independent. Running them sequentially wastes time.
</Bad>

<Bad>
Claude-era host slugs:
```
spawn_subagent(subagent_type="executor", model="opus", prompt="Add a missing semicolon")
```
Why bad: `opus`/`sonnet`/`haiku` are not Grok Build host slugs. Omit model or use `model="grok-4.5"`; express LOW/MEDIUM/HIGH complexity via mapModel envs when available.
</Bad>
</Examples>

<Escalation_And_Stop_Conditions>
- When ultrawork is invoked directly (not via ralph), apply lightweight verification only -- build passes, tests pass, no new errors
- For full persistence and comprehensive architect verification, recommend switching to `ralph` mode
- If a task fails repeatedly across retries, report the issue rather than retrying indefinitely
- Escalate to the user when tasks have unclear dependencies or conflicting requirements
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] All parallel tasks completed
- [ ] Build/typecheck passes
- [ ] Affected tests pass
- [ ] No new errors introduced
</Final_Checklist>

## Parallel session caveats

- **Multi-repo workspace anchor:** drop a `.omg-workspace` marker at the parent directory so multiple sessions across sub-repos share one `.omg/`. Resolution order: `OMC_STATE_DIR > .omg-workspace > git > cwd`. See `docs/REFERENCE.md`.
- **Session id source:** OMC_SESSION_ID env var wins in CLI contexts; hook payload data.session_id wins in hook contexts.
- **Plan id (when applicable):** Ultrawork has no persistent state; two concurrent runs are independent by design. No plan-id needed.
- **Parallel verdict:** supported (stateless component)

<Advanced>
## Relationship to Other Modes

```
ralph (persistence wrapper)
 \-- includes: ultrawork (this skill)
     \-- provides: parallel execution only

autopilot (autonomous execution)
 \-- includes: ralph
     \-- includes: ultrawork (this skill)
```

Ultrawork is the parallelism layer. Ralph adds persistence and verification. Autopilot adds the full lifecycle pipeline.
</Advanced>


## Grok Capability Extensions

- On build/test failures: use `web_search` / `web_fetch` for latest fixes and community issues before inventing workarounds.
- On UI work without a design: prefer the `/ui-mockup` skill (Image Gen → Vision analysis → code → Vision QA).
- For live docs/API research: use `/web-research` or call `web_search` directly.
- Prefer `spawn_subagent` with `isolation: "worktree"` for parallel executors when mutating code.
- Persist orchestration state under `.omg/` only (never `.omc/`).
- Use `ask_user_question` for structured one-at-a-time questions (not multi-question dumps).
