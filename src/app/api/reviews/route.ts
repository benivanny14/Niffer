import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, intParam, toErrorResponse } from "@/lib/server/http";
import { addReview, listReviews } from "@/lib/server/leads";

/** Hakiki zilizoidhinishwa. */
export async function GET(req: NextRequest) {
  await connection();
  try {
    const limit = intParam(req.nextUrl.searchParams.get("limit"), 100, 300);
    return json({ ok: true, reviews: listReviews(limit) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Hifadhi hakiki mpya. */
export async function POST(req: NextRequest) {
  try {
    const body = await readBody<{
      customerName?: string;
      location?: string;
      rating?: number;
      comment?: string;
      productSlug?: string;
    }>(req);
    if (!body) return fail("Hakiki haijajazwa vizuri.");
    const review = addReview(body);
    return json({ ok: true, review }, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}
