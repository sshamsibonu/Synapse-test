import { getTranslations } from "next-intl/server";
import { Brain, LineChart, ShieldCheck, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { PulseIcon } from "@/components/motion/pulse-icon";

const ICONS = [Brain, LineChart, Sparkles, ShieldCheck];

export async function FeaturesSection() {
  const t = await getTranslations("home.features");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-muted-foreground">{t("subheading")}</p>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((feature, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Reveal key={feature.title} delay={i * 0.08}>
              <Card className="glass h-full">
                <CardContent className="p-6">
                  <PulseIcon
                    delay={i * 0.3}
                    className="flex size-10 items-center justify-center rounded-lg bg-primary/10"
                  >
                    <Icon className="size-5 text-primary" />
                  </PulseIcon>
                  <h3 className="mt-4 font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
