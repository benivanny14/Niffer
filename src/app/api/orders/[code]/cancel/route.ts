import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getOrder, cancelOrder } from "@/lib/server/orders";
import { currentCustomer } from "@/lib/server/customers";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

const digits = (value: string) => value.replace(/[^0-9]/g, "");

/**
 * Ghairi oda (mteja) — inaruhusiwa tu wakati bado "imapokelewa".
 * Umiliki: session ya mteja (customer_id) AU namba ya simu inayolingana
 * na ile ya oda (mteja wa kawaida / guest).
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  await connection();
  try {
    const limited = rateLimit(req, "order-cancel", 5, 600);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const { code } = await ctx.params;
    const order = await getOrder(code);
    if (!order) return fail("Order not found.", 404);
    if (order.demo) return fail("Demo orders cannot be cancelled.");

    const body = await readBody<{ phone?: string }>(req);
    const phone = (body?.phone ?? "").trim();

    const customer = await currentCustomer();
    const ownsBySession =
      customer != null && order.customerId === customer.id;
    const ownsByPhone =
      phone.length >= 9 &&
      digits(phone) === digits(order.customer.phone ?? "");

    if (!ownsBySession && !ownsByPhone) {
      return fail(
        "The phone number does not match this order. Enter the number used to place it.",
        403,
      );
    }

    const updated = await cancelOrder(order.code);
    return json({ ok: true, order: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
