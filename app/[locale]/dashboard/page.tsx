import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { getAnonSessionId } from "@/lib/session";
import { createServerSupabaseClient, getServiceRoleClient } from "@/lib/supabase/server";
import { ensureParticipant } from "@/lib/participants";
import type { CognitiveDomain, TestResult } from "@/types/database";
import { PageHeader } from "@/components/layout/page-header";
import { NeuronField } from "@/components/brand/neuron-field";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DomainRadarChart, type RadarDatum } from "@/components/dashboard/domain-radar-chart";
import { ProgressLineChart, type ProgressDatum } from "@/components/dashboard/progress-line-chart";
import { ScoreCard } from "@/components/dashboard/score-card";
import { AiReportPanel } from "@/components/dashboard/ai-report-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("eyebrow"), description: t("description") };
}

export const dynamic = "force-dynamic";

function buildDashboardData(results: TestResult[], domainLabels: Record<CognitiveDomain, string>) {
  const latestByDomain = new Map<CognitiveDomain, number>();
  for (const result of [...results].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  )) {
    for (const [domain, score] of Object.entries(result.domain_scores)) {
      if (typeof score === "number") {
        latestByDomain.set(domain as CognitiveDomain, score);
      }
    }
  }

  const radarData: RadarDatum[] = Array.from(latestByDomain.entries()).map(([domain, score]) => ({
    domain: domainLabels[domain],
    score,
  }));

  const sortedResults = [...results].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  const domainKeysSet = new Set<string>();
  const progressData: ProgressDatum[] = sortedResults.map((result) => {
    const point: ProgressDatum = {
      date: new Date(result.completed_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
    for (const [domain, score] of Object.entries(result.domain_scores)) {
      if (typeof score === "number") {
        const label = domainLabels[domain as CognitiveDomain];
        point[label] = score;
        domainKeysSet.add(label);
      }
    }
    return point;
  });

  const entries = Array.from(latestByDomain.entries());
  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a), entries[0]);

  return {
    radarData,
    progressData,
    domainKeys: Array.from(domainKeysSet),
    latestByDomain,
    strongest: strongest?.[0],
    weakest: weakest?.[0],
  };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const anonSessionId = await getAnonSessionId();

  let results: TestResult[] | null = null;
  if (anonSessionId) {
    try {
      const supabaseAuth = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabaseAuth.auth.getUser();
      const participant = await ensureParticipant(anonSessionId, user?.id ?? null);

      const supabase = getServiceRoleClient();
      const { data } = await supabase
        .from("test_results")
        .select("*")
        .eq("participant_id", participant.id)
        .order("completed_at", { ascending: true });
      results = data;
    } catch {
      // Supabase isn't configured (or is unreachable) — fall through to the
      // empty state instead of crashing the whole page.
      results = null;
    }
  }

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        {!results || results.length === 0 ? (
          <div className="glass relative overflow-hidden rounded-xl p-10 text-center">
            <div className="pointer-events-none absolute inset-0">
              <NeuronField className="opacity-50" />
            </div>
            <div className="relative">
              <h2 className="text-xl font-medium">{t("emptyTitle")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t("emptyDescription")}
              </p>
              <Link href="/tests" className="mt-6 inline-block">
                <Button>
                  {t("takeTest")}
                  <ArrowRight />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <DashboardContent results={results} />
        )}
      </section>
    </>
  );
}

async function DashboardContent({ results }: { results: TestResult[] }) {
  const t = await getTranslations("dashboard");
  const tDomains = await getTranslations("domains");
  const domainLabels = Object.fromEntries(
    (
      [
        "reaction_time",
        "working_memory",
        "attention",
        "executive_function",
        "visual_memory",
        "processing_speed",
        "impulse_control",
      ] as CognitiveDomain[]
    ).map((domain) => [domain, tDomains(domain)])
  ) as Record<CognitiveDomain, string>;

  const { radarData, progressData, domainKeys, latestByDomain, strongest, weakest } =
    buildDashboardData(results, domainLabels);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from(latestByDomain.entries()).map(([domain, score]) => (
          <ScoreCard
            key={domain}
            label={domainLabels[domain]}
            score={score}
            isStrength={domain === strongest}
            isWeakness={domain === weakest && weakest !== strongest}
            strengthLabel={t("strength")}
            weaknessLabel={t("growthArea")}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-xl p-6">
          <h2 className="font-medium">{t("domainOverview")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("domainOverviewDescription")}</p>
          <div className="mt-4">
            <DomainRadarChart data={radarData} />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="font-medium">{t("progressOverTime")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("progressOverTimeDescription")}</p>
          <div className="mt-4">
            <ProgressLineChart data={progressData} domainKeys={domainKeys} />
          </div>
        </div>
      </div>

      <AiReportPanel />
    </div>
  );
}
