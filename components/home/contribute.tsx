import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SynapticThread } from "@/components/brand/synaptic-thread";

export async function Contribute() {
  const t = await getTranslations("home.contribute");
  const assurances = t.raw("assurances") as string[];

  return (
    <section id="contribute" className="relative border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-6">
            <p className="annotation">{t("eyebrow")}</p>
            <h2 className="display gradient-text mt-4 text-4xl sm:text-5xl">{t("heading")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("body")}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/tests">
                <Button size="lg" className="h-11 w-full px-6 text-base sm:w-auto">
                  {t("cta")}
                  <ArrowRight />
                </Button>
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-primary underline underline-offset-4 sm:ml-2"
              >
                {t("secondary")}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-5 lg:col-start-8">
            {/* Assurances as an annotated list, tied together by the thread */}
            <ul className="space-y-6">
              {assurances.map((line, i) => (
                <li key={i} className="flex gap-4 border-t border-border pt-6">
                  <span className="annotation mt-0.5 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{line}</span>
                </li>
              ))}
            </ul>

            <SynapticThread
              variant="arc"
              className="mt-8 h-10 w-full text-primary/30"
              showNodes={false}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
