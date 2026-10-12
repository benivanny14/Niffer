import { connection, NextResponse } from "next/server";
import { paymentConfig, setPaymentStatus } from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";

/**
 * Mock ya malipo (AZAMPAY_MOCK=1) — inaiga gateway: inathibitisha oda,
 * inaweka `paid` kisha inapelekea ukurasa wa mafanikio. Hutumika local
 * kuhakiki mzunguko mzima bila API keys.
 */
export async function GET(req: Request) {
  await connection();
  const cfg = paymentConfig();
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim().toUpperCase();
  const back = reference
    ? `/malipo/amefanikiwa?reference=${encodeURIComponent(reference)}`
    : "/";

  if (!cfg.mock) {
    // Mock haijawashwa — rudisha kwenye oda.
    return NextResponse.redirect(new URL(back, url.origin), 302);
  }
  if (!reference || !getOrder(reference)) {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }

  setPaymentStatus(reference, "paid", "mock");
  return NextResponse.redirect(new URL(back, url.origin), 302);
}
