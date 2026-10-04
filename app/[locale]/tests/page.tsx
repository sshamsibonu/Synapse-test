import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { TestCard } from "@/components/tests/test-card";
import { TEST_DEFINITIONS } from "@/lib/tests/definitions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tests.catalog" });
  return { title: t("eyebrow"), description: t("description") };
}

export default async function TestsCatalogPage() {
  const t = await getTranslations("tests.catalog");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEST_DEFINITIONS.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      </section>
    </>
  );
}
