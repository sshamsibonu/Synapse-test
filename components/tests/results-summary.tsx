"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, RotateCcw } from "lucide-react";

import type { TestDefinition } from "@/types/database";
import type { TestEngineResult } from "@/types/tests";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareResultButton } from "@/components/tests/share-result-button";

export function ResultsSummary({
  definition,
  result,
  resultId,
  onRetry,
}: {
  definition: TestDefinition;
  result: TestEngineResult;
  resultId: string | null;
  onRetry: () => void;
}) {
  const t = useTranslations("resultsSummary");
  const tDomains = useTranslations("domains");
  const tItem = useTranslations(`tests.items.${definition.id}`);

  const scores = Object.entries(result.domainScores) as [
    Parameters<typeof tDomains>[0],
    number,
  ][];
  const primaryScore = scores[0]?.[1] ?? 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {t("eyebrow")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {t("complete", { name: tItem("name") })}
        </h2>
      </div>

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

      <Card className="glass">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium">{t("whatThisMeasures")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {tItem("scientificExplanation")}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{t("scoreNote")}</p>
        </CardContent>
      </Card>

      {resultId && (
        <ShareResultButton resultId={resultId} testName={tItem("name")} score={primaryScore} />
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={onRetry}>
          <RotateCcw />
          {t("tryAgain")}
        </Button>
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full">
            {t("viewDashboard")}
            <ArrowRight />
          </Button>
        </Link>
      </div>
    </div>
  );
}
