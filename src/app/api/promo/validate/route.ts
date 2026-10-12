import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { applyPromoFromDb } from "@/lib/server/promo";

/**
 * Thibitisha msimbo wa punguzo (checkout preview).
 * Server ndio mwanzo wa ukweli — DB ya promo codes.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<{
      code?: string;
      subtotalTsh?: number;
      shippingTsh?: number;
    }>(req);
    if (!body) return fail("Msimbo si sahihi.");
    const subtotal = Math.max(0, Math.floor(Number(body.subtotalTsh ?? 0)));
    const shipping = Math.max(
      0,
      Math.floor(Number(body.shippingTsh ?? 0)),
    );
    const result = applyPromoFromDb(String(body.code ?? ""), subtotal);
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
