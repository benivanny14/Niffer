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
    const order = getOrder(code);
    if (!order) return fail("Oda hiyo haipatikani.", 404);
    if (order.demo) return fail("Oda ya majaribio haiwezi kughairiwa.");

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
        "Nambari ya simu hailingani na oda hii. Weka simu uliyotumia kuweka oda.",
        403,
      );
    }

    const updated = cancelOrder(order.code);
    return json({ ok: true, order: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
