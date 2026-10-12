import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import {
  CUSTOMER_COOKIE,
  createCustomerSession,
  registerCustomer,
} from "@/lib/server/customers";

/** Jiandikishe — hufungua akaunti mpya na session cookie. */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await readBody<{
      name?: string;
      phone?: string;
      email?: string;
      password?: string;
    }>(req);
    if (!body) return fail("Taarifa za akaunti hazisahihi.");

    const customer = registerCustomer(body);
    const { token, maxAge } = createCustomerSession(customer.id);
    const res = json({ ok: true, customer }, 201);
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
