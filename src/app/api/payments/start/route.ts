import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getPaymentStatus, startPayment } from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";
import { currentCustomer } from "@/lib/server/customers";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";
import { isOnlinePayment } from "@/lib/server/payments";

/**
 * Anzisha malipo upya kwa oda isiyolipwa (kitufe cha "Jaribu tena").
 * Huonyesha ukurasa wa malipo wa gateway (au mock) upya.
 */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const limited = await rateLimit(req, "payment-start", 5, 300);
    if (!limited.ok) return fail(rateLimitMessage(limited.retryAfterSec), 429);
    const body = await readBody<{ reference?: string; phone?: string }>(req);
    const reference = (body?.reference ?? "").trim().toUpperCase();
if (!reference) return fail("An order number is required.");

    const order = await getOrder(reference);
    if (!order) return fail("Order not found.", 404);
    if (!isOnlinePayment(order.payment)) return fail("This order does not use online payment.", 400);
    if (order.status === "ghairiwa") return fail("This order has been cancelled.", 409);
    const customer = await currentCustomer();
    const ownsOrder = customer && order.customerId === customer.id;
    const enteredPhone = (body?.phone ?? "").replace(/\D/g, "").replace(/^255/, "0");
    const orderPhone = order.customer.phone.replace(/\D/g, "").replace(/^255/, "0");
    if (!ownsOrder && (!enteredPhone || enteredPhone !== orderPhone)) {
      return fail("Enter the phone number used when placing this order.", 403);
    }
    if (await getPaymentStatus(reference) === "paid") {
      return fail("Payment has already been completed for this order.", 409);
    }

    const payment = await startPayment(order);
    return json({ ok: true, payment });
  } catch (error) {
    return toErrorResponse(error);
  }
}
