import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/motion/reveal";

export async function ScientificPrinciples() {
  const t = await getTranslations("home.scientificPrinciples");
  const domains = t.raw("domains") as { name: string; detail: string }[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-muted-foreground">{t("description")}</p>
      </Reveal>

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain, i) => (
          <Reveal key={domain.name} delay={i * 0.05}>
            <div className="glass rounded-xl p-5">
              <h3 className="font-medium">{domain.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{domain.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
