import { type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/auth";
import { getOrder } from "@/lib/server/orders";
import { notifyCustomer } from "@/lib/server/customer-notify";
import { InputError } from "@/lib/server/errors";

/**
 * Tuma arifa kwa mteja wa oda (admin pekee).
 * Body: `{ title, body?, kind? }`
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  try {
    if (!(await isAdminRequest())) {
      return fail("Sign in as an administrator to send a message.", 401);
    }
    const { code } = await ctx.params;
    const order = await getOrder(code);
    if (!order) return fail("Order not found.", 404);

    const body = await readBody<{
      title?: string;
      body?: string;
      kind?: string;
    }>(req);
    const title = (body?.title ?? "").trim();
    if (title.length < 2) {
      throw new InputError("Enter a message subject.");
    }

    await notifyCustomer({
      customerId: order.customerId,
      phone: order.customer.phone,
      orderCode: order.code,
      kind: body?.kind ?? "oda",
      title,
      body: (body?.body ?? "").trim(),
    });

    return json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
