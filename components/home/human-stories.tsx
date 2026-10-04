"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SynapticThread } from "@/components/brand/synaptic-thread";

type Story = {
  question: string;
  domain: string;
  answer: string;
  article: string;
};

export function HumanStories() {
  const t = useTranslations("home.stories");
  const items = t.raw("items") as Story[];
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="stories" className="relative border-b border-border">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:py-32">
        <Reveal className="max-w-2xl">
          <p className="annotation">{t("eyebrow")}</p>
          <h2 className="display gradient-text mt-4 text-4xl sm:text-5xl">{t("heading")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("intro")}</p>
        </Reveal>

        <div className="mt-14">
          {items.map((story, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div className="border-t border-border">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-start gap-5 py-8 text-left"
                  >
                    <span className="annotation mt-3 shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="flex-1">
                      {/* The question, set as a pull-quote — the human voice */}
                      <span
                        className={cn(
                          "display block text-2xl leading-snug transition-colors sm:text-[1.75rem]",
                          isOpen ? "text-foreground" : "text-foreground/85 group-hover:text-foreground"
                        )}
                      >
                        &ldquo;{story.question}&rdquo;
                      </span>
                      <span className="annotation mt-3 block">{story.domain}</span>
                    </span>

                    <span
                      className={cn(
                        "mt-2 shrink-0 rounded-full border border-border p-1.5 transition-transform",
                        isOpen && "rotate-45"
                      )}
                    >
                      <Plus className="size-4 text-muted-foreground" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.33, 0.9, 0.35, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-6 pb-10 pl-12 sm:grid-cols-12">
                          <div className="hidden sm:col-span-2 sm:block">
                            <SynapticThread
                              variant="branch"
                              className="h-14 w-full text-primary/35"
                              showNodes={false}
                            />
                          </div>
                          <div className="sm:col-span-9">
                            <p className="max-w-2xl leading-relaxed text-muted-foreground">
                              {story.answer}
                            </p>
                            <Link
                              href={`/articles/${story.article}`}
                              className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
                            >
                              {t("prompt")} &rarr;
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
}
