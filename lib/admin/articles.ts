import { friendlyAdminError } from "@/lib/admin/errors";

export type ArticleStatus = "draft" | "published";

export const ARTICLE_TOPICS = [
  "memory",
  "attention",
  "sleep",
  "learning",
  "emotion",
] as const;

export type ArticleTopic = (typeof ARTICLE_TOPICS)[number];

export type ArticleRow = {
  id: string;
  lesson_id: string | null;
  slug: string;
  title_uz: string | null;
  title_en: string | null;
  summary_uz: string | null;
  summary_en: string | null;
  body_uz: string | null;
  body_en: string | null;
  topic: string | null;
  cover_path: string | null;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
};

export type LessonOption = {
  id: string;
  slug: string;
  title_uz: string | null;
  title_en: string | null;
};

export type ArticleFormValues = {
  title_uz: string;
  title_en: string;
  summary_uz: string;
  summary_en: string;
  body_uz: string;
  body_en: string;
  slug: string;
  topic: ArticleTopic | "";
  lesson_id: string;
  status: ArticleStatus;
};

export function emptyArticleForm(): ArticleFormValues {
  return {
    title_uz: "",
    title_en: "",
    summary_uz: "",
    summary_en: "",
    body_uz: "",
    body_en: "",
    slug: "",
    topic: "",
    lesson_id: "",
    status: "draft",
  };
}

export function articleToFormValues(article: ArticleRow): ArticleFormValues {
  const topic = ARTICLE_TOPICS.includes(article.topic as ArticleTopic)
    ? (article.topic as ArticleTopic)
    : "";

  return {
    title_uz: article.title_uz ?? "",
    title_en: article.title_en ?? "",
    summary_uz: article.summary_uz ?? "",
    summary_en: article.summary_en ?? "",
    body_uz: article.body_uz ?? "",
    body_en: article.body_en ?? "",
    slug: article.slug ?? "",
    topic,
    lesson_id: article.lesson_id ?? "",
    status: article.status === "published" ? "published" : "draft",
  };
}

export function mapArticleSaveError(error: { code?: string; message?: string }): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "23505" || message.includes("duplicate") || message.includes("unique")) {
    return "That slug is already used. Choose a different slug.";
  }
  if (message.includes("topic")) {
    return "Pick a valid topic (memory, attention, sleep, learning, or emotion).";
  }
  if (message.includes("lesson_id") || message.includes("foreign key")) {
    return "The linked lesson is invalid. Pick another lesson or leave it empty.";
  }
  if (message.includes("null value") && message.includes("slug")) {
    return "Slug is required.";
  }
  return friendlyAdminError(error, "Could not save the article. Please try again.");
}

export function lessonOptionLabel(lesson: LessonOption): string {
  return lesson.title_uz || lesson.title_en || lesson.slug;
}
