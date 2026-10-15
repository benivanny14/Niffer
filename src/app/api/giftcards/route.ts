import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { createGiftCardRequest, listGiftCards, listGiftCardRequests } from "@/lib/server/leads";
import { isAdminRequest } from "@/lib/server/auth";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Kadi zote zilizotolewa (admin). */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator.", 401);
    }
    return json({ ok: true, giftCards: await listGiftCards(), requests: await listGiftCardRequests() });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Agiza kadi ya zawadi mpya (public — mteja anaagiza). */
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "giftcard-create", 5, 300);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{
      amountTsh?: number;
      buyerName?: string;
      buyerPhone?: string;
      recipient?: string;
      message?: string;
      paymentMethod?: string;
      paymentReference?: string;
    }>(req);
    if (!body) return fail("The card details are invalid.");
    const request = await createGiftCardRequest(body);
    return json({ ok: true, request }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
