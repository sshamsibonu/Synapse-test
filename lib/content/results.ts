import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AttemptResultRow = {
  id: string;
  score: number | null;
  maxScore: number | null;
  completedAt: string;
  title: string;
};

type AttemptQueryRow = {
  id: string;
  score: number | null;
  max_score: number | null;
  created_at: string;
  quizzes:
    | {
        title_uz: string | null;
        title_en: string | null;
        articles:
          | { title_uz: string | null; title_en: string | null }
          | { title_uz: string | null; title_en: string | null }[]
          | null;
      }
    | {
        title_uz: string | null;
        title_en: string | null;
        articles:
          | { title_uz: string | null; title_en: string | null }
          | { title_uz: string | null; title_en: string | null }[]
          | null;
      }[]
    | null;
};

function pickLocale(
  locale: string,
  uz: string | null | undefined,
  en: string | null | undefined
): string {
  if (locale === "en") return (en || uz || "").trim();
  return (uz || en || "").trim();
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

/**
 * Loads quiz attempts for the signed-in user.
 * RLS on attempts should already restrict rows to auth.uid().
 */
export async function listMyAttempts(locale: string): Promise<{
  rows: AttemptResultRow[];
  error: string | null;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { rows: [], error: null };
    }

    const { data, error } = await supabase
      .from("attempts")
      .select(
        `
        id,
        score,
        max_score,
        created_at,
        quizzes (
          title_uz,
          title_en,
          articles (
            title_uz,
            title_en
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { rows: [], error: error.message };
    }

    const rows: AttemptResultRow[] = ((data ?? []) as AttemptQueryRow[]).map((row) => {
      const quiz = unwrapOne(row.quizzes);
      const article = unwrapOne(quiz?.articles);
      const title =
        pickLocale(locale, quiz?.title_uz, quiz?.title_en) ||
        pickLocale(locale, article?.title_uz, article?.title_en) ||
        "Quiz";

      return {
        id: row.id,
        score: row.score,
        maxScore: row.max_score,
        completedAt: row.created_at,
        title,
      };
    });

    return { rows, error: null };
  } catch {
    return { rows: [], error: "unavailable" };
  }
}
