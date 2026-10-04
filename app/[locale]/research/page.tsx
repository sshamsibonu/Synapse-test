import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Brain, Clock, Smartphone, Users, Zap } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { PulseIcon } from "@/components/motion/pulse-icon";

const TOPIC_ICONS = [Brain, Zap, Smartphone, Clock, Users];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "research" });
  return { title: t("eyebrow"), description: t("description") };
}

export default async function ResearchPage() {
  const t = await getTranslations("research");
  const dataPoints = t.raw("dataPoints") as { label: string; detail: string }[];
  const topics = t.raw("topics.items") as { title: string; description: string }[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">{t("questionHeading")}</h2>
          <p className="mt-4 text-muted-foreground">{t("questionParagraph")}</p>
        </Reveal>

        <Reveal delay={0.08} className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">{t("topics.heading")}</h2>
          <p className="mt-4 text-muted-foreground">{t("topics.description")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {topics.map((topic, i) => {
              const Icon = TOPIC_ICONS[i % TOPIC_ICONS.length];
              return (
                <Card key={topic.title} className="glass">
                  <CardContent className="p-5">
                    <PulseIcon
                      delay={i * 0.25}
                      className="flex size-9 items-center justify-center rounded-lg bg-primary/10"
                    >
                      <Icon className="size-4 text-primary" />
                    </PulseIcon>
                    <h3 className="mt-3 font-medium">{topic.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{topic.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">{t("collectedHeading")}</h2>
          <div className="mt-6 grid gap-4">
            {dataPoints.map((point) => (
              <Card key={point.label}>
                <CardContent className="p-5">
                  <h3 className="font-medium">{point.label}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{point.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {t("fullDetail")}{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              {t("privacyPolicyLink")}
            </Link>
            .
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">{t("voluntaryHeading")}</h2>
          <p className="mt-4 text-muted-foreground">{t("voluntaryParagraph")}</p>
          <Link href="/tests" className="mt-6 inline-block">
            <Button>{t("tryTest")}</Button>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
