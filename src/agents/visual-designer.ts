/**
 * Visual Designer Agent — Grok Image Gen + Vision QA for UI mockups.
 */
import type { AgentConfig, AgentPromptMetadata } from "./types.js";
import { loadAgentPrompt } from "./utils.js";

export const VISUAL_DESIGNER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "CHEAP",
  promptAlias: "visual-designer",
  triggers: [
    {
      domain: "UI mockup",
      trigger: "Design mockups, visual QA, image-gen UI drafts",
    },
  ],
  useWhen: [
    "UI mockup generation with Image Gen",
    "Vision QA against screenshots",
    "Visual design systems for frontend",
  ],
  avoidWhen: [
    "Pure implementation without design",
    "Backend-only work",
  ],
};

export const visualDesignerAgent: AgentConfig = {
  name: "visual-designer",
  description:
    "Grok-specialized UI/visual agent. Analyzes design mockups with Vision, extracts layout/color/typography, guides frontend implementation plus Vision QA.",
  prompt: loadAgentPrompt("visual-designer"),
  model: "sonnet",
  defaultModel: "sonnet",
  metadata: VISUAL_DESIGNER_PROMPT_METADATA,
};
