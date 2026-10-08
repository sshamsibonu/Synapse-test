
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTranslations } from "next-intl/server";

import { getOrCreateAnonSessionId } from "@/lib/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureParticipant } from "@/lib/participants";
import { isRateLimited } from "@/lib/rate-limit";
import { getAnthropicClient, INSIGHTS_MODEL } from "@/lib/ai/anthropic";
import { getInsightsSystemPrompt } from "@/lib/ai/prompts";
import { routing } from "@/i18n/routing";

type TestResult = {
  id: string;
  test_id: string;
  domain_scores: Record<string, number>;
  completed_at: string;
};

const ReportSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  study_recommendations: z.array(z.string()),
  health_recommendations: z.array(z.string()),
  disclaimer: z.string(),
});

const REPORT_TOOL = {
  name: "submit_report",
  description: "Submit the structured insights report.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "2-3 sentence plain-language overview.",
      },
      strengths: {
        type: "array",
        items: { type: "string" },
        description: "1-3 bullet points.",
      },
      weaknesses: {
        type: "array",
        items: { type: "string" },
        description: "1-3 bullet points, hedged and non-judgmental.",
      },
      study_recommendations: {
        type: "array",
        items: { type: "string" },
        description:
          "2-4 evidence-based learning/attention techniques.",
      },
      health_recommendations: {
        type: "array",
        items: { type: "string" },
        description:
          "2-4 evidence-based lifestyle suggestions (sleep, exercise, stress, nutrition).",
      },
      disclaimer: {
        type: "string",
        description:
          "Educational-only, not medical advice or diagnosis.",
      },
    },
    required: [
      "summary",
      "strengths",
      "weaknesses",
      "study_recommendations",
      "health_recommendations",
      "disclaimer",
    ],
  },
};

const BodySchema = z.object({
  locale: z
    .enum(routing.locales as unknown as [string, ...string[]])
    .default(routing.defaultLocale),
});

export async function POST(request: NextRequest) {
  const anonSessionId = await getOrCreateAnonSessionId();

  if (
    isRateLimited(
      `insights:${anonSessionId}`,
      5,
      60 * 60 * 1000
    )
  ) {
    return NextResponse.json(
      {
        error:
          "You've reached the insights limit for now — try again later.",
      },
      { status: 429 }
    );
  }

  const bodyResult = BodySchema.safeParse(
    await request.json().catch(() => ({}))
  );

  const locale = bodyResult.success
    ? bodyResult.data.locale
    : routing.defaultLocale;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const participant = await ensureParticipant(
    anonSessionId,
    user?.id ?? null
  );

  const { data: results, error: resultsError } = await supabase
    .from("test_results")
    .select("*")
    .eq("participant_id", participant.id)
    .order("completed_at", { ascending: false })
    .limit(10);

  if (resultsError) {
    return NextResponse.json(
      { error: "Failed to load test results." },
      { status: 500 }
    );
  }

  if (!results || results.length === 0) {
    return NextResponse.json(
      {
        error:
          "Complete at least one test before generating insights.",
      },
      { status: 400 }
    );
  }

  const { data: intake } = await supabase
    .from("session_intake")
    .select("*")
    .eq("participant_id", participant.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const tDomains = await getTranslations({
    locale,
    namespace: "domains",
  });

  const tTests = await getTranslations({
    locale,
    namespace: "tests.items",
  });

  const typedResults = results as TestResult[];

  const resultsSummary = typedResults
    .map((r: TestResult) => {
      const name = (() => {
        try {
          return tTests(`${r.test_id}.name`);
        } catch {
          return r.test_id;
        }
      })();

      const scores = Object.entries(r.domain_scores)
        .map(([domain, score]) => {
          const label = (() => {
            try {
              return tDomains(domain as never);
            } catch {
              return domain;
            }
          })();

          return `${label}: ${score}/100`;
        })
        .join(", ");

      return `- ${name} (${new Date(
        r.completed_at
      ).toLocaleDateString()}): ${scores}`;
    })
    .join("\n");

  const intakeSummary = intake
    ? `Self-reported context from the most recent session: sleep ${
        intake.sleep_hours ?? "n/a"
      }h, exercise frequency: ${
        intake.exercise_frequency ?? "n/a"
      }, screen time ${
        intake.screen_time_hours ?? "n/a"
      }h, stress level ${
        intake.stress_level ?? "n/a"
      }/5, mood: ${
        intake.mood ?? "n/a"
      }, caffeine today: ${
        intake.caffeine_today ?? "n/a"
      }.`
    : "No self-reported lifestyle context was provided for this session.";

  const userMessage = `Here are this person's recent cognitive test results:
${resultsSummary}

${intakeSummary}

Write the insights report now by calling submit_report.`;

  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: INSIGHTS_MODEL,
    max_tokens: 1200,
    system: getInsightsSystemPrompt(locale),
    tools: [REPORT_TOOL],
    tool_choice: {
      type: "tool",
      name: "submit_report",
    },
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const toolUse = response.content.find(
    (block) => block.type === "tool_use"
  );

  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json(
      { error: "AI did not return a report" },
      { status: 502 }
    );
  }

  const parsed = ReportSchema.safeParse(toolUse.input);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "AI returned an invalid report" },
      { status: 502 }
    );
  }

  const { data: saved, error } = await supabase
    .from("ai_reports")
    .insert({
      participant_id: participant.id,
      test_result_ids: typedResults.map(
        (r: TestResult) => r.id
      ),
      report_json: parsed.data,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    );
  }

  return NextResponse.json({ report: saved });
}
