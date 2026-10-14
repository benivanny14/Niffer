import { connection, type NextRequest } from "next/server";
import { json, fail, readBody, toErrorResponse } from "@/lib/server/http";
import { getPaymentStatus, startPayment } from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";

/**
 * Anzisha malipo upya kwa oda isiyolipwa (kitufe cha "Jaribu tena").
 * Huonyesha ukurasa wa malipo wa gateway (au mock) upya.
 */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await readBody<{ reference?: string }>(req);
    const reference = (body?.reference ?? "").trim().toUpperCase();
    if (!reference) return fail("Nambari ya oda inahitajika.");

    const order = await getOrder(reference);
    if (!order) return fail("Oda haipatikani.", 404);
    if (await getPaymentStatus(reference) === "paid") {
      return fail("Malipo tayari yamefanikiwa kwa oda hii.", 409);
    }

    const payment = await startPayment(order);
    return json({ ok: true, payment, order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
