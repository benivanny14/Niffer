import { connection } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import {
  currentCustomer,
  listCustomerOrders,
} from "@/lib/server/customers";

/** Oda zangu (mteja aliyeingia pekee). */
export async function GET() {
  await connection();
  try {
    const customer = await currentCustomer();
    if (!customer) return fail("Ingia kwenye akaunti yako kuona oda.", 401);
    return json({ ok: true, orders: listCustomerOrders(customer) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
