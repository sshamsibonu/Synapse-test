import { LessonForm } from "@/components/admin/lesson-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LessonRow } from "@/lib/admin/lessons";
import { notFound } from "next/navigation";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, video_url, position, status, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return <LessonForm mode="edit" lesson={data as LessonRow} />;
}
