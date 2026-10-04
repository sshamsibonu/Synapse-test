import type { CognitiveDomain } from "@/types/database";

export type LessonCategory =
  | "memory"
  | "attention"
  | "sleep"
  | "learning"
  | "mental_health"
  | "decision_making";

export interface LessonQuizAnswerKey {
  /** Index of the correct option. Kept in code, not in translations, so a
   *  translated option list can never silently change which answer is right. */
  correctIndex: number;
  optionCount: number;
}

export interface LessonDefinition {
  id: string;
  category: LessonCategory;
  domain: CognitiveDomain;
  minutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Section count must match the `sections` array length in the message files. */
  sectionCount: number;
  /** The cognitive test this lesson prepares you to try. */
  relatedTestId: string;
  quiz: LessonQuizAnswerKey[];
}

/**
 * Intentionally empty.
 *
 * Lesson content is authored by the Synapse team, not generated. Until real
 * lessons are supplied, /lessons renders a deliberate empty state rather than
 * placeholder material. The rendering components (LessonCard, LessonQuiz, the
 * [slug] route) remain in place so authored lessons can be dropped straight in.
 */
export const LESSON_DEFINITIONS: LessonDefinition[] = [];

export function getLessonDefinition(slug: string): LessonDefinition | undefined {
  return LESSON_DEFINITIONS.find((l) => l.id === slug);
}
