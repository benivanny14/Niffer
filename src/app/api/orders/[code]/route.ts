import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getOrder, updateOrderStatus } from "@/lib/server/orders";
import { demoOrders, statusSteps, type Order, type OrderStatus } from "@/lib/orders";
import { isAdminRequest } from "@/lib/server/auth";
import { notifyCustomer } from "@/lib/server/customer-notify";
import { rateLimit, rateLimitMessage } from "@/lib/server/rate-limit";

/**
 * Ondoa PII kutoka oda — public endpoint haipaswi kurudisha
 * jina, simu, anwani au barua pepe ya mteja.
 */
function sanitizeOrder(order: Order) {
  return {
    code: order.code,
    createdAt: order.createdAt,
    status: order.status,
    payment: order.payment,
    paymentStatus: order.paymentStatus,
    lines: order.lines,
    subtotalTsh: order.subtotalTsh,
    shippingTsh: order.shippingTsh,
    totalTsh: order.totalTsh,
    discountTsh: order.discountTsh,
    giftDiscountTsh: order.giftDiscountTsh,
    history: order.history,
    demo: order.demo,
  };
}

/**
 * Oda moja kwa nambari (umma).
 * Ndani ya DB kwanza, kisha oda za demo (NCF-XXXX) zinazotumika kwenye majaribio.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  await connection();
  try {
    const limited = rateLimit(req, "order-lookup", 20, 60);
    if (!limited.ok) {
      return fail(rateLimitMessage(limited.retryAfterSec), 429);
    }
    const { code } = await ctx.params;
    const order =
      getOrder(code) ??
      demoOrders().find(
        (o) => o.code.toLowerCase() === code.trim().toLowerCase(),
      );

    if (!order) return fail("Oda hiyo haipatikani.", 404);
    return json({ ok: true, order: sanitizeOrder(order) });
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
    if (!order) return fail("Oda haipatikani.", 404);
    // Arifu mteja kwa mkupuo wa hatua mpya.
    const stepLabel = statusSteps.find((s) => s.id === body.status)?.label ?? body.status;
    notifyCustomer({
      customerId: order.customerId,
      phone: order.customer.phone,
      orderCode: order.code,
      kind: "status",
      title: `Oda ${order.code}: ${stepLabel}`,
      body: `Oda yako ${order.code} imefikia hatua ya ${stepLabel.toLowerCase()}.`,
    });
    return json({ ok: true, order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
