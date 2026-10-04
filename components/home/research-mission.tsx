import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";

export async function ResearchMission() {
  const t = await getTranslations("home.researchMission");
  const stats = t.raw("stats") as { value: string; label: string }[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("paragraph1")}</p>
          <p className="mt-4 text-muted-foreground">{t("paragraph2")}</p>
          <Link href="/research" className="mt-6 inline-block">
            <Button variant="outline">
              {t("cta")}
              <ArrowRight />
            </Button>
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="glass">
            <CardContent className="grid grid-cols-2 gap-6 p-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="gradient-text text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
