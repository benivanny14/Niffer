import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, intParam, toErrorResponse } from "@/lib/server/http";
import {
  createRfq,
  listRfqs,
  listRfqsByPhone,
  rfqStats,
} from "@/lib/server/rfq";
import { isAdminRequest } from "@/lib/server/auth";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/**
 * RFQ — ombi la bei ya wingi (portali ya jumla).
 * POST: ombi jipya (mteja wa jumla) — hurudisha nambari ya kufuatilia.
 * GET:  ?phone=… → ombi za biashara ile (umma); vinginevyo orodha (admin).
 */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const phone = req.nextUrl.searchParams.get("phone");
    if (phone) {
      const limited = rateLimit(req, "rfq-lookup", 10, 60);
      if (!limited.ok) {
        return fail(rateLimitMessage(limited.retryAfterSec), 429);
      }
      // Rudisha taarifa za msingi + bei — si PII kamili (biashara, simu, barua pepe).
      const rfqs = (await listRfqsByPhone(phone)).map((r) => ({
        code: r.code,
        productName: r.productName,
        qty: r.qty,
        status: r.status,
        quoteTsh: r.quoteTsh,
        unitQuoteTsh: r.unitQuoteTsh,
        createdAt: r.createdAt,
      }));
      return json({ ok: true, rfqs });
    }
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuona ombi zote za RFQ.", 401);
    }
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 200, 500);
    return json({ ok: true, rfqs: await listRfqs(limit), stats: await rfqStats() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "rfq-create", 5, 600);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{
      business?: string;
      name?: string;
      phone?: string;
      email?: string;
      region?: string;
      productSlug?: string;
      productName?: string;
      qty?: number | string;
      note?: string;
    }>(req);
    if (!body) return fail("Taarifa za ombi hazisahihi.");
    const rfq = await createRfq(body);
    return json({ ok: true, rfq }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
