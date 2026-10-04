import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BookOpen, Brain, ShieldCheck, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { PulseIcon } from "@/components/motion/pulse-icon";

const ICONS = [Brain, ShieldCheck, Users, BookOpen];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("eyebrow"), description: t("description") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const principles = t.raw("principles") as { title: string; description: string }[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">{t("whyHeading")}</h2>
          <p className="mt-4 text-muted-foreground">{t("whyParagraph1")}</p>
          <p className="mt-4 text-muted-foreground">{t("whyParagraph2")}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">{t("guidesHeading")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {principles.map((principle, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Card key={principle.title} className="glass">
                  <CardContent className="p-6">
                    <PulseIcon
                      delay={i * 0.3}
                      className="flex size-10 items-center justify-center rounded-lg bg-primary/10"
                    >
                      <Icon className="size-5 text-primary" />
                    </PulseIcon>
                    <h3 className="mt-4 font-medium">{principle.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {principle.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Reveal>
      </section>
    </>
  );
}
