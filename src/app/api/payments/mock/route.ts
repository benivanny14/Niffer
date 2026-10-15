import { connection, NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mockPaymentsAllowed, setPaymentStatus } from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";
import { fail } from "@/lib/server/http";

/**
 * Mock ya malipo (AZAMPAY_MOCK=1) — inaiga gateway: inathibitisha oda,
 * inaweka `paid` kisha inapelekea ukurasa wa mafanikio. Hutumika local
 * kuhakiki mzunguko mzima bila API keys.
 *
 * KATIKA PRODUCTION: route hii haifanyi kitu (mockPaymentsAllowed() = false).
 */
export async function GET(req: NextRequest) {
  await connection();
  const limited = await rateLimit(req, "payment-mock", 10, 60);
  if (!limited.ok) {
    return fail(rateLimitMessage(limited.retryAfterSec), 429);
  }

  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim().toUpperCase();
  const back = reference
    ? `/malipo/amefanikiwa?reference=${encodeURIComponent(reference)}`
    : "/";

  if (!mockPaymentsAllowed()) {
    // Mock haijawashwa au ni production — rudisha kwenye oda.
    return NextResponse.redirect(new URL(back, url.origin), 302);
  }
  if (!reference || !(await getOrder(reference))) {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }

  await setPaymentStatus(reference, "paid", "mock");
  return NextResponse.redirect(new URL(back, url.origin), 302);
}
