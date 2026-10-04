import { friendlyAdminError } from "@/lib/admin/errors";

export type QuizOptionDraft = {
  id: string;
  position: number;
  text_uz: string;
  text_en: string;
  points: number;
  /** True if this row already exists in the database. */
  persisted: boolean;
};

export type QuizQuestionDraft = {
  id: string;
  position: number;
  prompt_uz: string;
  prompt_en: string;
  type: string;
  options: QuizOptionDraft[];
  persisted: boolean;
};

export type QuizDraft = {
  quiz_id: string | null;
  article_id: string;
  title_uz: string;
  title_en: string;
  is_published: boolean;
  questions: QuizQuestionDraft[];
};

export type SaveQuizPayload = {
  quiz_id: string | null;
  article_id: string;
  title_uz: string;
  title_en: string;
  is_published: boolean;
  questions: Array<{
    id: string;
    position: number;
    prompt_uz: string;
    prompt_en: string;
    type: string;
    options: Array<{
      id: string;
      position: number;
      text_uz: string;
      text_en: string;
      points: number;
    }>;
  }>;
  deleted_question_ids: string[];
  deleted_option_ids: string[];
};

export function newClientId(): string {
  return crypto.randomUUID();
}

export function emptyQuizDraft(articleId: string, articleTitle: string): QuizDraft {
  const base = articleTitle ? `${articleTitle} quiz` : "Article quiz";
  return {
    quiz_id: null,
    article_id: articleId,
    title_uz: base,
    title_en: base,
    is_published: false,
    questions: [],
  };
}

export function mapQuizSaveError(error: { message?: string; code?: string }): string {
  const message = error.message ?? "";
  const lower = message.toLowerCase();

  if (lower.includes("title is required")) {
    return "Enter a quiz title in Uzbek or English (or both).";
  }
  if (lower.includes("every question needs a prompt") || lower.includes("prompt")) {
    return "Every question needs a prompt in Uzbek or English (or both).";
  }
  if (lower.includes("every option needs text")) {
    return "Every answer choice needs text in Uzbek or English (or both).";
  }
  if (lower.includes("only admins") || lower.includes("not authenticated")) {
    return "You must be signed in as an admin to save quizzes.";
  }
  if (lower.includes("duplicate") || lower.includes("unique") || error.code === "23505") {
    return "This article already has a quiz, or a unique field conflicted.";
  }
  if (lower.includes("article_id")) {
    return "Save the article first, then create its quiz.";
  }
  return friendlyAdminError(error, "Could not save the quiz. Please try again.");
}

export function validateQuizDraft(draft: QuizDraft): string | null {
  if (!draft.title_uz.trim() && !draft.title_en.trim()) {
    return "Enter a quiz title in Uzbek or English (or both).";
  }
  if (draft.questions.length === 0) return "Add at least one question before saving.";

  for (let i = 0; i < draft.questions.length; i++) {
    const q = draft.questions[i];
    if (!q.prompt_uz.trim() && !q.prompt_en.trim()) {
      return `Question ${i + 1} needs a prompt in Uzbek or English.`;
    }
    if (q.options.length < 2) {
      return `Question ${i + 1} needs at least two answer choices.`;
    }
    for (let j = 0; j < q.options.length; j++) {
      const o = q.options[j];
      if (!o.text_uz.trim() && !o.text_en.trim()) {
        return `Question ${i + 1}, choice ${j + 1} needs text in Uzbek or English.`;
      }
    }
  }
  return null;
}
