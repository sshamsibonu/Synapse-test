"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import type { TestEngineProps } from "@/types/tests";
import { scoreNBack } from "@/lib/tests/scoring";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const N = 2;
const STIMULUS_MS = 2200;

function buildSequence(length: number): string[] {
  const seq: string[] = [];
  for (let i = 0; i < length; i++) {
    if (i >= N && Math.random() < 0.35) {
      seq.push(seq[i - N]);
    } else {
      let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      while (i >= N && letter === seq[i - N]) {
        letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
      seq.push(letter);
    }
  }
  return seq;
}

export function NBackEngine({ mode, onComplete }: TestEngineProps) {
  const t = useTranslations("testEngines.nBack");
  const length = mode === "practice" ? 8 : 16;
  const sequence = React.useMemo(() => buildSequence(length), [length]);
  const [index, setIndex] = React.useState(0);
  const [responded, setResponded] = React.useState(false);
  const respondedRef = React.useRef(false);
  const trialsRef = React.useRef<{ isTarget: boolean; responded: boolean }[]>([]);

  React.useEffect(() => {
    respondedRef.current = false;
    setResponded(false);

    const timer = setTimeout(() => {
      const isTarget = index >= N && sequence[index] === sequence[index - N];
      trialsRef.current.push({ isTarget, responded: respondedRef.current });

      if (index + 1 >= sequence.length) {
        onComplete({
          rawMetrics: { sequence, trials: trialsRef.current, mode, n: N },
          domainScores: scoreNBack(trialsRef.current),
        });
      } else {
        setIndex((i) => i + 1);
      }
    }, STIMULUS_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function handleMatchPress() {
    if (respondedRef.current) return;
    respondedRef.current = true;
    setResponded(true);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {t("instructions", { current: index + 1, total: sequence.length, n: N })}
      </p>
      <Card>
        <CardContent className="flex h-48 items-center justify-center p-0">
          <span className="text-6xl font-bold tracking-tight">{sequence[index]}</span>
        </CardContent>
      </Card>
      <Button
        size="lg"
        className="h-12 w-full text-base"
        variant={responded ? "secondary" : "default"}
        onClick={handleMatchPress}
        disabled={responded}
      >
        {responded ? t("recorded") : t("match")}
      </Button>
    </div>
  );
}
