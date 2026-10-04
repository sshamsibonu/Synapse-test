import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import {
  getPublishedArticle,
  listPublishedArticles,
  parseBodyBlocks,
} from "@/lib/content/articles";
import { ArticleCover } from "@/components/articles/article-cover";
import { ArticleQuizGate } from "@/components/articles/article-quiz-gate";
import { Button } from "@/components/ui/button";
import { SynapticThread } from "@/components/brand/synaptic-thread";
import { ReadingProgress } from "@/components/articles/reading-progress";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getPublishedArticle(slug, locale);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const article = await getPublishedArticle(slug, locale);
  if (!article) notFound();

  const t = await getTranslations("articles");
  const format = await getFormatter();
  const blocks = parseBodyBlocks(article.body);
  const related = (await listPublishedArticles(locale))
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  let paragraphIndex = 0;

  const body = (
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

      {article.relatedTest && (
        <div className="mt-14 border-t border-border pt-8">
          <Link href={`/tests/${article.relatedTest}`}>
            <Button variant="outline" className="h-11 px-6">
              {t("tryTest")}
              <ArrowUpRight />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      <ReadingProgress />

      <article className="relative border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <Link
            href="/articles"
            className="annotation inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {t("back")}
          </Link>

          <header className="mt-10 max-w-3xl">
            <p className={`annotation inline-block border-b-2 pb-1 cat-${article.topic}`}>
              {t(`categories.${article.topic}`)}
            </p>
            <h1 className="display gradient-text mt-4 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
              {article.title}
            </h1>
            {article.summary ? (
              <p className="deck mt-6 text-2xl text-muted-foreground">{article.summary}</p>
            ) : null}

            <div className="annotation mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-5">
              <span>{t("by")}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.published}>
                {format.dateTime(new Date(article.published), {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span aria-hidden="true">·</span>
              <span>
                {article.readingMinutes} {t("minRead")}
              </span>
            </div>
          </header>

          <div className="mt-12">
            <ArticleCover
              src={article.coverSrc}
              alt={article.title}
              category={t(`categories.${article.topic}`)}
              categoryKey={article.topic}
              ratio="21 / 9"
              focal={article.focal}
              sizes="100vw"
              priority
            />
          </div>

          {article.quiz && article.quiz.questions.length > 0 ? (
            <div className="mt-16">
              <ArticleQuizGate quiz={article.quiz}>{body}</ArticleQuizGate>
            </div>
          ) : (
            body
          )}

          <div className="flex justify-center pt-16">
            <SynapticThread variant="cross" className="h-6 w-full max-w-md text-primary/30" />
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="annotation">{t("related")}</h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {related.map((a) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="group block">
                  <ArticleCover
                    src={a.coverSrc}
                    alt={a.title}
                    category={t(`categories.${a.topic}`)}
                    categoryKey={a.topic}
                    ratio="3 / 2"
                    focal={a.focal}
                    sizes="(min-width: 640px) 30vw, 100vw"
                  />
                  <p className={`annotation mt-4 cat-${a.topic}`}>
                    {t(`categories.${a.topic}`)}
                  </p>
                  <h3 className="display mt-2 text-xl leading-snug">{a.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
