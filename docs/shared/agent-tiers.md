<!-- Ported from oh-my-claudecode docs (MIT) — see NOTICE. Adapted for oh-my-grok / Grok Build. -->

# Agent Complexity Tiers Reference

This is the single source of truth for agent complexity tiers. All skill files and documentation should reference this file instead of duplicating the table.

## Host reality (Grok Build)

Grok Build currently exposes a **single coding model**: `grok-4.5` (default). Complexity tiers (LOW / MEDIUM / HIGH) still express **routing intent** — how hard the task is and which agent variant to prefer — not distinct host model IDs.

Legacy Claude-era aliases (`haiku` / `sonnet` / `opus`) map to the same tiers and resolve to `grok-4.5` by default via `src/adapters/grok/models.ts`. When more Grok slugs exist, override per tier without code changes:

| Override | Also accepted |
|----------|---------------|
| `OMG_MODEL_LOW` | `OMC_MODEL_LOW` |
| `OMG_MODEL_MEDIUM` | `OMC_MODEL_MEDIUM` |
| `OMG_MODEL_HIGH` | `OMC_MODEL_HIGH` |

Config: `.grok/omg.jsonc` or `~/.config/grok-omg/config.jsonc` → `routing.tierModels`. Set a tier to `inherit` to use the parent session model.

## Tier Matrix

| Domain | LOW | MEDIUM | HIGH |
|--------|-----|--------|------|
| **Analysis** | architect-low | architect-medium | architect |
| **Execution** | executor-low | executor | executor-high |
| **Search** | explore | - | explore-high |
| **Research** | - | document-specialist | - |
| **Frontend** | designer-low | designer | designer-high |
| **Docs** | writer | - | - |
| **Visual** | - | vision | - |
| **Planning** | - | - | planner |
| **Critique** | - | - | critic |
| **Pre-Planning** | - | - | analyst |
| **Testing** | - | qa-tester | - |
| **Security** | security-reviewer-low | - | security-reviewer |
| **TDD** | test-engineer (LOW) | test-engineer | - |
| **Code Review** | - | - | code-reviewer |
| **Data Science** | - | scientist | scientist-high |

## Model Routing Guide

| Task Complexity | Tier | Host model (default) | When to Use |
|-----------------|------|----------------------|-------------|
| Simple | LOW | `grok-4.5` (configurable) | Quick lookups, simple fixes, "What does X return?" |
| Standard | MEDIUM | `grok-4.5` (configurable) | Feature implementation, standard debugging, "Add validation" |
| Complex | HIGH | `grok-4.5` (configurable) | Architecture decisions, complex debugging, "Refactor system" |

Tier aliases accepted by the adapter: `low`/`haiku`, `medium`/`sonnet`, `high`/`opus` → same tier map (all default to `grok-4.5` today). Prefer naming tiers as LOW/MEDIUM/HIGH in new docs.

## Agent Selection by Task Type

| Task Type | Best Agent | Tier |
|-----------|------------|------|
| Quick code lookup | explore | LOW |
| Find files/patterns | explore | LOW |
| Complex architectural search | explore-high | HIGH |
| Simple code change | executor-low | LOW |
| Feature implementation | executor | MEDIUM |
| Complex refactoring | executor-high | HIGH |
| Debug simple issue | architect-low | LOW |
| Debug complex issue | architect | HIGH |
| UI component | designer | MEDIUM |
| Complex UI system | designer-high | HIGH |
| Write docs/comments | writer | LOW |
| Research docs/APIs | document-specialist | MEDIUM |
| Analyze images/diagrams | vision | MEDIUM |
| Strategic planning | planner | HIGH |
| Review/critique plan | critic | HIGH |
| Pre-planning analysis | analyst | HIGH |
| Interactive CLI testing | qa-tester | MEDIUM |
| Security review | security-reviewer | HIGH |
| Quick security scan | security-reviewer-low | LOW |
| Fix build errors | debugger | MEDIUM |
| Simple build fix | debugger (LOW) | LOW |
| TDD workflow | test-engineer | MEDIUM |
| Quick test suggestions | test-engineer (LOW) | LOW |
| Code review | code-reviewer | HIGH |
| Quick code check | code-reviewer (LOW) | LOW |
| Data analysis/stats | scientist | MEDIUM |
| Quick data inspection | scientist (LOW) | LOW |
| Complex ML/hypothesis | scientist-high | HIGH |
| Find symbol references | explore-high | HIGH |
| Get file/workspace symbol outline | explore | LOW |
| Structural code pattern search | explore | LOW |
| Structural code transformation | executor-high | HIGH |
| Project-wide type checking | debugger | MEDIUM |
| Check single file for errors | executor-low | LOW |
| Data analysis / computation | scientist | MEDIUM |
| Complex autonomous work | executor-high | HIGH |
| Deep goal-oriented execution | executor-high | HIGH |

## Usage

On Grok Build, omit `model` (inherit parent) or pass `grok-4.5`. Complexity intent is mainly expressed by **which agent** you spawn (`executor-low` vs `executor` vs `executor-high`), not by multi-Claude model IDs.

```
spawn_subagent(subagent_type="oh-my-grok:executor",
     prompt="...")
```

Optional explicit model / tier alias (all resolve to `grok-4.5` by default):

```
spawn_subagent(subagent_type="oh-my-grok:executor",
     model="grok-4.5",   // or "inherit", or legacy "sonnet"/"MEDIUM"
     prompt="...")
```

For lighter work, prefer lower-complexity **agents** when the task allows:
- LOW agents (`explore`, `executor-low`, `writer`) for simple lookups and quick fixes
- MEDIUM agents (`executor`, `debugger`) for standard implementation
- HIGH agents (`executor-high`, `architect`, `planner`) for complex reasoning tasks

## MCP Tools & Agent Capabilities

### Tool Inventory

| Tool | Category | Purpose | Assigned to Agents? |
|------|----------|---------|---------------------|
| `lsp_hover` | LSP | Get type info and documentation at a code position | NO (orchestrator-direct) |
| `lsp_goto_definition` | LSP | Jump to where a symbol is defined | NO (orchestrator-direct) |
| `lsp_find_references` | LSP | Find all usages of a symbol across the codebase | YES (`explore-high` only) |
| `lsp_document_symbols` | LSP | Get outline of all symbols in a file | YES |
| `lsp_workspace_symbols` | LSP | Search for symbols by name across the workspace | YES |
| `lsp_diagnostics` | LSP | Get errors, warnings, and hints for a file | YES |
| `lsp_diagnostics_directory` | LSP | Project-level type checking (tsc --noEmit or LSP) | YES |
| `lsp_prepare_rename` | LSP | Check if a symbol can be renamed | NO (orchestrator-direct) |
| `lsp_rename` | LSP | Rename a symbol across the entire project | NO (orchestrator-direct) |
| `lsp_code_actions` | LSP | Get available refactorings and quick fixes | NO (orchestrator-direct) |
| `lsp_code_action_resolve` | LSP | Get full edit details for a code action | NO (orchestrator-direct) |
| `lsp_servers` | LSP | List available language servers and install status | NO (orchestrator-direct) |
| `ast_grep_search` | AST | Pattern-based structural code search using AST | YES |
| `ast_grep_replace` | AST | Pattern-based structural code transformation | YES (`executor-high` only) |
| `python_repl` | Data | Persistent Python REPL for data analysis and computation | YES |

### Agent Tool Matrix (MCP Tools Only)

| Agent | LSP Diagnostics | LSP Dir Diagnostics | LSP Symbols | LSP References | AST Search | AST Replace | Python REPL |
|-------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `explore` | - | - | doc + workspace | - | yes | - | - |
| `explore-high` | - | - | doc + workspace | yes | yes | - | - |
| `architect-low` | yes | - | - | - | - | - | - |
| `architect-medium` | yes | yes | - | - | yes | - | - |
| `architect` | yes | yes | - | - | yes | - | - |
| `executor-low` | yes | - | - | - | - | - | - |
| `executor` | yes | yes | - | - | - | - | - |
| `executor-high` | yes | yes | - | - | yes | yes | - |
| `debugger` | yes | yes | - | - | - | - | - |
| `test-engineer` | yes | - | - | - | - | - | - |
| `code-reviewer` | yes | - | - | - | yes | - | - |
| `qa-tester` | yes | - | - | - | - | - | - |
| `scientist` | - | - | - | - | - | - | yes |
| `scientist-high` | - | - | - | - | - | - | yes |

### Unassigned Tools (Orchestrator-Direct)

The following 7 MCP tools are NOT assigned to any agent. Use directly when needed:

| Tool | When to Use Directly |
|------|---------------------|
| `lsp_hover` | Quick type lookups during conversation |
| `lsp_goto_definition` | Navigating to symbol definitions during analysis |
| `lsp_prepare_rename` | Checking rename feasibility before deciding on approach |
| `lsp_rename` | Safe rename operations (returns edit preview, does not auto-apply) |
| `lsp_code_actions` | Discovering available refactorings |
| `lsp_code_action_resolve` | Getting details of a specific code action |
| `lsp_servers` | Checking language server availability |

For complex rename or refactoring tasks requiring implementation, delegate to `executor-high` which can use `ast_grep_replace` for structural transformations.

### Tool Selection Guidance

- **Need file symbol outline or workspace search?** Use `lsp_document_symbols`/`lsp_workspace_symbols` via `explore` or `explore-high`
- **Need to find all usages of a symbol?** Use `lsp_find_references` via `explore-high` (only agent with it)
- **Need structural code patterns?** (e.g., "find all functions matching X shape") Use `ast_grep_search` via `explore` family, `architect`/`architect-medium`, or `code-reviewer`
- **Need to transform code structurally?** Use `ast_grep_replace` via `executor-high` (only agent with it)
- **Need project-wide type checking?** Use `lsp_diagnostics_directory` via `architect`/`architect-medium`, `executor`/`executor-high`, or `debugger`
- **Need single-file error checking?** Use `lsp_diagnostics` via many agents (see matrix)
- **Need data analysis / computation?** Use `python_repl` via `scientist` or `scientist-high`
- **Need quick type info or definition lookup?** Use `lsp_hover`/`lsp_goto_definition` directly (orchestrator-direct tools)
