import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const collectItems = t.raw("collectItems") as { bold: string; text: string }[];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} />

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground">{t("intro")}</p>

          <div>
            <h2 className="text-base font-medium text-foreground">{t("collectHeading")}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {collectItems.map((item) => (
                <li key={item.bold}>
                  <strong className="text-foreground">{item.bold}</strong>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground">{t("dontCollectHeading")}</h2>
            <p className="mt-3">{t("dontCollectParagraph")}</p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground">{t("aiHeading")}</h2>
            <p className="mt-3">{t("aiParagraph")}</p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground">{t("anonymizedHeading")}</h2>
            <p className="mt-3">{t("anonymizedParagraph")}</p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground">{t("choicesHeading")}</h2>
            <p className="mt-3">{t("choicesParagraph")}</p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground">{t("sharingHeading")}</h2>
            <p className="mt-3">{t("sharingParagraph")}</p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground">{t("notMedicalHeading")}</h2>
            <p className="mt-3">{t("notMedicalParagraph")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
