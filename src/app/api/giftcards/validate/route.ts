import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getGiftCard } from "@/lib/server/leads";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/**
 * Thibitisha kadi ya zawadi kabla ya kulipa (checkout preview).
 * Hurudisha thamani iliyobaki — haiharibu kadi.
 */
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "giftcard-validate", 15, 60);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{ code?: string }>(req);
    if (!body?.code) return fail("Enter a gift card code.");
    const card = await getGiftCard(String(body.code));
    if (!card) return json({ ok: false, error: "Gift card not found." }, 404);
    if (card.status !== "issued") {
      return json(
        { ok: false, error: "This card has already been used or has expired." },
        400,
      );
    }
    return json({
      ok: true,
      giftCard: {
        code: card.code,
        amountTsh: card.amountTsh,
        recipient: card.recipient,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
