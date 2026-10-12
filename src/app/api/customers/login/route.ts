import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import {
  CUSTOMER_COOKIE,
  createCustomerSession,
  loginCustomer,
} from "@/lib/server/customers";

/** Ingia kwenye akaunti yako (simu + nywila). */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await readBody<{ phone?: string; password?: string }>(req);
    if (!body) return fail("Taarifa za kuingia hazisahihi.");

    const customer = loginCustomer(body);
    const { token, maxAge } = createCustomerSession(customer.id);
    const res = json({ ok: true, customer });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge,
    });
    return res;
  } catch (error) {
    return toErrorResponse(error);
  }
}
