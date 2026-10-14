import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getRfq, updateRfq } from "@/lib/server/rfq";
import { isAdminRequest } from "@/lib/server/auth";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Ombi moja la RFQ kwa nambari. */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  await connection();
  try {
    const limited = rateLimit(req, "rfq-get", 15, 60);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const { code } = await ctx.params;
    const rfq = await getRfq(code);
    if (!rfq) return fail("Ombi la RFQ halipatikani.", 404);
    // Rudisha tu taarifa za msingi + bei (si PII kamili).
    return json({
      ok: true,
      rfq: {
        code: rfq.code,
        productName: rfq.productName,
        qty: rfq.qty,
        status: rfq.status,
        quoteTsh: rfq.quoteTsh,
        unitQuoteTsh: rfq.unitQuoteTsh,
        createdAt: rfq.createdAt,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Sasisha hali / bei ya wito (admin pekee). */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kusasisha RFQ.", 401);
    }
    const { code } = await ctx.params;
    const body = await readBody<{
      status?: string;
      quoteTsh?: number | null;
      unitQuoteTsh?: number | null;
    }>(req);
    if (!body) return fail("Taarifa za mabadiliko hazisahihi.");
    const rfq = await updateRfq(code, body);
    return json({ ok: true, rfq });
  } catch (error) {
    return toErrorResponse(error);
  }
}
