import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(import.meta.dirname, "../..");
const PERF_GLOB = "tests/perf/**";
const PERF_TARGET = "tests/perf/subagent-lock.bench.ts";
const PERF_SCRIPT = "test:perf:subagent-lock";

function readRepoFile(path: string): string {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

describe("subagent-lock test contract", () => {
  it("keeps functional Vitest scripts explicitly out of perf", () => {
    const pkg = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>;
    };

    // OMG: full suite excludes perf; core is a separate gate without perf
    expect(pkg.scripts["test:vitest"]).toContain("--exclude");
    expect(pkg.scripts["test:vitest"]).toContain(PERF_GLOB);
    expect(pkg.scripts["test:vitest:core"]).toMatch(/vitest/);
    expect(pkg.scripts["test:vitest:core"]).not.toContain(PERF_TARGET);
    expect(pkg.scripts).not.toHaveProperty(PERF_SCRIPT);
  });

  it("does not publish a subagent-lock benchmark script", () => {
    const pkg = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts).not.toHaveProperty(PERF_SCRIPT);
  });

  it("keeps CI as ordered, blocking functional gates", () => {
    const ci = readRepoFile(".github/workflows/ci.yml");
    // OMG CI: smoke/core + shipping verify (perf optional)
    expect(ci).toMatch(/test:vitest:core|test:smoke|Build \+ smoke/);
    expect(ci).toMatch(/plugin:shipping:verify/);
    // No required perf gate in OMG CI (bench is optional residual)
    if (ci.includes(PERF_TARGET)) {
      expect(ci).not.toMatch(/needs:.*perf/i);
    }
  });
});
