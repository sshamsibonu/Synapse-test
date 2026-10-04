import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getTestDefinition, TEST_DEFINITIONS } from "@/lib/tests/definitions";
import { TestRunner } from "@/components/tests/test-runner";

export function generateStaticParams() {
  return TEST_DEFINITIONS.map((test) => ({ slug: test.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const definition = getTestDefinition(slug);
  if (!definition) return {};
  const t = await getTranslations({ locale, namespace: `tests.items.${slug}` });
  return {
    title: t("name"),
    description: t("description"),
  };
}

export default async function TestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const definition = getTestDefinition(slug);
  if (!definition) notFound();

  return <TestRunner definition={definition} />;
}
