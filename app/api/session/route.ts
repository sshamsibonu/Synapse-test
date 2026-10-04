import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getOrCreateAnonSessionId } from "@/lib/session";
import { getServiceRoleClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureParticipant } from "@/lib/participants";

export async function GET() {
  const anonSessionId = await getOrCreateAnonSessionId();
  const supabaseAuth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const participant = await ensureParticipant(anonSessionId, user?.id ?? null);
  return NextResponse.json({ participant });
}

const ProfileUpdateSchema = z.object({
  age_range: z.string().max(20).optional(),
  gender: z.string().max(50).optional(),
  country: z.string().max(80).optional(),
  education: z.string().max(80).optional(),
  languages: z.array(z.string().max(40)).max(10).optional(),
});

const IntakeSchema = z.object({
  sleep_hours: z.number().min(0).max(24).optional(),
  exercise_frequency: z.string().max(40).optional(),
  screen_time_hours: z.number().min(0).max(24).optional(),
  stress_level: z.number().int().min(1).max(5).optional(),
  mood: z.string().max(40).optional(),
  caffeine_today: z.boolean().optional(),
});

const SessionUpdateSchema = z.object({
  profile: ProfileUpdateSchema.optional(),
  intake: IntakeSchema.optional(),
});

export async function POST(request: NextRequest) {
  const anonSessionId = await getOrCreateAnonSessionId();
  const supabaseAuth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const parsed = SessionUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const participant = await ensureParticipant(anonSessionId, user?.id ?? null);
  const supabase = getServiceRoleClient();

  if (parsed.data.profile) {
    await supabase.from("participants").update(parsed.data.profile).eq("id", participant.id);
  }

  if (parsed.data.intake) {
    await supabase
      .from("session_intake")
      .insert({ participant_id: participant.id, ...parsed.data.intake });
  }

  return NextResponse.json({ ok: true });
}
