import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export async function CtaBand() {
  const t = await getTranslations("home.ctaBand");

  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">{t("description")}</p>
          <Link href="/tests" className="mt-8 inline-block">
            <Button size="lg" className="h-11 px-6 text-base">
              {t("cta")}
              <ArrowRight />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
