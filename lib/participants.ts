import "server-only";

import { getServiceRoleClient } from "@/lib/supabase/server";
import type { Participant } from "@/types/database";

export async function ensureParticipant(
  anonSessionId: string,
  authUserId: string | null
): Promise<Participant> {
  const supabase = getServiceRoleClient();

  const { data: existing } = await supabase
    .from("participants")
    .select("*")
    .eq("anon_session_id", anonSessionId)
    .maybeSingle();

  if (existing) {
    if (authUserId && !existing.auth_user_id) {
      const { data: updated } = await supabase
        .from("participants")
        .update({ auth_user_id: authUserId })
        .eq("id", existing.id)
        .select("*")
        .single();
      return updated ?? existing;
    }
    return existing;
  }

  const { data: created, error } = await supabase
    .from("participants")
    .insert({ anon_session_id: anonSessionId, auth_user_id: authUserId })
    .select("*")
    .single();

  if (error) throw error;
  return created;
}
