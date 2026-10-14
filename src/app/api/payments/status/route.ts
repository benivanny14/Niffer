import { connection, type NextRequest } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { getPaymentStatus } from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Hali ya malipo ya oda (inayotumika na ukurasa wa kusubiri). */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "payment-status", 30, 60);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }

    const reference = req.nextUrl.searchParams
      .get("reference")
      ?.trim()
      .toUpperCase();
    if (!reference) return fail("Nambari ya oda inahitajika.");

    const status = await getPaymentStatus(reference);
    const order = await getOrder(reference);
    if (!order || !status) return fail("Oda haipatikani.", 404);

    // Rudisha tu taarifa zinazohitajika — si PII kamili ya mteja.
    return json({
      ok: true,
      reference,
      status,
      paymentMethod: order.payment,
      totalTsh: order.totalTsh,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
