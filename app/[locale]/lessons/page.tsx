import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Clock } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { listPublishedLessons } from "@/lib/content/lessons";
import { Button } from "@/components/ui/button";
import { FormingNetwork } from "@/components/lessons/forming-network";
import { Reveal } from "@/components/motion/reveal";
import { SynapticThread } from "@/components/brand/synaptic-thread";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lessons = await listPublishedLessons(locale);
  if (lessons.length === 0) {
    const t = await getTranslations({ locale, namespace: "lessons.empty" });
    return { title: t("eyebrow"), description: t("intro") };
  }
  const t = await getTranslations({ locale, namespace: "lessons.catalog" });
  return { title: t("title"), description: t("intro") };
}

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lessons = await listPublishedLessons(locale);
  const tEmpty = await getTranslations("lessons.empty");
  const tCatalog = await getTranslations("lessons.catalog");

  if (lessons.length === 0) {
    return (
      <section className="relative flex min-h-[78vh] items-center border-b border-border">
        <div className="paper pointer-events-none absolute inset-0 opacity-50" />

        <div className="relative mx-auto w-full max-w-5xl px-4 py-24 sm:px-6">
          <div className="max-w-xl">
            <p className="annotation">{tEmpty("eyebrow")}</p>
            <h1 className="display gradient-text mt-5 text-5xl sm:text-6xl">
              {tEmpty("title")}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {tEmpty("intro")}
            </p>
          </div>

          <div className="mt-14">
            <FormingNetwork className="h-auto w-full max-w-3xl" />
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="annotation max-w-sm normal-case tracking-normal">{tEmpty("note")}</p>
            <Link href="/articles" className="shrink-0">
              <Button variant="outline" className="h-11 px-6">
                {tEmpty("cta")}
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="annotation">{tCatalog("eyebrow")}</p>
          <h1 className="display gradient-text mt-4 text-5xl sm:text-6xl">{tCatalog("title")}</h1>
          <p className="deck mt-5 text-xl text-muted-foreground">{tCatalog("intro")}</p>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <Reveal key={lesson.id}>
              <Link href={`/lessons/${lesson.slug}`} className="group block">
                <h2 className="display text-2xl leading-snug group-hover:text-primary">
                  {lesson.title}
                </h2>
                {lesson.summary ? (
                  <p className="deck mt-3 text-muted-foreground">{lesson.summary}</p>
                ) : null}
                <div className="annotation mt-4 inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {lesson.videoUrl ? tCatalog("videoLesson") : tCatalog("lesson")}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="flex justify-center pt-16">
          <SynapticThread variant="cross" className="h-6 w-full max-w-md text-primary/30" />
        </div>
      </div>
    </section>
  );
}
