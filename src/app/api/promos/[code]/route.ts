import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { setPromoActive } from "@/lib/server/promo";
import { isAdminRequest } from "@/lib/server/auth";

/** Enter/ondoa uzima wa msimbo (admin). */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator.", 401);
    }
    const { code } = await ctx.params;
    const body = await readBody<{ active?: boolean }>(req);
    if (!body) return fail("The information is invalid.");
    const promo = await setPromoActive(code, body.active !== false);
    return json({ ok: true, promo });
  } catch (error) {
    return toErrorResponse(error);
  }
}
