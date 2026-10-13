import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { unsubscribeNewsletter } from "@/lib/server/leads";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Jiondoe kwenye jarida (umma). */
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "newsletter-unsub", 10, 600);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{ email?: string }>(req);
    if (!body?.email) return fail("Weka anwani ya barua pepe.");
    const removed = unsubscribeNewsletter(String(body.email));
    return json({
      ok: true,
      removed,
      message: removed
        ? "Umeondolewa kwenye jarida. Tutakukosa!"
        : "Barua pepe hii haipo kwenye jarida.",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
