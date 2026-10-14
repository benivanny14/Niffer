import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import {
  subscribeNewsletter,
  countSubscribers,
  listSubscribers,
} from "@/lib/server/leads";
import { isAdminRequest } from "@/lib/server/auth";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Orodha ya waasisi wa jarida (admin). */
export async function GET() {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator.", 401);
    }
    return json({
      ok: true,
      total: await countSubscribers(),
      subscribers: await listSubscribers(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Jiunge na jarida. */
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "newsletter", 5, 600);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{ email?: string; source?: string }>(req);
    if (!body?.email) return fail("Enter your email address.");
    const result = await subscribeNewsletter(
      String(body.email),
      String(body.source ?? "site"),
    );
    return json(
      {
        ok: true,
        ...result,
        message: result.created
          ? "Thank you for subscribing to the Niffer newsletter."
          : "This email is already subscribed.",
      },
      result.created ? 201 : 200,
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
