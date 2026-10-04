import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles } from "lucide-react";

import { getServiceRoleClient } from "@/lib/supabase/server";
import { getTestDefinition } from "@/lib/tests/definitions";
import type { CognitiveDomain } from "@/types/database";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getSharedResult(id: string) {
  try {
    const supabase = getServiceRoleClient();
    const { data } = await supabase
      .from("test_results")
      .select("id, test_id, domain_scores")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    const definition = getTestDefinition(data.test_id);
    if (!definition) return null;
    return { result: data, definition };
  } catch {
    // Supabase isn't configured (or is unreachable) — treat as not found
    // rather than crashing this public-facing page.
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const found = await getSharedResult(id);
  const t = await getTranslations({ locale, namespace: "share" });
  if (!found) return { title: t("notFoundTitle") };

  const tItem = await getTranslations({ locale, namespace: `tests.items.${found.definition.id}` });
  const scores = Object.values(found.result.domain_scores) as number[];
  const score = scores[0] ?? 0;

  return {
    title: t("pageTitle", { testName: tItem("name") }),
    description: t("shareText", { score, testName: tItem("name") }),
  };
}

export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = await getSharedResult(id);
  if (!found) notFound();

  const { result, definition } = found;
  const t = await getTranslations("share");
  const tDomains = await getTranslations("domains");
  const tItem = await getTranslations(`tests.items.${definition.id}`);

  const scores = Object.entries(result.domain_scores) as [CognitiveDomain, number][];

  return (
    <>
      <PageHeader eyebrow={t("pageEyebrow")} title={t("pageTitle", { testName: tItem("name") })} />

      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="space-y-5 p-6">
            {scores.map(([domain, score]) => (
              <div key={domain}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{tDomains(domain)}</span>
                  <span className="tabular-nums text-muted-foreground">{score}/100</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                    style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass mt-6">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium">{t("whatThisMeasures")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{tItem("scientificExplanation")}</p>
          </CardContent>
        </Card>

        <Card className="glass mt-6">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-medium">{t("ctaTryTest")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tItem("description")}</p>
              </div>
            </div>
            <Link href={`/tests/${definition.id}`} className="w-full shrink-0 sm:w-auto">
              <Button className="w-full sm:w-auto">
                {t("ctaTryTest")}
                <ArrowRight />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">{t("disclaimer")}</p>

        <div className="mt-6 text-center">
          <Link href="/tests" className="text-sm text-primary underline underline-offset-4">
            {t("ctaExploreAll")}
          </Link>
        </div>
      </section>
    </>
  );
}
