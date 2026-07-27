# oh-my-grok (OMG)

[English](README.md) · [한국어](README.ko.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Tiếng Việt](README.vi.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md)

**[Grok Build](https://x.ai) / Grok CLI için çoklu ajan orkestrasyonu.**

[oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) Grok portu; Grok yerli eklentiler: **gerçek zamanlı web/X arama**, **Image Gen UI mockup**, **Vision UI QA**.

| | |
|--|--|
| **OMG sürümü** | `0.9.0-rc.1` |
| **Durum kökü** | `.omg/` (`.omc/` kullanma) |
| **OMC pini** | `4.15.7` @ `41a4c0f` |
| **Ürün kapıları** | `npm run test:vitest:core` · `npm run test:smoke` · `npm run mcp:probe` |
| **Parite** | **Near-complete** (Claude host %100 klon değil) |

> Harness öğrenme. OMG kullan.

### Durum (2026-07)

| Eksen | Durum |
|------|--------|
| Modül envanteri | **100%** touched (`node scripts/port-inventory.mjs`) |
| Core vitest | **217/217** |
| Full vitest residual | **0 fail** — [VITEST-RESIDUAL](parity-review/VITEST-RESIDUAL-2026-07-25.md) |
| Smoke + MCP | green · ~54 `omg-tools` |
| Grok alt kümesi | [GROK-PRODUCT-SUBSET](docs/GROK-PRODUCT-SUBSET.md) |
| `/ralplan` | OMC ile aynı protokol; araç adları Grok için |

İsteğe bağlı kontroller: `npm run test:optional`.

---

## OMC kaynak pini

OMG gelecek re-diff için **sabit OMC commit** izler. Ayrıntı: [`docs/OMC-SOURCE.md`](docs/OMC-SOURCE.md).

| Alan | Değer |
|-------|--------|
| **Upstream** | [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (MIT) |
| **npm** | `oh-my-claude-sisyphus` |
| **Pin sürümü** | **`4.15.7`** |
| **Pin commit** | **`41a4c0f77144c5beb5f5f000a89cff379c680606`** |
| **Konu** | `chore: promote dev to main for v4.15.7 release` |
| **Tarih** | 2026-07-23 04:44:59 +0000 |
| **Kısa form** | `4.15.7` @ `41a4c0f` |

OMC’yi bilerek yükseltirken:

1. Yeni upstream ağacını checkout/cache et.
2. `version` + HEAD’i `docs/OMC-SOURCE.md` içine yaz.
3. `port-inventory.mjs` çalıştır ve `docs/OMC-PORT-STATUS.md` güncelle.
4. OMG’yi **eski pine** (`41a4c0f…`) göre diff’le, sonra pini ilerlet.

Yerel cache: `~/.grok/marketplace-cache/*` içinde `oh-my-claude-sisyphus@4.15.7`.

---

## Kurulum

```bash
# GitHub (after publish)
grok plugin install <owner>/oh-my-grok --trust
grok plugin enable oh-my-grok

# Local checkout
grok plugin install /path/to/oh-my-grok --trust
grok plugin enable oh-my-grok
```

Doğrula:

```bash
grok plugin details oh-my-grok
grok inspect
```

Grok oturumunda dene:

```text
/deep-interview "I want a habit tracker CLI with streaks"
/ralplan
/autopilot
/web-research "Tailwind CSS v4 breaking changes"
/ui-mockup "dark mode settings page with profile card"
```

---

## Önerilen pipeline

```text
/deep-interview  →  clarity-gated spec (.omg/specs/)
       ↓
/ralplan         →  Planner / Architect / Critic consensus (.omg/plans/)
       ↓
/autopilot       →  implement → QA → multi-agent validation
```

`/cancel` ile iptal. Durum **`.omg/`** altında. Belirsiz fikir → `/deep-interview`. Spec hazır → `/ralplan` ve açık onay.

---

## Autopilot çalıştırma: `solo` vs `team`

`/autopilot` her zaman **agents + skills** orkestre eder. Yalnızca **uygulama aşaması** config’e bağlıdır.

| Mod | Config | Nasıl çalışır | Ne görürsün |
|------|--------|---------------|--------------|
| **`solo`** (varsayılan) | omit / `"solo"` | Oturum içi `spawn_subagent` + skills | Aynı Grok sohbeti; **tmux yok** |
| **`team`** | `"execution": "team"` | `omg team` CLI worker’ları | **tmux** (`omg-omg-team-…`); HUD `team:…` |

### Yapılandır (proje veya kullanıcı)

**Proje**: `.grok/omg.jsonc` · **Kullanıcı**: `~/.config/grok-omg/config.jsonc` · proje kazanır.

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

### Worker’ları izle (`execution: "team"`)

Grok sohbet UI’si OMC tarzı yan panelleri **otomatik açmaz**. Süreç ekipleri **tmux** tabanlıdır.

```bash
node bin/omg.js team status
tmux ls
tmux attach -t <tmux_session>
node bin/omg.js hud
cat .omg/state/team-state.json
```

Tam autopilot olmadan manuel ekip:

```bash
omg team 1:grok "implement the plan at .omg/plans/…"
omg team 2:cursor "fix failing tests"
omg team shutdown
```

| **solo** tercih et… | **team** tercih et… |
|----------------------|------------------------|
| Tek Grok penceresinde günlük kod | **tmux**’ta görünen CLI worker’lar |
| tmux gerekmez | **cursor / codex / gemini** karışımı |
| Aynı transcript’te hızlı geri bildirim | Uzun paralel implementer’lar izole |

**Varsayılan öneri: tmux kullanmıyorsan veya multi-CLI gerekmiyorsa **solo**.**

---

## Ne alırsın

| Yüzey | Adet | Notlar |
|---------|------:|-------|
| Agents | 20 | OMC + `visual-designer` |
| Skills | 45 | omc→omg + `ui-mockup` + `web-research` |
| MCP tools | ~54 | `omg-tools` |
| State | `.omg/` | specs, plans, artifacts, modes |

### Grok özel

- **`/web-research`** — canlı docs → `.omg/artifacts/research/`
- **`/ui-mockup`** — Image Gen → onay → Vision → kod → Vision QA
- **Search-on-fail** — kör retry’dan önce `web_search`

### Review modları

- **`/security-review`**
- **`/code-review`**

### Ana skills

`deep-interview`, `ralplan`, `plan`, `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `ultragoal`, `team`, `cancel`, `verify`, `setup`, `omg-setup`, `omg-doctor`, `omg-teams`, …

### Hooks (Layer B)

`SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `SubagentStart/Stop` · `PreCompact` · `Stop` · `SessionEnd` · cancel → `.omg/state`

### MCP (`omg-tools`)

Varsayılan sunucu id **`omg-tools`** → `mcp/run-tools-server.mjs` → ~54 tools.

```bash
npm run build && npm run build:bridge
npm run mcp:probe
```

Bridge yoksa: `dist/mcp/standalone-server.js`. Thin: `mcp/omg-state-server.mjs`.

### Yerel CLI

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

## Proje düzeni

```text
agents/  skills/  hooks/  src/  dist/  bridge/  mcp/  bin/omg.js  docs/  parity-review/  plugin.json
```

---

## Geliştirme

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

OMC cache yenilemeden sonra re-port yardımcıları:

```bash
# node scripts/port-from-omc.mjs
# node scripts/validate-parity.mjs
```

**Kalite çubuğu:** core + smoke + MCP. **Full residual: 0 fail**. `docs/GROK-PRODUCT-SUBSET.md`.

### Doküman haritası

| Dok | Amaç |
|-----|---------|
| [docs/OMC-SOURCE.md](docs/OMC-SOURCE.md) | Upstream pin |
| [docs/OMC-PORT-STATUS.md](docs/OMC-PORT-STATUS.md) | Yüzey durumu |
| [docs/GROK-PRODUCT-SUBSET.md](docs/GROK-PRODUCT-SUBSET.md) | Grok “done” tanımı |
| [docs/HOOKS-PARITY.md](docs/HOOKS-PARITY.md) | Hooks vs OMC |
| [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) | İlk çalıştırma |
| [docs/settings-schema.md](docs/settings-schema.md) | Config anahtarları |
| [docs/PARITY-MATRIX.md](docs/PARITY-MATRIX.md) | Katman checklist |
| [parity-review/](parity-review/) | Kanıt notları |

---

## Lisans

MIT. orijinal oh-my-claudecode telifi ve oh-my-grok katkıları. [LICENSE](LICENSE) ve [NOTICE](NOTICE).

## Katkılar

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) @ **`41a4c0f`** (`4.15.7`) — orkestrasyon tasarımı, agents, skills, protokoller
- xAI Grok Build — plugin / skills / hooks / MCP host
