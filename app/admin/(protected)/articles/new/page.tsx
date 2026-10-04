import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LessonOption } from "@/lib/admin/articles";
import { ArticleForm } from "@/components/admin/article-form";

async function loadLessons(): Promise<LessonOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, slug, title_uz, title_en")
    .order("position", { ascending: true });
  return (data ?? []) as LessonOption[];
}

export default async function NewArticlePage() {
  const lessons = await loadLessons();
  return <ArticleForm mode="create" lessons={lessons} />;
}
