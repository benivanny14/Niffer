import type { NextRequest } from "next/server";

/**
 * Rate limiting ndani ya kumbuka (in-memory) — inatosha kwa deployment
 * moja (VPS/container). Kila endpoint ina kikomo chake cha majaribio
 * kwa IP ndani ya dirisha la muda.
 *
 * Kumbuka: kwa serverless (VPS zaidi ya moja) tumia rate limiter ya
 * nje (Upstash/Ratelimit) — interface hii ni rahisi kubadilisha.
 */

type Bucket = { count: number; resetAt: number };

const store = (globalThis as unknown as { __rateLimit?: Map<string, Bucket> })
  .__rateLimit ??
  ((globalThis as unknown as { __rateLimit?: Map<string, Bucket> }).__rateLimit =
    new Map());

export type RateLimitResult = {
  ok: boolean;
  /** Sekunde zilizobaki kabla ya kupumzika. */
  retryAfterSec: number;
};

/**
 * Thibitisha kikomo cha majaribio. Rudisha `{ ok: false }` kama
 * kikomo kimevukwa — mtumiaji anapaswa kusubiri `retryAfterSec`.
 */
export function rateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowSec: number,
): RateLimitResult {
  const ip = clientIp(req);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();

  let bucket = store.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowSec * 1000 };
    store.set(bucketKey, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** IP salama kutoka headers (proxy/trust). */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Ujumbe wa kikomo (Kiswahili). */
export function rateLimitMessage(retryAfterSec: number): string {
  const sec = Math.max(1, retryAfterSec);
  if (sec < 60) return `Subiri sekunde ${sec} kabla ya kujaribu tena.`;
  return `Subiri dakika ${Math.ceil(sec / 60)} kabla ya kujaribu tena.`;
}
