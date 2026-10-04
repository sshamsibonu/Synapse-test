"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Clock, Zap } from "lucide-react";

import type { TestDefinition } from "@/types/database";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DIFFICULTY_STYLES: Record<TestDefinition["difficulty"], string> = {
  Easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  Medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  Hard: "text-rose-400 border-rose-400/30 bg-rose-400/10",
};

export function TestCard({ test }: { test: TestDefinition }) {
  const tDomains = useTranslations("domains");
  const tItems = useTranslations(`tests.items.${test.id}`);
  const tDifficulty = useTranslations("tests.difficulty");
  const tCatalog = useTranslations("tests.catalog");

  return (
    <Link href={`/tests/${test.id}`} className="block h-full">
      <motion.div
        className="h-full"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Card className="glass h-full transition-colors hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
          <CardContent className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <Badge variant="outline" className="text-xs">
                {tDomains(test.domain)}
              </Badge>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[test.difficulty]}`}
              >
                {tDifficulty(test.difficulty.toLowerCase())}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-medium">{tItems("name")}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{tItems("description")}</p>

            <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {tCatalog("minutes", { count: Math.round(test.avg_duration_seconds / 60) || 1 })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="size-3.5" />
                {tCatalog("practiceIncluded")}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
