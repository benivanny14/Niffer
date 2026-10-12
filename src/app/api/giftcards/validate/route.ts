import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getGiftCard } from "@/lib/server/leads";

/**
 * Thibitisha kadi ya zawadi kabla ya kulipa (checkout preview).
 * Hurudisha thamani iliyobaki — haiharibu kadi.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<{ code?: string }>(req);
    if (!body?.code) return fail("Weka msimbo wa kadi.");
    const card = getGiftCard(String(body.code));
    if (!card) return json({ ok: false, error: "Kadi haipatikani." }, 404);
    if (card.status !== "issued") {
      return json(
        { ok: false, error: "Kadi hii tayari imetumika au imeisha." },
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
