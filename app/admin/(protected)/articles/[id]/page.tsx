import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ArticleRow, LessonOption } from "@/lib/admin/articles";
import type { QuizDraft, QuizQuestionDraft } from "@/lib/admin/quizzes";
import { ArticleEditor } from "@/components/admin/article-editor";

async function loadQuizForArticle(
  articleId: string
): Promise<{ draft: QuizDraft | null; attemptCount: number }> {
  const supabase = await createServerSupabaseClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, article_id, title_uz, title_en, is_published")
    .eq("article_id", articleId)
    .maybeSingle();

  if (!quiz) {
    return { draft: null, attemptCount: 0 };
  }

  const [{ data: questions }, attemptsResult] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, quiz_id, position, prompt_uz, prompt_en, type, options(id, question_id, position, text_uz, text_en, points)"
      )
      .eq("quiz_id", quiz.id)
      .order("position", { ascending: true }),
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", quiz.id),
  ]);

  const attemptCount = attemptsResult.error ? 0 : attemptsResult.count ?? 0;

  const draftQuestions: QuizQuestionDraft[] = (questions ?? []).map((q) => {
    const options = Array.isArray(q.options) ? q.options : [];
    return {
      id: q.id,
      position: q.position ?? 0,
      prompt_uz: q.prompt_uz ?? "",
      prompt_en: q.prompt_en ?? "",
      type: q.type ?? "multiple_choice",
      persisted: true,
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
            text_uz: o.text_uz ?? "",
            text_en: o.text_en ?? "",
            points: o.points ?? 0,
            persisted: true,
          })
        ),
    };
  });

  return {
    attemptCount,
    draft: {
      quiz_id: quiz.id,
      article_id: quiz.article_id,
      title_uz: quiz.title_uz ?? "",
      title_en: quiz.title_en ?? "",
      is_published: Boolean(quiz.is_published),
      questions: draftQuestions,
    },
  };
}

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [{ data, error }, { data: lessonsData }, quizState] = await Promise.all([
    supabase
      .from("articles")
      .select(
        "id, lesson_id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, topic, cover_path, status, created_at, updated_at"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("lessons")
      .select("id, slug, title_uz, title_en")
      .order("position", { ascending: true }),
    loadQuizForArticle(id),
  ]);

  if (error || !data) {
    notFound();
  }

  return (
    <ArticleEditor
      article={data as ArticleRow}
      lessons={(lessonsData ?? []) as LessonOption[]}
      initialQuiz={quizState.draft}
      attemptCount={quizState.attemptCount}
      initialTab={tab === "quiz" ? "quiz" : "article"}
    />
  );
}
