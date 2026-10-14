import { connection } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import {
  currentCustomer,
  listCustomerOrders,
} from "@/lib/server/customers";

/** My orders (mteja aliyeingia pekee). */
export async function GET() {
  await connection();
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Sign in to your account to view orders.", 401);
    return json({ ok: true, orders: listCustomerOrders(customer) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
