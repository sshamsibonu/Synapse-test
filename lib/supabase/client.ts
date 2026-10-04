"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — publishable (anon) key only.
 * Never put a service_role or other secret key in this file.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill them in."
    );
  }

  return createBrowserClient(url, publishableKey);
}
