"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import { friendlyAdminError } from "@/lib/admin/errors";
import {
  emptyQuizDraft,
  mapQuizSaveError,
  newClientId,
  validateQuizDraft,
  type QuizDraft,
  type QuizOptionDraft,
  type QuizQuestionDraft,
  type SaveQuizPayload,
} from "@/lib/admin/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  articleId?: string;
  articleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  initialQuiz: QuizDraft | null;
  attemptCount: number;
};

function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

function reindexQuestions(questions: QuizQuestionDraft[]): QuizQuestionDraft[] {
  return questions.map((q, index) => ({
    ...q,
    position: index,
    options: q.options.map((o, oi) => ({ ...o, position: oi })),
  }));
}

export function QuizBuilder({
  articleId,
  articleTitle,
  lessonId,
  lessonTitle,
  initialQuiz,
  attemptCount,
}: Props) {
  const targetId = articleId ?? lessonId ?? "";
  const targetTitle = articleTitle ?? lessonTitle ?? "";
  const [draft, setDraft] = React.useState<QuizDraft>(
    () => initialQuiz ?? emptyQuizDraft(targetId, targetTitle)
  );
  const [deletedQuestionIds, setDeletedQuestionIds] = React.useState<string[]>([]);
  const [deletedOptionIds, setDeletedOptionIds] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function updateDraft(patch: Partial<QuizDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function addQuestion() {
    const question: QuizQuestionDraft = {
      id: newClientId(),
      position: draft.questions.length,
      prompt_uz: "",
      prompt_en: "",
      type: "multiple_choice",
      persisted: false,
      options: [
        {
          id: newClientId(),
          position: 0,
          text_uz: "",
          text_en: "",
          points: 1,
          persisted: false,
        },
        {
          id: newClientId(),
          position: 1,
          text_uz: "",
          text_en: "",
          points: 0,
          persisted: false,
        },
      ],
    };
    setDraft((prev) => ({
      ...prev,
      questions: reindexQuestions([...prev.questions, question]),
    }));
  }

  function updateQuestion(questionId: string, patch: Partial<QuizQuestionDraft>) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...patch } : q
      ),
    }));
  }

  function moveQuestion(questionId: string, direction: -1 | 1) {
    setDraft((prev) => {
      const list = sortByPosition(prev.questions);
      const index = list.findIndex((q) => q.id === questionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return prev;
      const copy = [...list];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return { ...prev, questions: reindexQuestions(copy) };
    });
  }

  function removeQuestion(question: QuizQuestionDraft) {
    if (question.persisted && attemptCount > 0) {
      const ok = window.confirm(
        `This quiz already has ${attemptCount} attempt(s). Deleting a question also deletes saved answers that used its options. Continue?`
      );
      if (!ok) return;
    } else if (question.persisted) {
      const ok = window.confirm("Remove this question and its answer choices?");
      if (!ok) return;
    }

    if (question.persisted) {
      setDeletedQuestionIds((ids) => [...ids, question.id]);
      for (const option of question.options) {
        if (option.persisted) {
          setDeletedOptionIds((ids) => [...ids, option.id]);
        }
      }
    }

    setDraft((prev) => ({
      ...prev,
      questions: reindexQuestions(prev.questions.filter((q) => q.id !== question.id)),
    }));
  }

  function addOption(questionId: string) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const option: QuizOptionDraft = {
          id: newClientId(),
          position: q.options.length,
          text_uz: "",
          text_en: "",
          points: 0,
          persisted: false,
        };
        return {
          ...q,
          options: q.options
            .map((o, i) => ({ ...o, position: i }))
            .concat({ ...option, position: q.options.length }),
        };
      }),
    }));
  }

  function updateOption(
    questionId: string,
    optionId: string,
    patch: Partial<QuizOptionDraft>
  ) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)),
        };
      }),
    }));
  }

  function moveOption(questionId: string, optionId: string, direction: -1 | 1) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const list = sortByPosition(q.options);
        const index = list.findIndex((o) => o.id === optionId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return q;
        const copy = [...list];
        const [item] = copy.splice(index, 1);
        copy.splice(target, 0, item);
        return {
          ...q,
          options: copy.map((o, i) => ({ ...o, position: i })),
        };
      }),
    }));
  }

  function removeOption(question: QuizQuestionDraft, option: QuizOptionDraft) {
    if (question.options.length <= 2) {
      setError("Each question needs at least two answer choices.");
      return;
    }

    if (option.persisted && attemptCount > 0) {
      const ok = window.confirm(
        `This quiz already has ${attemptCount} attempt(s). Deleting an answer choice also deletes saved answers that used it. Continue?`
      );
      if (!ok) return;
    } else if (option.persisted) {
      const ok = window.confirm("Remove this answer choice?");
      if (!ok) return;
    }

    if (option.persisted) {
      setDeletedOptionIds((ids) => [...ids, option.id]);
    }

    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== question.id) return q;
        return {
          ...q,
          options: q.options
            .filter((o) => o.id !== option.id)
            .map((o, i) => ({ ...o, position: i })),
        };
      }),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const validationError = validateQuizDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: SaveQuizPayload = {
      quiz_id: draft.quiz_id,
      article_id: draft.article_id,
      title_uz: draft.title_uz.trim(),
      title_en: draft.title_en.trim(),
      is_published: draft.is_published,
      deleted_question_ids: deletedQuestionIds,
      deleted_option_ids: deletedOptionIds,
      questions: reindexQuestions(draft.questions).map((q) => ({
        id: q.id,
        position: q.position,
        prompt_uz: q.prompt_uz.trim(),
        prompt_en: q.prompt_en.trim(),
        type: q.type || "multiple_choice",
        options: q.options.map((o) => ({
          id: o.id,
          position: o.position,
          text_uz: o.text_uz.trim(),
          text_en: o.text_en.trim(),
          points: Number.isFinite(o.points) ? o.points : 0,
        })),
      })),
    };

    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("save_quiz", {
        payload,
      });

      if (rpcError) {
        setError(mapQuizSaveError(rpcError));
        return;
      }

      const saved = data as {
        quiz_id: string;
        article_id: string;
        title_uz: string | null;
        title_en: string | null;
        is_published: boolean;
        questions: Array<{
          id: string;
          position: number;
          prompt_uz: string | null;
          prompt_en: string | null;
          type: string;
          options: Array<{
            id: string;
            position: number;
            text_uz: string | null;
            text_en: string | null;
            points: number;
          }>;
        }>;
      };

      setDraft({
        quiz_id: saved.quiz_id,
        article_id: saved.article_id,
        title_uz: saved.title_uz ?? "",
        title_en: saved.title_en ?? "",
        is_published: saved.is_published,
        questions: (saved.questions ?? []).map((q) => ({
          id: q.id,
          position: q.position,
          prompt_uz: q.prompt_uz ?? "",
          prompt_en: q.prompt_en ?? "",
          type: q.type,
          persisted: true,
          options: (q.options ?? []).map((o) => ({
            id: o.id,
            position: o.position,
            text_uz: o.text_uz ?? "",
            text_en: o.text_en ?? "",
            points: o.points,
            persisted: true,
          })),
        })),
      });
      setDeletedQuestionIds([]);
      setDeletedOptionIds([]);
      setNotice("Quiz saved.");
    } catch (err) {
      setError(friendlyAdminError(err, "Could not save the quiz. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Quiz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One quiz per article. Fill Uzbek and English — the public site shows the
            matching language. Points are shared.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save quiz"}
        </Button>
      </div>

      {attemptCount > 0 ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          This quiz has {attemptCount} saved attempt(s). Removing questions or
          choices can delete related answers.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">{notice}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quiz-title-uz">Title (UZ)</Label>
          <Input
            id="quiz-title-uz"
            value={draft.title_uz}
            onChange={(e) => updateDraft({ title_uz: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quiz-title-en">Title (EN)</Label>
          <Input
            id="quiz-title-en"
            value={draft.title_en}
            onChange={(e) => updateDraft({ title_en: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quiz-published">Publish status</Label>
          <select
            id="quiz-published"
            className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
            value={draft.is_published ? "published" : "draft"}
            onChange={(e) =>
              updateDraft({ is_published: e.target.value === "published" })
            }
          >
            <option value="draft">Unpublished</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {draft.questions.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No questions yet. Add one to start the quiz.
          </p>
        ) : null}

        {sortByPosition(draft.questions).map((question, qIndex) => (
          <section
            key={question.id}
            className="space-y-4 rounded-lg border border-border p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Question {qIndex + 1}</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveQuestion(question.id, -1)}
                  disabled={qIndex === 0}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveQuestion(question.id, 1)}
                  disabled={qIndex === draft.questions.length - 1}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(question)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`prompt-uz-${question.id}`}>Prompt (UZ)</Label>
                <Textarea
                  id={`prompt-uz-${question.id}`}
                  rows={3}
                  value={question.prompt_uz}
                  onChange={(e) =>
                    updateQuestion(question.id, { prompt_uz: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`prompt-en-${question.id}`}>Prompt (EN)</Label>
                <Textarea
                  id={`prompt-en-${question.id}`}
                  rows={3}
                  value={question.prompt_en}
                  onChange={(e) =>
                    updateQuestion(question.id, { prompt_en: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Answer choices
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(question.id)}
                >
                  Add choice
                </Button>
              </div>

              {sortByPosition(question.options).map((option, oIndex) => (
                <div
                  key={option.id}
                  className="space-y-2 rounded-md border border-border/70 p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`opt-uz-${option.id}`}>Text (UZ)</Label>
                      <Input
                        id={`opt-uz-${option.id}`}
                        value={option.text_uz}
                        onChange={(e) =>
                          updateOption(question.id, option.id, {
                            text_uz: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`opt-en-${option.id}`}>Text (EN)</Label>
                      <Input
                        id={`opt-en-${option.id}`}
                        value={option.text_en}
                        onChange={(e) =>
                          updateOption(question.id, option.id, {
                            text_en: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="w-24 space-y-1">
                      <Label htmlFor={`opt-points-${option.id}`}>Points</Label>
                      <Input
                        id={`opt-points-${option.id}`}
                        type="number"
                        value={option.points}
                        onChange={(e) =>
                          updateOption(question.id, option.id, {
                            points: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(question.id, option.id, -1)}
                      disabled={oIndex === 0}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(question.id, option.id, 1)}
                      disabled={oIndex === question.options.length - 1}
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeOption(question, option)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addQuestion}>
        Add question
      </Button>
    </form>
  );
}
