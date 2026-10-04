import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { listPublishedArticles, type PublicArticle } from "@/lib/content/articles";
import { ArticleCover } from "@/components/articles/article-cover";
import { Reveal } from "@/components/motion/reveal";
import { SynapticThread } from "@/components/brand/synaptic-thread";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  return { title: t("eyebrow"), description: t("intro") };
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("articles");
  const format = await getFormatter();
  const articles = await listPublishedArticles(locale);

  const meta = (a: PublicArticle) => (
    <div className="annotation flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className={`cat-${a.topic}`}>{t(`categories.${a.topic}`)}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={a.published}>
        {format.dateTime(new Date(a.published), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
      <span aria-hidden="true">·</span>
      <span>
        {a.readingMinutes} {t("minRead")}
      </span>
    </div>
  );

  if (articles.length === 0) {
    return (
      <section className="relative border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <Reveal className="max-w-2xl">
            <p className="annotation">{t("eyebrow")}</p>
            <h1 className="display gradient-text mt-4 text-5xl sm:text-6xl">{t("title")}</h1>
            <p className="deck mt-5 text-xl text-muted-foreground">{t("intro")}</p>
            <p className="mt-10 text-muted-foreground">{t("noneYet")}</p>
          </Reveal>
        </div>
      </section>
    );
  }

  const [featured, ...rest] = articles;
  const pairOne = rest.slice(0, 2);
  const wide = rest[2];
  const pairTwo = rest.slice(3);

  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="annotation">{t("eyebrow")}</p>
          <h1 className="display gradient-text mt-4 text-5xl sm:text-6xl">{t("title")}</h1>
          <p className="deck mt-5 text-xl text-muted-foreground">{t("intro")}</p>
        </Reveal>

        <Reveal className="mt-16">
          <Link href={`/articles/${featured.slug}`} className="group block">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <ArticleCover
                  src={featured.coverSrc}
                  alt={featured.title}
                  category={t(`categories.${featured.topic}`)}
                  categoryKey={featured.topic}
                  ratio="16 / 9"
                  focal={featured.focal}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center lg:col-span-5">
                <p
                  className={`annotation inline-block border-b-2 pb-1 cat-${featured.topic}`}
                >
                  {t(`categories.${featured.topic}`)}
                </p>
                <h2 className="display mt-4 text-3xl leading-tight sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="deck mt-4 text-lg text-muted-foreground">{featured.summary}</p>
                <div className="mt-6">{meta(featured)}</div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary">
                  {t("readMore")}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>

        <div className="mt-20 border-t border-border pt-16">
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-10">
            {pairOne.map((a) => (
              <Reveal key={a.id}>
                <Link href={`/articles/${a.slug}`} className="group block">
                  <ArticleCover
                    src={a.coverSrc}
                    alt={a.title}
                    category={t(`categories.${a.topic}`)}
                    categoryKey={a.topic}
                    ratio="4 / 3"
                    focal={a.focal}
                    sizes="(min-width: 640px) 45vw, 100vw"
                  />
                  <h3 className="display mt-5 text-2xl leading-snug">{a.title}</h3>
                  <p className="deck mt-3 text-muted-foreground">{a.summary}</p>
                  <div className="mt-4">{meta(a)}</div>
                </Link>
              </Reveal>
            ))}
          </div>

          {wide && (
            <Reveal className="mt-16 border-t border-border pt-16">
              <Link href={`/articles/${wide.slug}`} className="group block">
                <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-6">
                    <ArticleCover
                      src={wide.coverSrc}
                      alt={wide.title}
                      category={t(`categories.${wide.topic}`)}
                      categoryKey={wide.topic}
                      ratio="3 / 2"
                      focal={wide.focal}
                      sizes="(min-width: 1024px) 48vw, 100vw"
                    />
                  </div>
                  <div className="lg:col-span-5 lg:col-start-8">
                    <h3 className="display text-3xl leading-snug">{wide.title}</h3>
                    <p className="deck mt-4 text-lg text-muted-foreground">{wide.summary}</p>
                    <div className="mt-5">{meta(wide)}</div>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="mt-16 grid gap-12 border-t border-border pt-16 sm:grid-cols-2 sm:gap-10">
            {pairTwo.map((a, i) => (
              <Reveal key={a.id} className={i === 1 ? "sm:mt-14" : undefined}>
                <Link href={`/articles/${a.slug}`} className="group block">
                  <ArticleCover
                    src={a.coverSrc}
                    alt={a.title}
                    category={t(`categories.${a.topic}`)}
                    categoryKey={a.topic}
                    ratio="3 / 2"
                    focal={a.focal}
                    sizes="(min-width: 640px) 45vw, 100vw"
                  />
                  <h3 className="display mt-5 text-2xl leading-snug">{a.title}</h3>
                  <p className="deck mt-3 text-muted-foreground">{a.summary}</p>
                  <div className="mt-4">{meta(a)}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-16">
          <SynapticThread variant="cross" className="h-6 w-full max-w-md text-primary/30" />
        </div>
      </div>
    </section>
  );
}
