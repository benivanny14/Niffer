import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { setReviewStatus } from "@/lib/server/leads";
import { isAdminRequest } from "@/lib/server/auth";

/** Idhisha/kataa hakiki (admin pekee). */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin.", 401);
    }
    const { id } = await ctx.params;
    const body = await readBody<{ status?: string }>(req);
    if (!body) return fail("Hakiki haijajazwa vizuri.");
    const status = body.status === "approved" ? "approved" : "rejected";
    const review = setReviewStatus(id, status);
    return json({ ok: true, review });
  } catch (error) {
    return toErrorResponse(error);
  }
}
