/** Turn network / Supabase failures into short admin-facing messages. */
export function friendlyAdminError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!error) return fallback;

  if (typeof error === "string") {
    return friendlyFromMessage(error, fallback);
  }

  if (typeof error === "object" && error !== null) {
    const maybe = error as { message?: string; code?: string; name?: string };
    if (maybe.name === "TypeError" || /fetch|network|failed to fetch/i.test(maybe.message ?? "")) {
      return "Network problem. Check your connection and try again.";
    }
    if (maybe.message) {
      return friendlyFromMessage(maybe.message, fallback);
    }
  }

  return fallback;
}

function friendlyFromMessage(message: string, fallback: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("load failed") ||
    lower.includes("timeout")
  ) {
    return "Network problem. Check your connection and try again.";
  }
  if (lower.includes("jwt") || lower.includes("session") || lower.includes("not authenticated")) {
    return "Your session expired. Sign in again.";
  }
  if (lower.includes("row-level security") || lower.includes("rls") || lower.includes("permission")) {
    return "You do not have permission to do that.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email in Supabase Auth, then try again.";
  }

  // Prefer known mappers' messages; otherwise avoid dumping long Postgres text.
  if (message.length > 180) {
    return fallback;
  }
  return message || fallback;
}
