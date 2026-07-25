/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "../..");

function readProjectFile(...segments: string[]): string {
  return readFileSync(join(PROJECT_ROOT, ...segments), "utf-8");
}

describe("Claude Code /goal adapter docs contract", () => {
  const adapterDoc = readProjectFile(
    "docs",
    "design",
    "CLAUDE_CODE_GOAL_ADAPTER.md",
  );
  const referenceDoc = readProjectFile("docs", "REFERENCE.md");

  it("documents Grok/Claude authority boundary for /goal facts", () => {
    expect(adapterDoc).toContain("https://code.claude.com/docs/en/goal");
    // Doc is Grok-adapted: OpenAI/Codex/OMX are not authority for host /goal facts
    expect(adapterDoc).toMatch(/they are not authority for (Claude Code|Grok Build) `\/goal` facts/);
  });

  it("documents the hidden-state non-mutation boundary", () => {
    expect(adapterDoc).toMatch(
      /it does not mutate hidden (Claude Code|Grok Build) goal state/,
    );
    expect(adapterDoc).toMatch(
      /instead of writing hidden (Claude Code|Grok Build) session state directly/,
    );
  });

  it("locks deterministic loop conflict policy values and forbids warn-and-continue behavior", () => {
    for (const policy of ["`refuse`", "`adopt_existing`", "`artifact_only`"]) {
      expect(adapterDoc).toContain(policy);
    }

    expect(adapterDoc).toContain("must never “warn and continue”");
    expect(adapterDoc).toContain("Any unknown policy is invalid");
  });

  it("keeps evaluator success separate from OMG final completion", () => {
    expect(adapterDoc).toContain("`evaluator_passed` is not `complete`");
    expect(adapterDoc).toContain(
      "Direct `evaluator_passed -> complete` transitions are invalid",
    );
    expect(adapterDoc).toContain(
      "the `/goal` evaluator judges surfaced conversation evidence",
    );
    expect(adapterDoc).not.toContain(
      "the evaluator independently reads files and runs commands",
    );
  });

  it("links the adapter design from REFERENCE.md when present", () => {
    // Soft contract: design file is canonical; REFERENCE may link under either title
    expect(adapterDoc).toContain("Grok Build `/goal` Adapter Design");
    if (referenceDoc.includes("CLAUDE_CODE_GOAL_ADAPTER.md")) {
      expect(referenceDoc).toContain("./design/CLAUDE_CODE_GOAL_ADAPTER.md");
    }
  });
});
