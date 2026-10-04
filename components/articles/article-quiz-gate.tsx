"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";
import type { PublicArticleQuiz } from "@/lib/content/articles";
import { Button } from "@/components/ui/button";

type Phase = "intro" | "question" | "done";

type Props = {
  quiz: PublicArticleQuiz;
  children: React.ReactNode;
};

function storageKey(quizId: string) {
  return `synapse-article-quiz-done:${quizId}`;
}

/**
 * Quiz-first gate: article body (children) stays hidden until the reader finishes.
 */
export function ArticleQuizGate({ quiz, children }: Props) {
  const t = useTranslations("articles.quiz");
  const questions = [...quiz.questions].sort((a, b) => a.position - b.position);

  const [hydrated, setHydrated] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>(questions.length ? "intro" : "done");
  const [index, setIndex] = React.useState(0);
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<Array<{ question_id: string; option_id: string }>>(
    []
  );
  const [score, setScore] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [unlocked, setUnlocked] = React.useState(questions.length === 0);

  React.useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey(quiz.id)) === "1") {
        setUnlocked(true);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [quiz.id]);

  const current = questions[index];
  const options = current
    ? [...current.options].sort((a, b) => a.position - b.position)
    : [];

  function unlock() {
    setUnlocked(true);
    try {
      sessionStorage.setItem(storageKey(quiz.id), "1");
    } catch {
      // ignore
    }
  }

  async function finish(finalAnswers: Array<{ question_id: string; option_id: string }>) {
    let total = 0;
    for (const answer of finalAnswers) {
      const question = questions.find((q) => q.id === answer.question_id);
      const option = question?.options.find((o) => o.id === answer.option_id);
      total += option?.points ?? 0;
    }
    setScore(total);
    setSubmitting(true);
    setNotice(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("submit_attempt", {
        quiz_id: quiz.id,
        answers: finalAnswers,
      });
      if (error) {
        setNotice(t("saveError"));
      }
    } catch {
      setNotice(t("saveError"));
    } finally {
      setSubmitting(false);
      setPhase("done");
    }
  }

  function goNext() {
    if (!current || !selectedOptionId) {
      setNotice(t("pickAnswer"));
      return;
    }
    setNotice(null);
    const nextAnswers = [
      ...answers,
      { question_id: current.id, option_id: selectedOptionId },
    ];
    setAnswers(nextAnswers);
    setSelectedOptionId(null);

    if (index + 1 >= questions.length) {
      void finish(nextAnswers);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[38rem]">
        <p className="text-sm text-muted-foreground">{t("beforeIntro")}</p>
      </div>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-[38rem]">
      {phase === "intro" ? (
        <div className="rounded-lg border border-border p-6">
          <h2 className="display text-2xl">{t("beforeTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("beforeIntro")}</p>
          <p className="mt-2 text-sm font-medium">{quiz.title}</p>
          <Button className="mt-6" type="button" onClick={() => setPhase("question")}>
            {t("start")}
          </Button>
        </div>
      ) : null}

      {phase === "question" && current ? (
        <div className="rounded-lg border border-border p-6">
          <p className="annotation">
            {t("questionOf", { current: index + 1, total: questions.length })}
          </p>
          <h3 className="mt-3 text-xl font-medium leading-snug">{current.prompt}</h3>
          <div className="mt-5 space-y-2">
            {options.map((option) => {
              const active = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={
                    active
                      ? "w-full rounded-lg border border-primary bg-primary/10 px-4 py-3 text-left text-sm"
                      : "w-full rounded-lg border border-border px-4 py-3 text-left text-sm hover:bg-muted"
                  }
                  onClick={() => setSelectedOptionId(option.id)}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
          {notice ? <p className="mt-3 text-sm text-destructive">{notice}</p> : null}
          <Button className="mt-6" type="button" disabled={submitting} onClick={goNext}>
            {submitting
              ? t("submitting")
              : index + 1 >= questions.length
                ? t("submit")
                : t("next")}
          </Button>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="rounded-lg border border-border p-6">
          <h2 className="display text-2xl">{t("yourScore", { score })}</h2>
          {notice ? <p className="mt-3 text-sm text-muted-foreground">{notice}</p> : null}
          <Button className="mt-6" type="button" onClick={unlock}>
            {t("continue")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
