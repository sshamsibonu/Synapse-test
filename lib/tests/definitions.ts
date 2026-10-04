import type { CognitiveDomain, TestDefinition } from "@/types/database";

/**
 * Client-safe mirror of the `test_definitions` seed data in
 * supabase/migrations/0001_init.sql. Kept in sync manually since this list
 * changes rarely; the catalog and test pages render from this rather than
 * round-tripping to the database for static content.
 */
export const TEST_DEFINITIONS: TestDefinition[] = [
  {
    id: "simple-reaction-time",
    name: "Simple Reaction Time",
    domain: "reaction_time",
    description: "Tap as soon as a shape appears on screen.",
    scientific_explanation:
      "Simple reaction time reflects the speed of the basic sensorimotor pathway from visual detection to motor response, and is widely used as a baseline measure of processing speed in cognitive psychology.",
    avg_duration_seconds: 60,
    difficulty: "Easy",
  },
  {
    id: "stroop-test",
    name: "Stroop Test",
    domain: "attention",
    description: "Name the ink color of a word, ignoring what the word says.",
    scientific_explanation:
      "The Stroop effect demonstrates interference between automatic word-reading and deliberate color-naming, and is a classic measure of selective attention and executive inhibitory control.",
    avg_duration_seconds: 120,
    difficulty: "Medium",
  },
  {
    id: "n-back",
    name: "N-back",
    domain: "working_memory",
    description: "Decide whether the current item matches the one shown N steps earlier.",
    scientific_explanation:
      "The N-back task requires continuously updating and monitoring items held in working memory, making it a standard laboratory measure of working memory capacity and executive updating.",
    avg_duration_seconds: 150,
    difficulty: "Hard",
  },
  {
    id: "digit-span",
    name: "Digit Span",
    domain: "processing_speed",
    description: "Recall an increasingly long sequence of digits in order.",
    scientific_explanation:
      "Digit span is a classic measure of short-term memory span; performance reflects how much verbal information can be held and immediately reproduced.",
    avg_duration_seconds: 90,
    difficulty: "Medium",
  },
];

export function getTestDefinition(slug: string): TestDefinition | undefined {
  return TEST_DEFINITIONS.find((t) => t.id === slug);
}

export const DOMAIN_LABELS: Record<CognitiveDomain, string> = {
  reaction_time: "Reaction Time",
  working_memory: "Working Memory",
  attention: "Attention",
  executive_function: "Executive Function",
  visual_memory: "Visual Memory",
  processing_speed: "Processing Speed",
  impulse_control: "Impulse Control",
};
