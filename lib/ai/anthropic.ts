import "server-only";

import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY env var.");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** Higher-quality model for synthesizing a full insights report. */
export const INSIGHTS_MODEL = "claude-sonnet-5";

/** Fast, low-cost model for the conversational neuroscience assistant. */
export const ASSISTANT_MODEL = "claude-haiku-4-5-20251001";
