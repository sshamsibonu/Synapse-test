import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/motion/reveal";

export async function HowItWorks() {
  const t = await getTranslations("home.howItWorks");
  const steps = t.raw("steps") as { title: string; description: string }[];

  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("heading")}</h2>
          <p className="mt-4 text-muted-foreground">{t("subheading")}</p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="relative">
                <span className="gradient-text text-4xl font-semibold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
