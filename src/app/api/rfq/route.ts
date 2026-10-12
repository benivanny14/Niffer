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
      return json({ ok: true, rfqs: listRfqsByPhone(phone) });
    }
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuona ombi zote za RFQ.", 401);
    }
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 200, 500);
    return json({ ok: true, rfqs: listRfqs(limit), stats: rfqStats() });
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
    const rfq = createRfq(body);
    return json({ ok: true, rfq }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
