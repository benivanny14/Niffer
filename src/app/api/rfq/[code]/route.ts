import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getRfq, updateRfq } from "@/lib/server/rfq";
import { isAdminRequest } from "@/lib/server/auth";

/** Ombi moja la RFQ kwa nambari. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  await connection();
  try {
    const { code } = await ctx.params;
    const rfq = getRfq(code);
    if (!rfq) return fail("Ombi la RFQ halipatikani.", 404);
    return json({ ok: true, rfq });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Sasisha hali / bei ya wito (admin pekee). */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  await connection();
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kusasisha RFQ.", 401);
    }
    const { code } = await ctx.params;
    const body = await readBody<{
      status?: string;
      quoteTsh?: number | null;
      unitQuoteTsh?: number | null;
    }>(req);
    if (!body) return fail("Taarifa za mabadiliko hazisahihi.");
    const rfq = updateRfq(code, body);
    return json({ ok: true, rfq });
  } catch (error) {
    return toErrorResponse(error);
  }
}
