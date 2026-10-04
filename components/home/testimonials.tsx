import { getTranslations } from "next-intl/server";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";

export async function Testimonials() {
  const t = await getTranslations("home.testimonials");
  const quotes = t.raw("quotes") as string[];
  const role = t("role");

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="inline-flex">
          <Badge variant="secondary">{t("badge")}</Badge>
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {quotes.map((quote, i) => (
          <Reveal key={quote} delay={i * 0.08}>
            <Card className="glass h-full">
              <CardContent className="flex h-full flex-col p-6">
                <p className="flex-1 text-sm text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  {role}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
