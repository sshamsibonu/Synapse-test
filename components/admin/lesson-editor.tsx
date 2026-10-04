"use client";

import * as React from "react";
import Link from "next/link";

import type { LessonRow } from "@/lib/admin/lessons";
import type { QuizDraft } from "@/lib/admin/quizzes";
import { LessonForm } from "@/components/admin/lesson-form";
import { QuizBuilder } from "@/components/admin/quiz-builder";
import { cn } from "@/lib/utils";

type Props = {
  lesson: LessonRow;
  initialQuiz: QuizDraft | null;
  attemptCount: number;
  initialTab?: "lesson" | "quiz";
};

export function LessonEditor({
  lesson,
  initialQuiz,
  attemptCount,
  initialTab = "lesson",
}: Props) {
  const [tab, setTab] = React.useState<"lesson" | "quiz">(initialTab);
  const title = lesson.title_uz || lesson.title_en || lesson.slug;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm",
            tab === "lesson"
              ? "bg-secondary text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("lesson")}
        >
          Lesson
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

      {tab === "lesson" ? (
        <LessonForm mode="edit" lesson={lesson} />
      ) : (
        <QuizBuilder
          lessonId={lesson.id}
          lessonTitle={title}
          initialQuiz={initialQuiz}
          attemptCount={attemptCount}
        />
      )}
    </div>
  );
}
