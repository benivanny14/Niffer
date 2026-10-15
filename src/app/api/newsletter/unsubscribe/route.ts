import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { unsubscribeNewsletter } from "@/lib/server/leads";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Unsubscribe from the newsletter (umma). */
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "newsletter-unsub", 10, 600);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{ email?: string }>(req);
    if (!body?.email) return fail("Enter your email address.");
    const removed = await unsubscribeNewsletter(String(body.email));
    return json({
      ok: true,
      removed,
      message: removed
        ? "You have been unsubscribed. We will miss you!"
        : "This email is not subscribed.",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
