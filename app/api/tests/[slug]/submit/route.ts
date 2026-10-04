import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getOrCreateAnonSessionId, getAnonSessionId } from "@/lib/session";
import { createServerSupabaseClient, getServiceRoleClient } from "@/lib/supabase/server";
import { ensureParticipant } from "@/lib/participants";
import { getTestDefinition } from "@/lib/tests/definitions";
import { isRateLimited } from "@/lib/rate-limit";

const SubmitSchema = z.object({
  rawMetrics: z.record(z.string(), z.unknown()),
  domainScores: z.record(z.string(), z.number().min(0).max(100)),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const definition = getTestDefinition(slug);
  if (!definition) {
    return NextResponse.json({ error: "Unknown test" }, { status: 404 });
  }

  const rateLimitKey = `submit:${(await getAnonSessionId()) ?? request.headers.get("x-forwarded-for") ?? "anon"}`;
  if (isRateLimited(rateLimitKey, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many submissions, please slow down." }, { status: 429 });
  }

  const parsed = SubmitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid result payload" }, { status: 400 });
  }

  const anonSessionId = await getOrCreateAnonSessionId();
  const supabaseAuth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  const participant = await ensureParticipant(anonSessionId, user?.id ?? null);

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("test_results")
    .insert({
      participant_id: participant.id,
      test_id: definition.id,
      raw_metrics: parsed.data.rawMetrics,
      domain_scores: parsed.data.domainScores,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }

  return NextResponse.json({ testResultId: data.id });
}
