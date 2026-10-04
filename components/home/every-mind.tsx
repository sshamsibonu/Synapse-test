import { getTranslations } from "next-intl/server";

import { TraceFigure } from "@/components/home/trace-figure";
import { CountUp } from "@/components/home/count-up";
import { Reveal } from "@/components/motion/reveal";

export async function EveryMind() {
  const t = await getTranslations("home.trace");

  const labels = {
    memory: t("domains.memory"),
    sleep: t("domains.sleep"),
    focus: t("domains.focus"),
    learning: t("domains.learning"),
    emotion: t("domains.emotion"),
  };

  return (
    <section id="trace" className="relative border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <p className="annotation">{t("eyebrow")}</p>
            <h2 className="display gradient-text mt-4 text-4xl sm:text-5xl">{t("heading")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>

            {/* Research figures, as marginalia rather than stat cards */}
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7">
              <div>
                <dt className="display text-4xl text-primary">
                  <CountUp to={7} />
                </dt>
                <dd className="annotation mt-1 normal-case tracking-normal">
                  {t("stats.domainsLabel")}
                </dd>
              </div>
              <div>
                <dt className="display text-4xl text-primary">{t("stats.anonValue")}</dt>
                <dd className="annotation mt-1 normal-case tracking-normal">
                  {t("stats.anonLabel")}
                </dd>
              </div>
              <div>
                <dt className="display text-4xl text-primary">
                  <CountUp to={0} />
                </dt>
                <dd className="annotation mt-1 normal-case tracking-normal">
                  {t("stats.diagnosesLabel")}
                </dd>
              </div>
              <div>
                <dt className="display text-4xl text-primary">{t("stats.openValue")}</dt>
                <dd className="annotation mt-1 normal-case tracking-normal">
                  {t("stats.openLabel")}
                </dd>
              </div>
            </dl>
          </Reveal>

          {/* The figure itself */}
          <Reveal delay={0.12} className="lg:col-span-7">
            <figure>
              <TraceFigure
                labels={labels}
                annotation1={t("annotation1")}
                annotation2={t("annotation2")}
              />
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("figureCaption")}
                </p>
                <p className="annotation mt-2">{t("source")}</p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
