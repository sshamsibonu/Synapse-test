import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { friendlyAdminError } from "@/lib/admin/errors";
import type { LessonRow } from "@/lib/admin/lessons";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";

export default async function AdminLessonsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, video_url, position, status, created_at, updated_at"
    )
    .order("position", { ascending: true })
    .order("updated_at", { ascending: false });

  const lessons = (data ?? []) as LessonRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Lessons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and edit video lessons (Uzbek + English on one row).
          </p>
        </div>
        <Link href="/admin/lessons/new">
          <Button type="button">New lesson</Button>
        </Link>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {friendlyAdminError(error, "Could not load lessons. Please refresh.")}
        </p>
      ) : null}

      {!error && lessons.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">No lessons yet. Create one.</p>
          <div className="mt-4">
            <Link href="/admin/lessons/new">
              <Button type="button">New lesson</Button>
            </Link>
          </div>
        </div>
      ) : null}

      {lessons.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => {
                const title =
                  lesson.title_uz || lesson.title_en || lesson.slug || "Untitled";
                const updated = lesson.updated_at
                  ? new Date(lesson.updated_at).toLocaleString()
                  : "—";
                return (
                  <tr key={lesson.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/lessons/${lesson.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {title}
                      </Link>
                      <div className="text-xs text-muted-foreground">{lesson.slug}</div>
                    </td>
                    <td className="px-3 py-2">
                      <AdminStatusBadge status={lesson.status} />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{updated}</td>
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
