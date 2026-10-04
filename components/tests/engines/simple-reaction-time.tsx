"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import type { TestEngineProps } from "@/types/tests";
import { scoreSimpleReactionTime } from "@/lib/tests/scoring";
import { Card, CardContent } from "@/components/ui/card";

type StimState = "waiting" | "stimulus" | "too-soon";

export function SimpleReactionTimeEngine({ mode, onComplete }: TestEngineProps) {
  const t = useTranslations("testEngines.simpleReactionTime");
  const totalTrials = mode === "practice" ? 3 : 6;
  const [trial, setTrial] = React.useState(0);
  const [state, setState] = React.useState<StimState>("waiting");
  const [results, setResults] = React.useState<number[]>([]);
  const stimulusAt = React.useRef<number | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTrial = React.useCallback(() => {
    setState("waiting");
    stimulusAt.current = null;
    const delay = 1000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      stimulusAt.current = performance.now();
      setState("stimulus");
    }, delay);
  }, []);

  React.useEffect(() => {
    startTrial();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  function handleClick() {
    if (state === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState("too-soon");
      setTimeout(() => startTrial(), 1000);
      return;
    }
    if (state === "stimulus" && stimulusAt.current !== null) {
      const ms = performance.now() - stimulusAt.current;
      const next = [...results, ms];
      setResults(next);
      if (trial + 1 >= totalTrials) {
        onComplete({
          rawMetrics: { trialMs: next, mode },
          domainScores: scoreSimpleReactionTime(next),
        });
      } else {
        setTrial((t) => t + 1);
      }
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {t("trial", { current: trial + 1, total: totalTrials })}
      </p>
      <Card>
        <CardContent className="p-0">
          <button
            type="button"
            onClick={handleClick}
            className="flex h-72 w-full select-none items-center justify-center rounded-xl transition-colors"
            style={{
              backgroundColor:
                state === "stimulus"
                  ? "var(--primary)"
                  : state === "too-soon"
                    ? "color-mix(in oklch, var(--destructive), transparent 80%)"
                    : "var(--muted)",
            }}
          >
            <span className="text-lg font-medium text-foreground">
              {state === "waiting" && t("waiting")}
              {state === "stimulus" && t("stimulus")}
              {state === "too-soon" && t("tooSoon")}
            </span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
