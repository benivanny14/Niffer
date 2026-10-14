import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getPaymentStatus, startPayment } from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";

/**
 * Anzisha malipo upya kwa oda isiyolipwa (kitufe cha "Jaribu tena").
 * Huonyesha ukurasa wa malipo wa gateway (au mock) upya.
 */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await readBody<{ reference?: string }>(req);
    const reference = (body?.reference ?? "").trim().toUpperCase();
if (!reference) return fail("An order number is required.");

    const order = await getOrder(reference);
    if (!order) return fail("Order not found.", 404);
    if (await getPaymentStatus(reference) === "paid") {
      return fail("Payment has already been completed for this order.", 409);
    }

    const payment = await startPayment(order);
    return json({ ok: true, payment, order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
