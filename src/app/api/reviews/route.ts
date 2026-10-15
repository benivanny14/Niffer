import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, intParam, toErrorResponse } from "@/lib/server/http";
import { addReview, listAllReviews, listReviews } from "@/lib/server/leads";
import { isAdminRequest } from "@/lib/server/auth";
import { notifyAdmin } from "@/lib/server/notify";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/** Hakiki (umma: zilizoidhinishwa; admin: zote kwa `?all=1`). */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 100, 300);
    const wantAll = req.nextUrl.searchParams.get("all") === "1";
    if (wantAll) {
      if (!(await isAdminRequest())) {
        return fail("Sign in as an administrator.", 401);
      }
      return json({ ok: true, reviews: await listAllReviews(limit) });
    }
    return json({ ok: true, reviews: await listReviews(limit) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Save hakiki mpya (huingia kama pending — admin huidhisha). */
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "review-create", 5, 600);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const body = await readBody<{
      customerName?: string;
      location?: string;
      rating?: number;
      comment?: string;
      productSlug?: string;
    }>(req);
if (!body) return fail("The review details are incomplete.");
    const review = await addReview(body);
    await notifyAdmin({
      kind: "hakiki",
      title: "New review pending",
      body: `${review.customerName} (${review.rating}★): ${review.comment.slice(0, 120)}…`,
      ref: review.productSlug || undefined,
    });
    return json({ ok: true, review, pendingModeration: true }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
