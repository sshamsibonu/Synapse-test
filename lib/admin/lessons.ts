import { friendlyAdminError } from "@/lib/admin/errors";

export type LessonStatus = "draft" | "published";

export type LessonRow = {
  id: string;
  slug: string;
  title_uz: string | null;
  title_en: string | null;
  summary_uz: string | null;
  summary_en: string | null;
  body_uz: string | null;
  body_en: string | null;
  video_url: string | null;
  position: number | null;
  status: LessonStatus;
  created_at: string;
  updated_at: string;
};

export type LessonFormValues = {
  title_uz: string;
  title_en: string;
  summary_uz: string;
  summary_en: string;
  body_uz: string;
  body_en: string;
  slug: string;
  youtubeInput: string;
  status: LessonStatus;
};

export function emptyLessonForm(): LessonFormValues {
  return {
    title_uz: "",
    title_en: "",
    summary_uz: "",
    summary_en: "",
    body_uz: "",
    body_en: "",
    slug: "",
    youtubeInput: "",
    status: "draft",
  };
}

export function lessonToFormValues(lesson: LessonRow): LessonFormValues {
  return {
    title_uz: lesson.title_uz ?? "",
    title_en: lesson.title_en ?? "",
    summary_uz: lesson.summary_uz ?? "",
    summary_en: lesson.summary_en ?? "",
    body_uz: lesson.body_uz ?? "",
    body_en: lesson.body_en ?? "",
    slug: lesson.slug ?? "",
    youtubeInput: lesson.video_url ?? "",
    status: lesson.status === "published" ? "published" : "draft",
  };
}

/** Map common Postgres/Supabase errors to short admin messages. */
export function mapLessonSaveError(error: { code?: string; message?: string }): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "23505" || message.includes("duplicate") || message.includes("unique")) {
    return "That slug is already used. Choose a different slug.";
  }
  if (message.includes("video_url") || message.includes("youtube")) {
    return "The YouTube link is not valid. Use a normal YouTube watch or share link.";
  }
  if (message.includes("null value") && message.includes("slug")) {
    return "Slug is required.";
  }
  if (message.includes("null value") && message.includes("title")) {
    return "At least one title is required.";
  }
  return friendlyAdminError(error, "Could not save the lesson. Please try again.");
}
