import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listMyAttempts } from "@/lib/content/results";
import { PageHeader } from "@/components/layout/page-header";
import { ResultsSignInPrompt } from "@/components/auth/results-sign-in-prompt";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "results" });
  return { title: t("title"), description: t("description") };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("results");
  const format = await getFormatter();

  let signedIn = false;
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  } catch {
    signedIn = false;
  }

  if (!signedIn) {
    return (
      <>
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <ResultsSignInPrompt message={t("signInPrompt")} />
        </section>
      </>
    );
  }

  const { rows, error } = await listMyAttempts(locale);

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("loadError")}
          </p>
        ) : null}

        {!error && rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
            <p className="font-medium">{t("emptyTitle")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("quiz")}</th>
                  <th className="px-3 py-2 font-medium">{t("score")}</th>
                  <th className="px-3 py-2 font-medium">{t("date")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const scoreLabel =
                    row.score == null
                      ? "—"
                      : row.maxScore == null
                        ? String(row.score)
                        : `${row.score} / ${row.maxScore}`;
                  return (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium">{row.title}</td>
                      <td className="px-3 py-2 tabular-nums">{scoreLabel}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {format.dateTime(new Date(row.completedAt), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </>
  );
}
