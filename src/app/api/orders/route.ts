import { connection, type NextRequest } from "next/server";
import {
  json,
  fail,
  readBody,
  intParam,
  toErrorResponse,
} from "@/lib/server/http";
import { createOrder, listOrders, type CreateOrderInput } from "@/lib/server/orders";
import { isAdminRequest } from "@/lib/server/auth";
import { currentCustomer } from "@/lib/server/customers";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";
import { startPayment, isOnlinePayment } from "@/lib/server/payments";

/** Oda zote (admin pekee). */
export async function GET(req: NextRequest) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator to view all orders.", 401);
    }
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 200, 1000);
    return json({ ok: true, orders: await listOrders(limit) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Enter oda mpya (checkout). */
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "order-create", 10, 300);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<CreateOrderInput>(req);
    if (!body) return fail("The order details are invalid.");
    // Ikiwa mteja ameingia,unganisha oda na akaunti yake.
    const customer = await currentCustomer();
    const { order, stock } = await createOrder({
      ...body,
      customerId: customer?.id,
    });

    // Malipo ya mtandaoni (M-Pesa/Mixx/Airtel) — anzisha gateway session.
    let paymentUrl: string | undefined;
    if (body.payment && isOnlinePayment(body.payment)) {
      const payment = await startPayment(order);
      if (payment.redirectUrl) paymentUrl = payment.redirectUrl;
    }

    return json({ ok: true, order, stock, paymentUrl }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
