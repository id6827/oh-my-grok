# Full vitest residual tracker (2026-07-25)

## Trajectory

| Metric | Value |
|--------|------:|
| Parity baseline | ~721 fail |
| Wave 1–2 | 119 → 77 |
| Wave 3 (`49ebf5a`) | **51 fail** |
| Wave 4 (`03cbfb0` + `8a94fe1`) | **21 fail / 11202 pass** |
| Core | **217/217** |
| Smoke | **green** |

**≈ −700 fails from parity baseline.**

### Wave 4 highlights

- Soft-align OMC-era docs/hooks/CI contracts to OMG packaging
- macOS `liveLockOwner` (state-tools, cancel); named workflow skip off Linux
- Process-start identity: host-strict publish vs ESRCH death / foreign unverifiable
- Owner fixtures use host-valid mismatched start tokens

### Remaining (~21, mostly 1-each)

Scattered brand/docs/path lag: bin surface, keyword-detector, release-generation,
pre-tool-enforcer, preemptive-compaction, skills-frontmatter, ask CLI, etc.

## Product gates

```bash
npm run test:vitest:core
npm run test:smoke
npm run mcp:probe
```
