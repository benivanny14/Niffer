import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getOrder, updateOrderStatus } from "@/lib/server/orders";
import { demoOrders, type OrderStatus } from "@/lib/orders";
import { isAdminRequest } from "@/lib/server/auth";

/**
 * Oda moja kwa nambari (umma).
 * Ndani ya DB kwanza, kisha oda za demo (NCF-XXXX) zinazotumika kwenye majaribio.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  await connection();
  try {
    const { code } = await ctx.params;
    const order =
      getOrder(code) ??
      demoOrders().find(
        (o) => o.code.toLowerCase() === code.trim().toLowerCase(),
      );

    if (!order) return fail("Oda hiyo haipatikani.", 404);
    return json({ ok: true, order });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Badilisha hatua ya oda (admin pekee). */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Ingia kama admin kubadilisha oda.", 401);
    }
    const { code } = await ctx.params;
    const body = await readBody<{ status?: OrderStatus }>(req);
    if (!body?.status) return fail("Hatua mpya haijawekwa.");
    const order = updateOrderStatus(code, body.status);
    return json({ ok: true, order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
