"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import type { TestEngineProps } from "@/types/tests";
import { scoreStroop } from "@/lib/tests/scoring";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COLORS = [
  { id: "red", value: "oklch(0.63 0.24 25)" },
  { id: "blue", value: "oklch(0.6 0.19 260)" },
  { id: "green", value: "oklch(0.65 0.18 145)" },
  { id: "yellow", value: "oklch(0.8 0.16 95)" },
] as const;

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function nextTrial(): { wordId: string; ink: (typeof COLORS)[number] } {
  const wordId = randomColor().id;
  // Bias toward incongruent trials (~75%) to produce a real Stroop interference effect.
  const incongruent = Math.random() < 0.75;
  let ink = randomColor();
  if (incongruent) {
    while (ink.id === wordId) ink = randomColor();
  } else {
    ink = COLORS.find((c) => c.id === wordId)!;
  }
  return { wordId, ink };
}

export function StroopEngine({ mode, onComplete }: TestEngineProps) {
  const t = useTranslations("testEngines.stroop");
  const totalTrials = mode === "practice" ? 4 : 10;
  const [trialIndex, setTrialIndex] = React.useState(0);
  const [current, setCurrent] = React.useState(() => nextTrial());
  const [results, setResults] = React.useState<{ correct: boolean; ms: number }[]>([]);
  const shownAt = React.useRef(performance.now());

  React.useEffect(() => {
    shownAt.current = performance.now();
  }, [trialIndex]);

  function handleAnswer(colorId: string) {
    const ms = performance.now() - shownAt.current;
    const correct = colorId === current.ink.id;
    const next = [...results, { correct, ms }];
    setResults(next);

    if (trialIndex + 1 >= totalTrials) {
      onComplete({
        rawMetrics: { trials: next, mode },
        domainScores: scoreStroop(next),
      });
    } else {
      setCurrent(nextTrial());
      setTrialIndex((t) => t + 1);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {t("trial", { current: trialIndex + 1, total: totalTrials })}{" "}
        <strong className="text-foreground">{t("inkColor")}</strong>
        {t("notWord")}
      </p>
      <Card>
        <CardContent className="flex h-48 items-center justify-center p-0">
          <span
            className="text-5xl font-bold tracking-tight"
            style={{ color: current.ink.value }}
          >
            {t(`colors.${current.wordId}`)}
          </span>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {COLORS.map((color) => (
          <Button
            key={color.id}
            variant="outline"
            size="lg"
            className="h-12"
            onClick={() => handleAnswer(color.id)}
          >
            <span
              className="mr-2 size-3 rounded-full"
              style={{ backgroundColor: color.value }}
            />
            {t(`colors.${color.id}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
