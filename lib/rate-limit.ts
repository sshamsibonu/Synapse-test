import "server-only";

const buckets = new Map<string, number[]>();

/**
 * Simple in-memory sliding-window rate limiter. Good enough for a single
 * dev/small-deployment Next.js instance; swap for Upstash/Redis before
 * scaling to multiple server instances.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return false;
}
