# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**Orchestration multi-agents pour [Grok Build](https://x.ai) / Grok CLI.**

Port de [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) vers Grok, avec extensions natives : **recherche web/X temps réel**, **mockups Image Gen**, **Vision UI QA**.

| | |
|--|--|
| **Version OMG** | `0.9.0-rc.1` |
| **Racine d’état** | `.omg/` (jamais `.omc/`) |
| **Pin OMC** | `4.15.7` @ `41a4c0f` |
| **Portes produit** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Parité** | **Near-complete** (pas un clone 100 % de l’hôte Claude) |

> N’apprenez pas le harness. Utilisez OMG.

### État (2026-07)

| Axe | État |
|------|--------|
| Inventaire modules | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Sous-ensemble Grok | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | même protocole qu’OMC ; outils renommés pour Grok |

Contrôles optionnels : `npm run test:optional`.

---

## Pin source OMC (point de contrôle)

OMG suit un **commit OMC figé** pour les re-diffs. Détail : [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Champ | Valeur |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Version épinglée** | **`4.15.7`** |
| **Commit épinglé** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Sujet** | `chore: promote dev to main for v4.15.7 release` |
| **Date** | 2026-07-23 04:44:59 +0000 |
| **Forme courte** | `4.15.7` @ `41a4c0f` |

Pour monter OMC volontairement :

1. Checkout/cache du nouvel arbre upstream.
2. Enregistrer `version` + HEAD dans `docs/OMC-SOURCE.md`.
3. Relancer `port-inventory.mjs` et mettre à jour `docs/OMC-PORT-STATUS.md`.
4. Diff OMG contre l’**ancien pin** (`41a4c0f…`), puis avancer le pin.

Cache local : `~/.grok/marketplace-cache/*` avec `oh-my-claude-sisyphus@4.15.7`.

---

## Installation

```bash
# GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# Local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Vérifier:

```bash
grok plugin details oh-my-grok
grok inspect
```

Dans une session Grok :

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/orchestration --strategy balanced "ship auth + dashboard polish with PRs"
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Pipeline recommandé

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  single-mission implement → QA → validate
   or
/orchestration   →  multi-stream worktrees → review gates → merge
```

Annulez avec `/cancel`. État sous **`.omg/`**. Idées floues → `/deep-interview`. Spec prête → `/ralplan` puis approbation explicite. Livraison multi-stream avec worktrees isolés, issues canoniques et portes de review → `/orchestration`. UI sans design → `/ui-mockup`. Inconnues écosystème → `/web-research`.

---

## `/orchestration` (Protocol v1.3 — livraison multi-worktree)

### Nested model (Protocol v1.3)

> Protocol defines execution semantics; Runtime Policy binds them to the host.

**Binding:** Protocol v1.3 · Policy **A′** (root materializes / sole Worker spawner) · Team = **recipe** (not a runtime type) · Hierarchical Execution Graph (containment + `dependsOn`).

```text
Root Coordinator → Coordinator (e.g. backend recipe) → Workers
omit kind ⇒ agent; ownership global; planning hierarchical
```

Full protocol: [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).


**Le lead n’implémente jamais le code produit.** Il décompose la mission, crée les artefacts de suivi, lance des **worktrees d’implémentation**, des **worktrees de review**, et gouverne le merge. Mot-clé : `orchestration` / `orchestrate` / `오케스트레이션`.

```text
/orchestration "mission"
/orchestration --strategy balanced "feature set"
/orchestration --strategy aggressive --max-parallel 6 "large epic"
/orchestration --interactive "high-risk migration"
```

| Flag | Signification |
|------|---------|
| *(défaut)* | `--strategy conservative` (sécurité d’abord, 1–3 workers impl concurrents) |
| `--strategy balanced` | Dispatch parallèle modéré (plafond 4) |
| `--strategy aggressive` | Dispatch pratique max (plafond 6) ; **mêmes portes qualité** par flux, pas un raccourci sans AC |
| `--max-depth N` | Nesting depth ceiling (default 2) |
| `--max-parallel N` | **Borne supérieure** finale de concurrence seulement : `min(strategy_cap, N, safety)` |
| `--interactive` | Confirmer les gros lots parallèles et les merges |

**La sécurité l’emporte toujours** sur la strategy (ex. isolation worktree non prouvée → concurrence 1).

### Pipeline worker (Plan → Goal → Execute)

Par worktree d’implémentation :

```text
Issue Snapshot → Requirements → /ralplan → executionGoal
  → (/goal if host allows) → Acceptance Contract → orch AC gate
  → Implement → tests → exit report → PR (Fixes #N)
```

Puis les **worktrees de review** valident **Issue → executionGoal → AC → Impl → PR → Tests**. Merge uniquement après review **APPROVE** + confirmation humaine.

### Rôles et source de vérité

| Artefact | Rôle |
|----------|------|
| **Task JSON** (`.omg/orchestration/tasks/`) | État runtime (status, locks, progress) |
| **Canonical Issue** (GitHub ou miroir board) | Contrat humain (scope, priority, ownership) ; **créé par l’orchestrateur** avant spawn |
| **Board** (`board.md`) | Vue dashboard uniquement |

Les workers ne peuvent mettre à jour que **Acceptance / notes / risks / verification** de l’issue — pas scope, priority, ownership ni dependencies. Les workers impl capturent un **Issue Snapshot** au démarrage ; un changement de scope en vol exige l’approbation de l’orchestrateur.

### Modèles worker adaptatifs

- **Session lead :** modèle host le plus fort (jugement global).
- **Workers :** classent la tâche **LOW | MEDIUM | HIGH | CRITICAL** → `OMG_MODEL_LOW|MEDIUM|HIGH|CRITICAL` (souvent tous mappés à `grok-4.5` tant que l’host n’offre pas plus de slugs).
- Les workers **ne s’auto-upgradent pas** ; ils demandent une **complexity escalation** et l’orchestrateur respawn.
- La complexité pilote aussi la **profondeur de review** et les budgets soft de **retry**.

État : `.omg/orchestration/` (checkout principal, propriété du lead) + Layer-B `.omg/state/orchestration-state.json`. Protocole complet : [`skills/orchestration/SKILL.md`](skills/orchestration/SKILL.md).

---

## Exécution Autopilot : `solo` vs `team`

`/autopilot` orchestre toujours **agents + skills**. Seule la **phase d’implémentation** dépend de la config.

| Mode | Config | Exécution | Ce que vous voyez |
|------|--------|---------------|--------------|
| **`solo`** (défaut) | omit / `"solo"` | `spawn_subagent` en session + skills | Même chat Grok ; **pas de tmux** |
| **`team`** | `"execution": "team"` | workers CLI `omg team` | **tmux** (`omg-omg-team-…`) ; HUD `team:…` |

### Configurer (projet ou utilisateur)

**Projet** : `.grok/omg.jsonc` · **Utilisateur** : `~/.config/grok-omg/config.jsonc` · le projet gagne.

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

### Observer les workers (`execution: "team"`)

L’UI Grok **n’ouvre pas** de panneaux latéraux style OMC. Les équipes processus sont **tmux**.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Équipe manuelle sans autopilot complet:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| Préférez **solo** si… | Préférez **team** si… |
|----------------------|------------------------|
| Coding quotidien dans une fenêtre Grok | Workers CLI visibles dans **tmux** |
| Pas besoin de tmux | Mélanger **cursor / codex / gemini** |
| Feedback rapide dans le même transcript | Implémenteurs longs isolés |

**Recommandation par défaut : **solo**, sauf si vous vivez dans tmux ou multi-CLI.**

---

## Ce que vous obtenez

| Surface | Nb | Notes |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 46+ | omc→omg + `ui-mockup` + `web-research` + `orchestration` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Exclusifs Grok

- **`/orchestration`** — Protocol v1.3 Hierarchical Execution Graph: Coordinator|Worker, recipes, Runtime Policy A′, nested scopes
- **`/web-research`** — docs live → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → approbation → Vision → code → Vision QA
- **Search-on-fail** — préférer `web_search` avant retries aveugles

### Modes de review

- **`/security-review`**
- **`/code-review`**

### Skills principaux

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `orchestration`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Id serveur par défaut **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Sans bridge : `dist/mcp/standalone-server.js`. Thin : `mcp/omg-state-server.mjs`.

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

## Layout du projet

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Développement

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

Aides re-port après refresh du cache OMC :

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Barre qualité :** core + smoke + MCP. **Residual full : 0 fail**. Voir `docs/GROK-PRODUCT-SUBSET.md`.

### Carte des docs

| Doc | But |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Pin upstream |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | État par surface |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Définition « done » Grok |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | Premier lancement |
| [docs/settings-schema.md](docs/settings-schema.md) | Clés de config |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Checklist couches |
| [parity-review/](parity-review/) | Notes d’évidence |

---

## Licence

MIT. Copyright original oh-my-claudecode et contributeurs oh-my-grok. Voir [LICENSE](LICENSE) et [NOTICE](NOTICE).

## Crédits

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — conception d’orchestration, agents, skills, protocoles
- xAI Grok Build — plugin / skills / hooks / hôte MCP
