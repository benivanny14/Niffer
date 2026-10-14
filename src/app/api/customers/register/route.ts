import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import {
  CUSTOMER_COOKIE,
  createCustomerSession,
  registerCustomer,
} from "@/lib/server/customers";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Jiandikishe — hufungua akaunti mpya na session cookie. */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "customer-register", 3, 600);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{
      name?: string;
      phone?: string;
      email?: string;
      password?: string;
    }>(req);
    if (!body) return fail("The account details are invalid.");

    const customer = await registerCustomer(body);
    const { token, maxAge } = await createCustomerSession(customer.id);
    const res = json({ ok: true, customer }, 201);
    res.cookies.set(CUSTOMER_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge,
    });
    return res;
  } catch (error) {
    return toErrorResponse(error);
  }
}
