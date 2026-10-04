"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Delete } from "lucide-react";

import type { TestEngineProps } from "@/types/tests";
import { scoreDigitSpan } from "@/lib/tests/scoring";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const START_LENGTH = 3;
const MAX_LENGTH = 9;
const DIGIT_DISPLAY_MS = 900;

function randomDigits(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 10));
}

export function DigitSpanEngine({ mode, onComplete }: TestEngineProps) {
  const t = useTranslations("testEngines.digitSpan");
  const [length, setLength] = React.useState(START_LENGTH);
  const [digits, setDigits] = React.useState<number[]>(() => randomDigits(START_LENGTH));
  const [phase, setPhase] = React.useState<"show" | "input">("show");
  const [shownCount, setShownCount] = React.useState(0);
  const [entered, setEntered] = React.useState<number[]>([]);

  React.useEffect(() => {
    setPhase("show");
    setShownCount(0);
    setEntered([]);
    const seq = randomDigits(length);
    setDigits(seq);

    let cancelled = false;
    let i = 0;
    function revealNext() {
      if (cancelled) return;
      i += 1;
      setShownCount(i);
      if (i < seq.length) {
        setTimeout(revealNext, DIGIT_DISPLAY_MS);
      } else {
        setTimeout(() => {
          if (!cancelled) setPhase("input");
        }, DIGIT_DISPLAY_MS);
      }
    }
    const initialTimer = setTimeout(revealNext, DIGIT_DISPLAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
    };
  }, [length]);

  function finish(maxCorrectSpan: number) {
    onComplete({
      rawMetrics: { finalLength: length, maxCorrectSpan, mode },
      domainScores: scoreDigitSpan(maxCorrectSpan),
    });
  }

  function handleSubmit() {
    const correct =
      entered.length === digits.length && entered.every((d, i) => d === digits[i]);

    if (mode === "practice") {
      finish(correct ? length : Math.max(2, length - 1));
      return;
    }

    if (correct) {
      if (length + 1 > MAX_LENGTH) {
        finish(length);
      } else {
        setLength((l) => l + 1);
      }
    } else {
      finish(Math.max(2, length - 1));
    }
  }

  const digitButtons = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {phase === "show"
          ? t("memorize", { count: length })
          : t("enter")}
      </p>
      <Card>
        <CardContent className="flex h-40 items-center justify-center gap-3 p-0">
          {phase === "show" ? (
            <span className="text-6xl font-bold tabular-nums tracking-widest">
              {shownCount > 0 && shownCount <= digits.length
                ? digits[shownCount - 1]
                : ""}
            </span>
          ) : (
            <div className="flex gap-2">
              {Array.from({ length: digits.length }).map((_, i) => (
                <span
                  key={i}
                  className="flex size-10 items-center justify-center rounded-lg border border-border text-lg font-medium tabular-nums"
                >
                  {entered[i] ?? ""}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {phase === "input" && (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {digitButtons.map((d) => (
              <Button
                key={d}
                variant="outline"
                className="h-11"
                disabled={entered.length >= digits.length}
                onClick={() => setEntered((prev) => [...prev, d])}
              >
                {d}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              disabled={entered.length === 0}
              onClick={() => setEntered((prev) => prev.slice(0, -1))}
            >
              <Delete />
              {t("backspace")}
            </Button>
            <Button
              className="flex-1"
              disabled={entered.length !== digits.length}
              onClick={handleSubmit}
            >
              {t("submit")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
