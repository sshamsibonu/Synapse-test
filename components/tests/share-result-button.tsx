"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Share2 } from "lucide-react";

import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function ShareResultButton({
  resultId,
  testName,
  score,
}: {
  resultId: string;
  testName: string;
  score: number;
}) {
  const t = useTranslations("share");
  const locale = useLocale();
  const [copied, setCopied] = React.useState(false);

  function buildShareUrl() {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    return `${window.location.origin}${prefix}/share/${resultId}`;
  }

  async function handleShare() {
    const url = buildShareUrl();
    const text = t("shareText", { score, testName });

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: t("pageTitle", { testName }), text, url });
      } catch {
        // user cancelled the native share sheet — no-op
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleShare}>
      {copied ? <Check /> : <Share2 />}
      {t("buttonLabel")}
    </Button>
  );
}
