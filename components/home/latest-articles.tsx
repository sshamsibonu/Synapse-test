import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";

export async function LatestArticles() {
  const t = await getTranslations("home.latestArticles");
  const topics = t.raw("topics") as { category: string; title: string }[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <Badge variant="secondary">{t("badge")}</Badge>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="max-w-xl text-muted-foreground">{t("description")}</p>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {topics.map((article, i) => (
          <Reveal key={article.title} delay={i * 0.08}>
            <Card className="h-full opacity-70">
              <CardContent className="p-6">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">
                  {article.category}
                </p>
                <h3 className="mt-1.5 font-medium">{article.title}</h3>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
