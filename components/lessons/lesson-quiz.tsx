"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

import type { LessonQuizAnswerKey } from "@/lib/lessons/definitions";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Phase = "intro" | "question" | "results";

const fadeVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function LessonQuiz({
  lessonId,
  answerKey,
}: {
  lessonId: string;
  answerKey: LessonQuizAnswerKey[];
}) {
  const t = useTranslations("lessons.ui");
  const tQuiz = useTranslations(`lessons.items.${lessonId}.quiz`);

  const [phase, setPhase] = React.useState<Phase>("intro");
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<number[]>([]);

  const total = answerKey.length;
  const score = answers.filter((a, i) => a === answerKey[i].correctIndex).length;

  function selectOption(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
  }

  function goNext() {
    const nextAnswers = [...answers, selected as number];
    setAnswers(nextAnswers);
    setSelected(null);
    if (index + 1 >= total) {
      setPhase("results");
    } else {
      setIndex((i) => i + 1);
    }
  }

  function retake() {
    setPhase("intro");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
  }

  const options = Array.from({ length: answerKey[index]?.optionCount ?? 0 }, (_, i) => i);
  const isCorrect = selected !== null && selected === answerKey[index]?.correctIndex;

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="intro" {...fadeVariants} transition={{ duration: 0.25 }}>
              <h3 className="text-lg font-medium">{t("quizTitle")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("quizIntro")}</p>
              <Button className="mt-4" onClick={() => setPhase("question")}>
                {t("startQuiz")}
              </Button>
            </motion.div>
          )}

          {phase === "question" && (
            <motion.div key={`q-${index}`} {...fadeVariants} transition={{ duration: 0.25 }}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("question", { current: index + 1, total })}
              </p>
              <h3 className="mt-2 text-base font-medium">{tQuiz(`${index}.question`)}</h3>

              <div className="mt-4 space-y-2">
                {options.map((optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isThisCorrect = optionIndex === answerKey[index].correctIndex;
                  const showState = selected !== null;

                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      onClick={() => selectOption(optionIndex)}
                      disabled={selected !== null}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                        !showState && "border-border hover:border-primary/40 hover:bg-muted/40",
                        showState && isThisCorrect && "border-emerald-400/40 bg-emerald-400/10",
                        showState &&
                          isSelected &&
                          !isThisCorrect &&
                          "border-destructive/40 bg-destructive/10",
                        showState &&
                          !isSelected &&
                          !isThisCorrect &&
                          "border-border opacity-50"
                      )}
                    >
                      <span>{tQuiz(`${index}.options.${optionIndex}`)}</span>
                      {showState && isThisCorrect && (
                        <Check className="size-4 shrink-0 text-emerald-400" />
                      )}
                      {showState && isSelected && !isThisCorrect && (
                        <X className="size-4 shrink-0 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <Badge variant={isCorrect ? "secondary" : "outline"} className="mb-2">
                      {isCorrect ? t("correct") : t("incorrect")}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {tQuiz(`${index}.explanation`)}
                    </p>
                  </div>
                  <Button className="mt-3" onClick={goNext}>
                    {index + 1 >= total ? t("seeResults") : t("nextQuestion")}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "results" && (
            <motion.div key="results" {...fadeVariants} transition={{ duration: 0.25 }}>
              <h3 className="text-lg font-medium">{t("scoreTitle", { score, total })}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {score === total ? t("scorePerfect") : score >= Math.ceil(total / 2) ? t("scoreGood") : t("scoreLow")}
              </p>
              <Button variant="outline" className="mt-4" onClick={retake}>
                {t("retakeQuiz")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
