import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { friendlyAdminError } from "@/lib/admin/errors";
import { Button } from "@/components/ui/button";

type ArticleQuizRow = {
  id: string;
  slug: string;
  title_uz: string | null;
  title_en: string | null;
  quizzes:
    | { id: string; title_uz: string | null; title_en: string | null; is_published: boolean }
    | { id: string; title_uz: string | null; title_en: string | null; is_published: boolean }[]
    | null;
};

function pickQuiz(raw: ArticleQuizRow["quizzes"]) {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function quizTitle(quiz: {
  title_uz: string | null;
  title_en: string | null;
}) {
  return quiz.title_uz || quiz.title_en || "Untitled quiz";
}

export default async function AdminQuizzesPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title_uz, title_en, quizzes(id, title_uz, title_en, is_published)")
    .order("updated_at", { ascending: false });

  const articles = (data ?? []) as ArticleQuizRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Quizzes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each article can have one quiz. Readers take it before the article body.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {friendlyAdminError(error, "Could not load quizzes. Please refresh.")}
        </p>
      ) : null}

      {!error && articles.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No articles yet. Create an article first, then add its quiz.
          </p>
          <div className="mt-4">
            <Link href="/admin/articles/new">
              <Button type="button">New article</Button>
            </Link>
          </div>
        </div>
      ) : null}

      {articles.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Article</th>
                <th className="px-3 py-2 font-medium">Quiz</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const title = article.title_uz || article.title_en || article.slug;
                const quiz = pickQuiz(article.quizzes);
                return (
                  <tr key={article.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium">{title}</div>
                      <div className="text-xs text-muted-foreground">{article.slug}</div>
                    </td>
                    <td className="px-3 py-2">
                      {quiz ? quizTitle(quiz) : <span className="text-muted-foreground">None yet</span>}
                    </td>
                    <td className="px-3 py-2">
                      {quiz ? (
                        <span
                          className={
                            quiz.is_published
                              ? "inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                              : "inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {quiz.is_published ? "Published" : "Unpublished"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/admin/articles/${article.id}?tab=quiz`}>
                        <Button type="button" variant="outline" size="sm">
                          {quiz ? "Edit quiz" : "Create quiz"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
