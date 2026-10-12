import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import {
  CUSTOMER_COOKIE,
  createCustomerSession,
  loginCustomer,
} from "@/lib/server/customers";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Ingia kwenye akaunti yako (simu + nywila). */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "customer-login", 5, 300);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
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
