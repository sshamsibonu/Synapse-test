"use client";

import * as React from "react";
import Link from "next/link";

import type { ArticleRow, LessonOption } from "@/lib/admin/articles";
import type { QuizDraft } from "@/lib/admin/quizzes";
import { ArticleForm } from "@/components/admin/article-form";
import { QuizBuilder } from "@/components/admin/quiz-builder";
import { cn } from "@/lib/utils";

type Props = {
  article: ArticleRow;
  lessons: LessonOption[];
  initialQuiz: QuizDraft | null;
  attemptCount: number;
  initialTab?: "article" | "quiz";
};

export function ArticleEditor({
  article,
  lessons,
  initialQuiz,
  attemptCount,
  initialTab = "article",
}: Props) {
  const [tab, setTab] = React.useState<"article" | "quiz">(initialTab);
  const title = article.title_uz || article.title_en || article.slug;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            tab === "article"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("article")}
        >
          Article
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            tab === "quiz"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("quiz")}
        >
          Quiz
        </button>
        <Link
          href="/admin/quizzes"
          className="ml-auto self-center text-sm text-muted-foreground hover:text-foreground"
        >
          All quizzes
        </Link>
      </div>

      {tab === "article" ? (
        <ArticleForm mode="edit" article={article} lessons={lessons} />
      ) : (
        <QuizBuilder
          articleId={article.id}
          articleTitle={title}
          initialQuiz={initialQuiz}
          attemptCount={attemptCount}
        />
      )}
    </div>
  );
}
