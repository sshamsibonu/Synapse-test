import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  role: string;
};

/**
 * Returns the signed-in admin user + profile, or null if missing / not admin.
 * UI convenience only — RLS still enforces writes on the server.
 */
export async function getAdminSession(): Promise<{
  userId: string;
  email: string | null;
  profile: AdminProfile;
} | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile || profile.role !== "admin") {
      return null;
    }

    return {
      userId: user.id,
      email: user.email ?? null,
      profile: profile as AdminProfile,
    };
  } catch {
    // Missing env vars or unreachable Supabase — treat as logged out.
    return null;
  }
}
