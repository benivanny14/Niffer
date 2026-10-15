import type { NextRequest } from "next/server";
import { getDb } from "@/lib/server/db";

export type RateLimitResult = {
  ok: boolean;
  retryAfterSec: number;
};

/**
 * Shared fixed-window limiter. Vercel can run many short-lived instances, so
 * counters live in Neon rather than process memory. Each hit is one atomic
 * PostgreSQL upsert and is shared by all app instances.
 */
export async function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const ip = clientIp(req);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const resetAt = now + windowSec * 1000;
  if (Math.random() < 0.01) {
    await getDb().prepare("DELETE FROM rate_limit_buckets WHERE reset_at <= ?").run(now);
  }
  const row = await getDb().prepare(
    `INSERT INTO rate_limit_buckets (bucket_key, hits, reset_at)
     VALUES (?, 1, ?)
     ON CONFLICT (bucket_key) DO UPDATE SET
       hits = CASE WHEN rate_limit_buckets.reset_at <= ? THEN 1 ELSE rate_limit_buckets.hits + 1 END,
       reset_at = CASE WHEN rate_limit_buckets.reset_at <= ? THEN EXCLUDED.reset_at ELSE rate_limit_buckets.reset_at END
     RETURNING hits, reset_at`,
  ).get(bucketKey, resetAt, now, now) as { hits: number; reset_at: string | number } | undefined;

  const bucketReset = Number(row?.reset_at ?? resetAt);
  return {
    ok: Number(row?.hits ?? 0) <= limit,
    retryAfterSec: Math.max(1, Math.ceil((bucketReset - now) / 1000)),
  };
}

/** Trust the reverse-proxy client IP supplied by Vercel or the hosting proxy. */
export function clientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",").map((part) => part.trim()).find(Boolean);
    if (first) return first;
  }
  return "unknown";
}

export function rateLimitMessage(retryAfterSec: number): string {
  const sec = Math.max(1, retryAfterSec);
  if (sec < 60) return `Wait ${sec} seconds before trying again.`;
  return `Wait ${Math.ceil(sec / 60)} minutes before trying again.`;
}
