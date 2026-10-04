import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { getPublishedLesson, parseBodyBlocks } from "@/lib/content/lessons";
import { SynapticThread } from "@/components/brand/synaptic-thread";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const lesson = await getPublishedLesson(slug, locale);
  if (!lesson) return {};
  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const lesson = await getPublishedLesson(slug, locale);
  if (!lesson) notFound();

  const tEmpty = await getTranslations("lessons.empty");
  const blocks = parseBodyBlocks(lesson.body);
  let paragraphIndex = 0;

  return (
    <article className="relative border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <Link
          href="/lessons"
          className="annotation inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {tEmpty("eyebrow")}
        </Link>

        <header className="mt-10 max-w-3xl">
          <p className="annotation">{tEmpty("eyebrow")}</p>
          <h1 className="display gradient-text mt-4 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
            {lesson.title}
          </h1>
          {lesson.summary ? (
            <p className="deck mt-6 text-2xl text-muted-foreground">{lesson.summary}</p>
          ) : null}
        </header>

        {lesson.videoUrl ? (
          <div className="mt-12 overflow-hidden rounded-lg border border-border">
            <div className="aspect-video bg-muted">
              <iframe
                title={lesson.title}
                src={lesson.videoUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-16 max-w-[38rem]">
          {blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} className="display mt-12 text-2xl sm:text-[1.75rem]">
                  {block.text}
                </h2>
              );
            }
            const isLead = paragraphIndex === 0;
            paragraphIndex += 1;
            return (
              <p
                key={i}
                className={
                  isLead
                    ? "mt-5 text-lg leading-[1.75] text-foreground/90"
                    : "mt-5 leading-[1.8] text-muted-foreground"
                }
              >
                {block.text}
              </p>
            );
          })}
        </div>

        <div className="flex justify-center pt-16">
          <SynapticThread variant="cross" className="h-6 w-full max-w-md text-primary/30" />
        </div>
      </div>
    </article>
  );
}
