"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Clock, Sparkles } from "lucide-react";

import type { TestDefinition } from "@/types/database";
import type { TestEngineComponent, TestEngineResult } from "@/types/tests";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResultsSummary } from "@/components/tests/results-summary";

type Phase = "instructions" | "practice" | "ready" | "countdown" | "running" | "loading" | "results";

interface TestShellProps {
  definition: TestDefinition;
  Engine: TestEngineComponent;
  onFinish: (result: TestEngineResult) => Promise<string | null>;
}

const fadeVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function TestShell({ definition, Engine, onFinish }: TestShellProps) {
  const t = useTranslations("testShell");
  const tDifficulty = useTranslations("tests.difficulty");
  const tItem = useTranslations(`tests.items.${definition.id}`);

  const [phase, setPhase] = React.useState<Phase>("instructions");
  const [countdown, setCountdown] = React.useState(3);
  const [finalResult, setFinalResult] = React.useState<TestEngineResult | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [resultId, setResultId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      setPhase("running");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  React.useEffect(() => {
    if (phase !== "loading" || !finalResult) return;
    let cancelled = false;
    (async () => {
      try {
        const id = await onFinish(finalResult);
        if (!cancelled) setResultId(id);
      } catch {
        if (!cancelled) setSubmitError(t("saveError"));
      } finally {
        if (!cancelled) setPhase("results");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, finalResult, onFinish, t]);

  function handleRetry() {
    setFinalResult(null);
    setSubmitError(null);
    setResultId(null);
    setCountdown(3);
    setPhase("instructions");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <AnimatePresence mode="wait">
        {phase === "instructions" && (
          <motion.div key="instructions" {...fadeVariants} transition={{ duration: 0.3 }}>
            <div className="text-center">
              <Badge variant="outline">{tDifficulty(definition.difficulty.toLowerCase())}</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">{tItem("name")}</h1>
              <p className="mt-3 text-muted-foreground">{tItem("description")}</p>
            </div>

            <Card className="glass mt-8">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {t("duration", { count: Math.round(definition.avg_duration_seconds / 60) || 1 })}
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Sparkles className="mt-0.5 size-4 shrink-0" />
                  <span>{t("practiceNote")}</span>
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="mt-8 h-11 w-full text-base" onClick={() => setPhase("practice")}>
              {t("startPractice")}
            </Button>
          </motion.div>
        )}

        {phase === "practice" && (
          <motion.div key="practice" {...fadeVariants} transition={{ duration: 0.3 }}>
            <div className="mb-4 text-center">
              <Badge variant="secondary">{t("practiceRound")}</Badge>
            </div>
            <Engine mode="practice" onComplete={() => setPhase("ready")} />
          </motion.div>
        )}

        {phase === "ready" && (
          <motion.div key="ready" {...fadeVariants} transition={{ duration: 0.3 }} className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">{t("readyTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("readyDescription")}</p>
            <Button size="lg" className="mt-8 h-11 px-8 text-base" onClick={() => { setCountdown(3); setPhase("countdown"); }}>
              {t("startReal")}
            </Button>
          </motion.div>
        )}

        {phase === "countdown" && (
          <motion.div key="countdown" {...fadeVariants} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center py-24">
            <motion.span
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="gradient-text text-7xl font-semibold tabular-nums"
            >
              {countdown === 0 ? t("go") : countdown}
            </motion.span>
          </motion.div>
        )}

        {phase === "running" && (
          <motion.div key="running" {...fadeVariants} transition={{ duration: 0.2 }}>
            <Engine
              mode="real"
              onComplete={(result) => {
                setFinalResult(result);
                setPhase("loading");
              }}
            />
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div key="loading" {...fadeVariants} className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">{t("analyzing")}</p>
          </motion.div>
        )}

        {phase === "results" && finalResult && (
          <motion.div key="results" {...fadeVariants} transition={{ duration: 0.3 }}>
            {submitError && (
              <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
                {submitError}
              </p>
            )}
            <ResultsSummary
              definition={definition}
              result={finalResult}
              resultId={resultId}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
