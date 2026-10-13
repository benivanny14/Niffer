import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { resetPasswordWithToken } from "@/lib/server/customers";
import { notifyAdmin } from "@/lib/server/notify";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Badilisha nywila kwa msimbo wa barua pepe. */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const limited = rateLimit(req, "customer-reset", 10, 300);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{ token?: string; password?: string }>(req);
    if (!body?.token || !body?.password) {
      return fail("Msimbo na nywila mpya vinahitajika.");
    }
    const customer = resetPasswordWithToken(body.token, body.password);
    notifyAdmin({
      kind: "info",
      title: "Nywila imebadilishwa",
      body: `${customer.name} (${customer.phone}) amebadilisha nywila yake.`,
      ref: "/admin",
    });
    return json({ ok: true, message: "Nywila yako imebadilishwa. Ingia sasa." });
  } catch (error) {
    return toErrorResponse(error);
  }
}
