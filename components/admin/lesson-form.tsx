"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/admin/slug";
import { parseYoutubeInput } from "@/lib/admin/youtube";
import { friendlyAdminError } from "@/lib/admin/errors";
import {
  emptyLessonForm,
  lessonToFormValues,
  mapLessonSaveError,
  type LessonFormValues,
  type LessonRow,
  type LessonStatus,
} from "@/lib/admin/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  mode: "create" | "edit";
  lesson?: LessonRow;
};

export function LessonForm({ mode, lesson }: Props) {
  const router = useRouter();
  const [values, setValues] = React.useState<LessonFormValues>(() =>
    lesson ? lessonToFormValues(lesson) : emptyLessonForm()
  );
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const youtubePreview = React.useMemo(() => {
    if (!values.youtubeInput.trim()) return null;
    return parseYoutubeInput(values.youtubeInput);
  }, [values.youtubeInput]);

  function update<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title_uz" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!values.title_uz.trim() && !values.title_en.trim()) {
      setError("Enter a title in Uzbek or English (or both).");
      return;
    }

    const slug = values.slug.trim() || slugify(values.title_uz || values.title_en);
    if (!slug) {
      setError("Slug is required. Add a title or type a slug.");
      return;
    }

    let videoUrl: string | null = null;
    if (values.youtubeInput.trim()) {
      const parsed = parseYoutubeInput(values.youtubeInput);
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      videoUrl = parsed.embedUrl;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        slug,
        title_uz: values.title_uz.trim() || null,
        title_en: values.title_en.trim() || null,
        summary_uz: values.summary_uz.trim() || null,
        summary_en: values.summary_en.trim() || null,
        body_uz: values.body_uz.trim() || null,
        body_en: values.body_en.trim() || null,
        video_url: videoUrl,
        status: values.status as LessonStatus,
        updated_at: new Date().toISOString(),
      };

      if (mode === "create") {
        const { data: maxRow } = await supabase
          .from("lessons")
          .select("position")
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle();

        const position = typeof maxRow?.position === "number" ? maxRow.position + 1 : 0;

        const { data, error: insertError } = await supabase
          .from("lessons")
          .insert({ ...payload, position })
          .select("id")
          .single();

        if (insertError) {
          setError(mapLessonSaveError(insertError));
          return;
        }
        router.replace(`/admin/lessons/${data.id}`);
        router.refresh();
        return;
      }

      const { error: updateError } = await supabase
        .from("lessons")
        .update(payload)
        .eq("id", lesson!.id);

      if (updateError) {
        setError(mapLessonSaveError(updateError));
        return;
      }

      setNotice("Saved.");
      setValues((prev) => ({ ...prev, slug, youtubeInput: videoUrl ?? "" }));
      router.refresh();
    } catch (err) {
      setError(friendlyAdminError(err, "Could not save the lesson. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!lesson) return;
    const ok = window.confirm(
      `Delete lesson “${lesson.title_uz || lesson.title_en || lesson.slug}”? This cannot be undone.`
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from("lessons").delete().eq("id", lesson.id);

      if (deleteError) {
        setError(friendlyAdminError(deleteError, "Could not delete the lesson."));
        return;
      }

      router.replace("/admin/lessons");
      router.refresh();
    } catch (err) {
      setError(friendlyAdminError(err, "Could not delete the lesson."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/lessons" className="text-sm text-muted-foreground hover:text-foreground">
            ← Lessons
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {mode === "create" ? "New lesson" : "Edit lesson"}
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
          <Label htmlFor="lesson-slug">Slug (URL id, shared)</Label>
          <Input
            id="lesson-slug"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            placeholder="e.g. sleep-and-memory"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lesson-status">Status</Label>
          <select
            id="lesson-status"
            className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
            value={values.status}
            onChange={(e) => update("status", e.target.value as LessonStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
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

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">YouTube</h2>
        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube link</Label>
          <Input
            id="youtube"
            value={values.youtubeInput}
            onChange={(e) => update("youtubeInput", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <p className="text-xs text-muted-foreground">
            Paste a normal YouTube link (not iframe code). Leave empty for no video.
          </p>
        </div>

        {values.youtubeInput.trim() && youtubePreview && !youtubePreview.ok ? (
          <p className="text-sm text-destructive">{youtubePreview.message}</p>
        ) : null}

        {youtubePreview?.ok ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="aspect-video bg-muted">
              <iframe
                title="YouTube preview"
                src={youtubePreview.embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Will save as: {youtubePreview.embedUrl}
            </p>
          </div>
        ) : null}
      </section>
    </form>
  );
}
