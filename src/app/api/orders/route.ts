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

/** Oda zote (admin pekee). */
export async function GET(req: NextRequest) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kuona oda zote.", 401);
    }
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 200, 1000);
    return json({ ok: true, orders: listOrders(limit) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Weka oda mpya (checkout). */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<CreateOrderInput>(req);
    if (!body) return fail("Taarifa za oda hazisahihi.");
    // Ikiwa mteja ameingia,unganisha oda na akaunti yake.
    const customer = await currentCustomer();
    const { order, stock } = createOrder({
      ...body,
      customerId: customer?.id,
    });
    return json({ ok: true, order, stock }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
