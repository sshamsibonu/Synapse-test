import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { friendlyAdminError } from "@/lib/admin/errors";
import type { ArticleRow } from "@/lib/admin/articles";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";

export default async function AdminArticlesPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, lesson_id, slug, title_uz, title_en, summary_uz, summary_en, body_uz, body_en, topic, cover_path, status, created_at, updated_at"
    )
    .order("updated_at", { ascending: false });

  const articles = (data ?? []) as ArticleRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and edit articles (Uzbek + English on one row).
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button type="button">New article</Button>
        </Link>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {friendlyAdminError(error, "Could not load articles. Please refresh.")}
        </p>
      ) : null}

      {!error && articles.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">No articles yet. Create one.</p>
          <div className="mt-4">
            <Link href="/admin/articles/new">
              <Button type="button">New article</Button>
            </Link>
          </div>
        </div>
      ) : null}

      {articles.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Topic</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const title =
                  article.title_uz || article.title_en || article.slug || "Untitled";
                const updated = article.updated_at
                  ? new Date(article.updated_at).toLocaleString()
                  : "—";
                return (
                  <tr key={article.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {title}
                      </Link>
                      <div className="text-xs text-muted-foreground">{article.slug}</div>
                    </td>
                    <td className="px-3 py-2 capitalize">{article.topic || "—"}</td>
                    <td className="px-3 py-2">
                      <AdminStatusBadge status={article.status} />
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
