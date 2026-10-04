"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Report {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  study_recommendations: string[];
  health_recommendations: string[];
  disclaimer: string;
}

export function AiReportPanel() {
  const t = useTranslations("aiReport");
  const locale = useLocale();
  const [status, setStatus] = React.useState<"idle" | "loading" | "error" | "success">("idle");
  const [report, setReport] = React.useState<Report | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function generate() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? t("genericError"));
      }
      setReport(body.report.report_json);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
      setStatus("error");
    }
  }

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h3 className="text-lg font-medium">{t("title")}</h3>
        </div>

        {status === "idle" && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{t("idleDescription")}</p>
            <Button className="mt-4" onClick={generate}>
              {t("generate")}
            </Button>
          </div>
        )}

        {status === "loading" && (
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            {t("analyzing")}
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
            <Button variant="outline" onClick={generate}>
              {t("tryAgain")}
            </Button>
          </div>
        )}

        {status === "success" && report && (
          <div className="mt-4 space-y-5 text-sm">
            <p className="text-foreground">{report.summary}</p>

            <ReportSection title={t("strengths")} items={report.strengths} />
            <ReportSection title={t("weaknesses")} items={report.weaknesses} />
            <ReportSection title={t("studyRecommendations")} items={report.study_recommendations} />
            <ReportSection title={t("healthRecommendations")} items={report.health_recommendations} />

            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {report.disclaimer}
            </p>

            <Button variant="outline" size="sm" onClick={generate}>
              {t("regenerate")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
