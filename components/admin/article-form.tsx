"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/admin/slug";
import { friendlyAdminError } from "@/lib/admin/errors";
import { ARTICLE_IMAGES_BUCKET, articleCoverPublicUrl } from "@/lib/admin/storage";
import {
  ARTICLE_TOPICS,
  articleToFormValues,
  emptyArticleForm,
  lessonOptionLabel,
  mapArticleSaveError,
  type ArticleFormValues,
  type ArticleRow,
  type ArticleStatus,
  type ArticleTopic,
  type LessonOption,
} from "@/lib/admin/articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  mode: "create" | "edit";
  article?: ArticleRow;
  lessons: LessonOption[];
};

export function ArticleForm({ mode, article, lessons }: Props) {
  const router = useRouter();
  const [values, setValues] = React.useState<ArticleFormValues>(() =>
    article ? articleToFormValues(article) : emptyArticleForm()
  );
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [coverPath, setCoverPath] = React.useState<string | null>(article?.cover_path ?? null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(
    () => articleCoverPublicUrl(article?.cover_path ?? null)
  );
  const [removeCover, setRemoveCover] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function update<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title_uz" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function onCoverPick(file: File | null) {
    setCoverFile(file);
    setRemoveCover(false);
    if (!file) {
      setCoverPreview(articleCoverPublicUrl(coverPath));
      return;
    }
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

  async function uploadCover(supabase: ReturnType<typeof createClient>, articleId: string) {
    if (!coverFile) return coverPath;

    const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${articleId}/cover-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(ARTICLE_IMAGES_BUCKET)
      .upload(path, coverFile, { upsert: true, contentType: coverFile.type });

    if (uploadError) {
      const msg = (uploadError.message || "").toLowerCase();
      if (msg.includes("bucket") && msg.includes("not found")) {
        throw new Error(
          'Storage bucket "article-images" not found. Create it in Supabase (Storage) or run scripts/create-article-images-bucket.sql.'
        );
      }
      throw uploadError;
    }

    if (coverPath && coverPath !== path) {
      await supabase.storage.from(ARTICLE_IMAGES_BUCKET).remove([coverPath]);
    }

    return path;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!values.title_uz.trim() && !values.title_en.trim()) {
      setError("Enter a title in Uzbek or English (or both).");
      return;
    }

    if (!values.topic) {
      setError("Pick a topic.");
      return;
    }

    const slug = values.slug.trim() || slugify(values.title_uz || values.title_en);
    if (!slug) {
      setError("Slug is required. Add a title or type a slug.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const basePayload = {
        slug,
        title_uz: values.title_uz.trim() || null,
        title_en: values.title_en.trim() || null,
        summary_uz: values.summary_uz.trim() || null,
        summary_en: values.summary_en.trim() || null,
        body_uz: values.body_uz.trim() || null,
        body_en: values.body_en.trim() || null,
        topic: values.topic as ArticleTopic,
        lesson_id: values.lesson_id.trim() || null,
        status: values.status as ArticleStatus,
        updated_at: new Date().toISOString(),
      };

      let articleId = article?.id;

      if (mode === "create") {
        const { data, error: insertError } = await supabase
          .from("articles")
          .insert(basePayload)
          .select("id")
          .single();

        if (insertError) {
          setError(mapArticleSaveError(insertError));
          return;
        }
        articleId = data.id;
      } else {
        const { error: updateError } = await supabase
          .from("articles")
          .update(basePayload)
          .eq("id", article!.id);

        if (updateError) {
          setError(mapArticleSaveError(updateError));
          return;
        }
      }

      let nextCoverPath = coverPath;
      if (removeCover) {
        if (coverPath) {
          await supabase.storage.from(ARTICLE_IMAGES_BUCKET).remove([coverPath]);
        }
        nextCoverPath = null;
      } else if (coverFile && articleId) {
        nextCoverPath = await uploadCover(supabase, articleId);
      }

      if (articleId && nextCoverPath !== (article?.cover_path ?? null)) {
        const { error: coverError } = await supabase
          .from("articles")
          .update({ cover_path: nextCoverPath })
          .eq("id", articleId);
        if (coverError) {
          setError(mapArticleSaveError(coverError));
          return;
        }
      }

      setCoverPath(nextCoverPath);
      setCoverFile(null);
      setRemoveCover(false);
      setCoverPreview(articleCoverPublicUrl(nextCoverPath));

      if (mode === "create" && articleId) {
        router.replace(`/admin/articles/${articleId}`);
        router.refresh();
        return;
      }

      setNotice("Saved.");
      setValues((prev) => ({ ...prev, slug }));
      router.refresh();
    } catch (err) {
      setError(friendlyAdminError(err, "Could not save the article. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!article) return;
    const ok = window.confirm(
      `Delete article “${article.title_uz || article.title_en || article.slug}”? This cannot be undone.`
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from("articles").delete().eq("id", article.id);

      if (deleteError) {
        setError(friendlyAdminError(deleteError, "Could not delete the article."));
        return;
      }

      router.replace("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(friendlyAdminError(err, "Could not delete the article."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/articles"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Articles
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {mode === "create" ? "New article" : "Edit article"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              disabled={deleting || saving}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          ) : null}
          <Button type="submit" disabled={saving || deleting}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">{notice}</p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-slug">Slug (URL id, shared)</Label>
          <Input
            id="article-slug"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            placeholder="e.g. forgetting-names"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="article-topic">Topic</Label>
          <select
            id="article-topic"
            className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
            value={values.topic}
            onChange={(e) => update("topic", e.target.value as ArticleTopic | "")}
            required
          >
            <option value="">Select topic…</option>
            {ARTICLE_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="article-status">Status</Label>
          <select
            id="article-status"
            className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
            value={values.status}
            onChange={(e) => update("status", e.target.value as ArticleStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="article-lesson">Linked lesson (optional)</Label>
          <select
            id="article-lesson"
            className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
            value={values.lesson_id}
            onChange={(e) => update("lesson_id", e.target.value)}
          >
            <option value="">None</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lessonOptionLabel(lesson)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 sm:col-span-2">
          <Label htmlFor="article-cover">Cover image</Label>
          <Input
            id="article-cover"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => onCoverPick(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Uploaded to Supabase Storage (bucket: article-images).
          </p>
          {coverPreview ? (
            <div className="overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="Cover preview" className="max-h-56 w-full object-cover" />
            </div>
          ) : null}
          {(coverPath || coverFile) && !removeCover ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRemoveCover(true);
                setCoverFile(null);
                setCoverPreview(null);
              }}
            >
              Remove cover
            </Button>
          ) : null}
          {removeCover ? (
            <p className="text-xs text-muted-foreground">Cover will be removed on Save.</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Uzbek</h2>
        <div className="space-y-2">
          <Label htmlFor="title_uz">Title (UZ)</Label>
          <Input
            id="title_uz"
            value={values.title_uz}
            onChange={(e) => update("title_uz", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary_uz">Summary (UZ)</Label>
          <Textarea
            id="summary_uz"
            rows={3}
            value={values.summary_uz}
            onChange={(e) => update("summary_uz", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body_uz">Body (UZ)</Label>
          <Textarea
            id="body_uz"
            rows={10}
            value={values.body_uz}
            onChange={(e) => update("body_uz", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">English</h2>
        <div className="space-y-2">
          <Label htmlFor="title_en">Title (EN)</Label>
          <Input
            id="title_en"
            value={values.title_en}
            onChange={(e) => update("title_en", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary_en">Summary (EN)</Label>
          <Textarea
            id="summary_en"
            rows={3}
            value={values.summary_en}
            onChange={(e) => update("summary_en", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body_en">Body (EN)</Label>
          <Textarea
            id="body_en"
            rows={10}
            value={values.body_en}
            onChange={(e) => update("body_en", e.target.value)}
          />
        </div>
      </section>
    </form>
  );
}
