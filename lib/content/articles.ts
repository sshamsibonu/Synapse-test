import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { articleCoverPublicUrl } from "@/lib/admin/storage";
import {
  getArticle,
  resolveCover,
  type ArticleCategory,
} from "@/lib/articles/definitions";

export type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: ArticleCategory;
  published: string;
  readingMinutes: number;
  coverSrc: string | null;
  focal: string;
  relatedTest?: string;
  /** Published quiz for this article, if any. */
  quiz: PublicArticleQuiz | null;
};

export type PublicArticleQuiz = {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    position: number;
    prompt: string;
    options: Array<{
      id: string;
      position: number;
      text: string;
      points: number;
    }>;
  }>;
};

type ArticleRow = {
  id: string;
  slug: string;
  title_uz: string | null;
  title_en: string | null;
  summary_uz: string | null;
  summary_en: string | null;
  body_uz: string | null;
  body_en: string | null;
  topic: string | null;
  cover_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const TOPICS = new Set([
  "memory",
  "attention",
  "sleep",
  "learning",
  "emotion",
  "research",
]);

function pickLocale(
  locale: string,
  uz: string | null,
  en: string | null
): string {
  if (locale === "en") {
    return (en || uz || "").trim();
  }
  return (uz || en || "").trim();
}

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function asCategory(topic: string | null): ArticleCategory {
  if (topic && TOPICS.has(topic)) return topic as ArticleCategory;
  return "learning";
}

function toPublicArticle(row: ArticleRow, locale: string): PublicArticle | null {
  const title = pickLocale(locale, row.title_uz, row.title_en);
  if (!title) return null;

  const summary = pickLocale(locale, row.summary_uz, row.summary_en);
  const body = pickLocale(locale, row.body_uz, row.body_en);
  const legacy = getArticle(row.slug);
  const dbCover = articleCoverPublicUrl(row.cover_path);

  return {
    id: row.id,
    slug: row.slug,
    title,
    summary,
    body,
    topic: asCategory(row.topic),
    published: legacy?.published ?? row.created_at,
    readingMinutes: legacy?.readingMinutes ?? estimateReadingMinutes(body || summary),
    coverSrc: dbCover ?? (legacy ? resolveCover(legacy) : null),
    focal: legacy?.focal ?? "50% 50%",
    relatedTest: legacy?.relatedTest,
    quiz: null,
  };
}

async function fetchPublishedRows(): Promise<ArticleRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, topic, cover_path, status, created_at, updated_at"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as ArticleRow[];
  } catch {
    return [];
  }
}

export async function listPublishedArticles(locale: string): Promise<PublicArticle[]> {
  const rows = await fetchPublishedRows();
  return rows
    .map((row) => toPublicArticle(row, locale))
    .filter((a): a is PublicArticle => Boolean(a));
}

export async function getPublishedArticle(
  slug: string,
  locale: string
): Promise<PublicArticle | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, topic, cover_path, status, created_at, updated_at"
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;
    const article = toPublicArticle(data as ArticleRow, locale);
    if (!article) return null;

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("id, title_uz, title_en, is_published")
      .eq("article_id", article.id)
      .eq("is_published", true)
      .maybeSingle();

    if (!quiz) return article;

    const { data: questions } = await supabase
      .from("questions")
      .select(
        "id, position, prompt_uz, prompt_en, options(id, position, text_uz, text_en, points)"
      )
      .eq("quiz_id", quiz.id)
      .order("position", { ascending: true });

    const pick = (uz: string | null | undefined, en: string | null | undefined) =>
      locale === "en" ? (en || uz || "").trim() : (uz || en || "").trim();

    article.quiz = {
      id: quiz.id,
      title: pick(quiz.title_uz, quiz.title_en) || "Quiz",
      questions: (questions ?? []).map((q) => {
        const options = Array.isArray(q.options) ? q.options : [];
        return {
          id: q.id,
          position: q.position ?? 0,
          prompt: pick(q.prompt_uz, q.prompt_en),
          options: options
            .slice()
            .sort(
              (a: { position?: number }, b: { position?: number }) =>
                (a.position ?? 0) - (b.position ?? 0)
            )
            .map(
              (o: {
                id: string;
                position?: number;
                text_uz?: string;
                text_en?: string;
                points?: number;
              }) => ({
                id: o.id,
                position: o.position ?? 0,
                text: pick(o.text_uz, o.text_en),
                points: o.points ?? 0,
              })
            ),
        };
      }),
    };

    return article;
  } catch {
    return null;
  }
}

/**
 * Split plain body text into display blocks.
 * Short lines without sentence punctuation render as headings.
 */
export function parseBodyBlocks(
  body: string
): Array<{ type: "heading" | "paragraph"; text: string }> {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((text) => {
    const looksLikeHeading =
      text.length < 90 && !/[.!?…]["']?$/.test(text) && !text.includes("\n");
    return { type: looksLikeHeading ? "heading" : "paragraph", text };
  });
}
