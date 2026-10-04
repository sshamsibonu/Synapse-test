import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cookie-bound Supabase client for Server Components and Route Handlers.
 * Uses the same publishable (anon) key as the browser — RLS enforces access.
 * No service_role key here.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY env vars."
    );
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render — safe to ignore since
          // middleware/route handlers are what actually persist the session.
        }
      },
    },
  });
}

/**
 * Legacy stub. The old research tables (participants, test_results, …) used a
 * service_role key. This project uses publishable key + RLS only, so this
 * always throws. Call sites already catch and degrade to empty UI.
 */
export function getServiceRoleClient(): never {
  throw new Error(
    "Service-role client is disabled. Use createClient() / createServerSupabaseClient() with RLS."
  );
}
