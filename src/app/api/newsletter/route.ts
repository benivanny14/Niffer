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
      return fail("Ingia kama admin.", 401);
    }
    return json({
      ok: true,
      total: countSubscribers(),
      subscribers: listSubscribers(),
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
    if (!body?.email) return fail("Weka anwani ya barua pepe.");
    const result = subscribeNewsletter(
      String(body.email),
      String(body.source ?? "site"),
    );
    return json(
      {
        ok: true,
        ...result,
        message: result.created
          ? "Asante! Umejiunga na jarida la Niffer."
          : "Barua pepe hii tayari iko kwenye jarida.",
      },
      result.created ? 201 : 200,
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
