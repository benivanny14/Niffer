import { type NextRequest } from "next/server";
import { fail, json, readBody, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { reviewGiftCardRequest } from "@/lib/server/leads";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdminRequest())) return fail("Sign in as an administrator.", 401);
    const body = await readBody<{ action?: "verify_payment" | "approve" | "reject" }>(req);
    if (!body?.action || !["verify_payment", "approve", "reject"].includes(body.action)) {
      return fail("Choose a valid review action.");
    }
    const { id } = await ctx.params;
    const request = await reviewGiftCardRequest(id, body.action);
    return json({ ok: true, request });
  } catch (error) {
    return toErrorResponse(error);
  }
}
