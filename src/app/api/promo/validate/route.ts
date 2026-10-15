import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { applyPromoFromDb } from "@/lib/server/promo";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/**
 * Thibitisha msimbo wa punguzo (checkout preview).
 * Server ndio mwanzo wa ukweli — DB ya promo codes.
 */
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "promo-validate", 20, 60);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{
      code?: string;
      subtotalTsh?: number;
      shippingTsh?: number;
    }>(req);
    if (!body) return fail("The code is invalid.");
    const subtotal = Math.max(0, Math.floor(Number(body.subtotalTsh ?? 0)));
    const shipping = Math.max(
      0,
      Math.floor(Number(body.shippingTsh ?? 0)),
    );
    const result = await applyPromoFromDb(String(body.code ?? ""), subtotal);
    if (!result.ok) return json({ ok: false, error: result.reason }, 400);
    return json({
      ok: true,
      promo: {
        code: result.code,
        label: result.label,
        freeShipping: result.freeShipping,
        discountTsh: result.discountTsh(subtotal, shipping),
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
