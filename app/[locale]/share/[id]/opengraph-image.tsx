import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { getServiceRoleClient } from "@/lib/supabase/server";
import { getTestDefinition, DOMAIN_LABELS } from "@/lib/tests/definitions";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIMARY = "#8b93ff";
const ACCENT = "#5eead4";
const BG = "#08080f";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  let data: { test_id: string; domain_scores: Record<string, unknown> } | null = null;
  try {
    const supabase = getServiceRoleClient();
    const result = await supabase
      .from("test_results")
      .select("test_id, domain_scores")
      .eq("id", id)
      .maybeSingle();
    data = result.data;
  } catch {
    // Supabase isn't configured (or is unreachable) — fall through to a
    // generic branded image rather than breaking the link preview entirely.
  }

  const definition = data ? getTestDefinition(data.test_id) : null;
  const scores = data ? (Object.entries(data.domain_scores) as [string, number][]) : [];
  const [domain, score] = scores[0] ?? ["reaction_time", 0];

  const t = await getTranslations({ locale, namespace: "share" });
  const tItem = definition
    ? await getTranslations({ locale, namespace: `tests.items.${definition.id}` })
    : null;

  const testName = tItem ? tItem("name") : "Synapse";
  const domainLabel = DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS] ?? domain;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BG,
          backgroundImage: `radial-gradient(circle at 15% 15%, ${PRIMARY}33, transparent 45%), radial-gradient(circle at 85% 85%, ${ACCENT}22, transparent 45%)`,
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="44" height="44" viewBox="0 0 40 40">
            <g fill="none" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" opacity={0.9}>
              <path d="M20 21 Q14 15 10 9" />
              <path d="M20 21 Q26 16 31 11" />
              <path d="M20 21 Q13 26 8 30" />
              <path d="M20 21 Q26 27 30 31" />
            </g>
            <circle cx="20" cy="21" r="5.5" fill={PRIMARY} />
            <circle cx="10" cy="9" r="3" fill={ACCENT} />
            <circle cx="31" cy="11" r="3.4" fill={PRIMARY} />
            <circle cx="8" cy="30" r="2.8" fill={ACCENT} />
            <circle cx="30" cy="31" r="3.2" fill={PRIMARY} />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#fff" }}>Synapse</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 26, color: "#9ca3af", marginBottom: 8 }}>{testName}</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span
              style={{
                fontSize: 168,
                fontWeight: 800,
                backgroundImage: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})`,
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {score}
            </span>
            <span style={{ fontSize: 40, color: "#6b7280" }}>/100</span>
          </div>
          <span style={{ fontSize: 30, color: "#e5e7eb", marginTop: 4 }}>{domainLabel}</span>
        </div>

        <span style={{ fontSize: 24, color: "#6b7280" }}>{t("ogFooter")}</span>
      </div>
    ),
    { ...size }
  );
}
