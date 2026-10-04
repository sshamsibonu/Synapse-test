import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicLesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  videoUrl: string | null;
  position: number;
  updatedAt: string;
};

type LessonRow = {
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
  status: string;
  updated_at: string;
};

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

function toPublicLesson(row: LessonRow, locale: string): PublicLesson | null {
  const title = pickLocale(locale, row.title_uz, row.title_en);
  if (!title) return null;

  return {
    id: row.id,
    slug: row.slug,
    title,
    summary: pickLocale(locale, row.summary_uz, row.summary_en),
    body: pickLocale(locale, row.body_uz, row.body_en),
    videoUrl: row.video_url,
    position: row.position ?? 0,
    updatedAt: row.updated_at,
  };
}

export async function listPublishedLessons(locale: string): Promise<PublicLesson[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("lessons")
      .select(
        "id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, video_url, position, status, updated_at"
      )
      .eq("status", "published")
      .order("position", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error || !data) return [];
    return (data as LessonRow[])
      .map((row) => toPublicLesson(row, locale))
      .filter((l): l is PublicLesson => Boolean(l));
  } catch {
    return [];
  }
}

export async function getPublishedLesson(
  slug: string,
  locale: string
): Promise<PublicLesson | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("lessons")
      .select(
        "id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, video_url, position, status, updated_at"
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;
    return toPublicLesson(data as LessonRow, locale);
  } catch {
    return null;
  }
}

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
