import "server-only";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "synapse_session_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Returns the visitor's anonymous session id, creating and persisting one
 * via an httpOnly cookie on first visit. This id ties anonymous test
 * results to a single browser without collecting any identifying info.
 */
export async function getOrCreateAnonSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return sessionId;
}

export async function getAnonSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
