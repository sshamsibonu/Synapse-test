import type * as React from "react";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { SynapticThread } from "@/components/brand/synaptic-thread";
import { Reveal } from "@/components/motion/reveal";
import { EditorialImage } from "@/components/media/editorial-image";

/**
 * Five topics, five different compositions. Deliberately not a grid of
 * identical cards — the eye should have to travel, the way it does through
 * a magazine spread.
 *
 * Every topic now carries a photograph, and the picture swaps sides down the
 * page so the eye has to travel. A topic without an image still renders — it
 * falls back to a wider typographic row rather than leaving a hole.
 */

type Topic = {
  key: string;
  /** The article slug this topic opens. */
  article: string;
  image?: {
    src: string;
    /** Matched to the asset's own proportions so nothing is distorted. */
    ratio: string;
    focal: string;
  };
};

const TOPICS: Topic[] = [
  {
    key: "memory",
    article: "forgetting-names",
    // Hands holding an open photo album; the album fills the frame.
    image: {
      src: "/images/homepage_img/02_explore_memory.jpeg",
      ratio: "3 / 2",
      focal: "50% 42%",
    },
  },
  {
    key: "attention",
    article: "automatic-reading",
    // A weathered warning sign — the thing that grabs you before you choose.
    image: {
      src: "/images/homepage_img/03_explore_attention.jpg",
      ratio: "3 / 2",
      focal: "50% 50%",
    },
  },
  {
    key: "sleep",
    article: "sleep-and-memory",
    // Dim bedroom at the window; keep both the light and the bed in frame.
    image: {
      src: "/images/homepage_img/04_explore_sleep.jpg",
      ratio: "3 / 2",
      focal: "52% 48%",
    },
  },
  {
    key: "learning",
    article: "rereading-illusion",
    // Desk flat-lay; the laptop sits left of centre.
    image: {
      src: "/images/homepage_img/05_explore_learning.jpg",
      ratio: "3 / 2",
      focal: "42% 55%",
    },
  },
  {
    key: "emotion",
    article: "feeling-and-thinking",
    // Drawn figure on concrete, upper-left of the frame.
    image: {
      src: "/images/homepage_img/06_explore_emotion.jpg",
      ratio: "3 / 2",
      focal: "30% 45%",
    },
  },
];

function TopicShell({
  article,
  children,
}: {
  article: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/articles/${article}`}
      className="group block border-t border-border py-10 transition-colors hover:bg-secondary/30 sm:py-14"
    >
      {children}
    </Link>
  );
}

export async function ExploreBrain() {
  const t = await getTranslations("home.explore");

  return (
    <section id="explore" className="relative border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <Reveal className="max-w-2xl">
          <p className="annotation">{t("eyebrow")}</p>
          <h2 className="display gradient-text mt-4 text-4xl sm:text-5xl">{t("heading")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
        </Reveal>

        <div className="mt-16">
          {TOPICS.map((topic, i) => {
            const label = (
              <>
                <div className="flex items-baseline gap-4">
                  <span className="annotation tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display text-3xl sm:text-4xl">
                    {t(`topics.${topic.key}.title`)}
                  </h3>
                </div>
                <p className="display-italic mt-2 pl-9 text-lg text-primary">
                  {t(`topics.${topic.key}.tagline`)}
                </p>
              </>
            );

            const body = (
              <>
                <p className="leading-relaxed text-muted-foreground">
                  {t(`topics.${topic.key}.body`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary">
                  {t("readMore")}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </>
            );

            const figure = (
              <div className="flex items-baseline gap-3 lg:flex-col lg:items-end lg:gap-1 lg:text-right">
                <span className="display text-3xl text-foreground">
                  {t(`topics.${topic.key}.figure`)}
                </span>
                <span className="annotation max-w-[16ch] normal-case tracking-normal">
                  {t(`topics.${topic.key}.figureLabel`)}
                </span>
              </div>
            );

            if (topic.image) {
              // Illustrated entry: picture and text share the row, and the
              // picture swaps sides down the page.
              const imageRight = i % 2 === 0;
              return (
                <Reveal key={topic.key}>
                  <TopicShell article={topic.article}>
                    <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                      <div
                        className={
                          imageRight
                            ? "lg:col-span-5 lg:order-1"
                            : "lg:col-span-5 lg:order-2 lg:col-start-8"
                        }
                      >
                        {label}
                        <div className="mt-5 max-w-md">{body}</div>
                        {/* The research figure stays marginalia even in
                            illustrated rows, so the rhythm holds. */}
                        <div className="mt-7 flex items-baseline gap-3 border-t border-border pt-4">
                          <span className="display text-2xl text-foreground">
                            {t(`topics.${topic.key}.figure`)}
                          </span>
                          <span className="annotation max-w-[22ch] normal-case tracking-normal">
                            {t(`topics.${topic.key}.figureLabel`)}
                          </span>
                        </div>
                      </div>

                      <div
                        className={
                          imageRight
                            ? "lg:col-span-6 lg:order-2 lg:col-start-7"
                            : "lg:col-span-6 lg:order-1 lg:col-start-1 lg:row-start-1"
                        }
                      >
                        <EditorialImage
                          src={topic.image.src}
                          alt={t(`topics.${topic.key}.title`)}
                          ratio={topic.image.ratio}
                          focal={topic.image.focal}
                          sizes="(min-width: 1024px) 46vw, 100vw"
                          frameClassName="transition-[filter] duration-700 group-hover:brightness-[1.03]"
                        />
                      </div>
                    </div>
                  </TopicShell>
                </Reveal>
              );
            }

            // Typographic entry: no picture, so the marginal figure carries
            // the right-hand column and the row breathes wider.
            return (
              <Reveal key={topic.key}>
                <TopicShell article={topic.article}>
                  <div className="grid gap-6 lg:grid-cols-12 lg:items-baseline">
                    <div className="lg:col-span-4 lg:col-start-2">{label}</div>
                    <div className="lg:col-span-4">{body}</div>
                    <div className="lg:col-span-2">{figure}</div>
                  </div>
                </TopicShell>
              </Reveal>
            );
          })}
          <div className="border-t border-border" />
        </div>

        {/* The thread carries the eye out of the section */}
        <div className="flex justify-center pt-10">
          <SynapticThread variant="cross" className="h-6 w-full max-w-md text-primary/30" />
        </div>
      </div>
    </section>
  );
}
