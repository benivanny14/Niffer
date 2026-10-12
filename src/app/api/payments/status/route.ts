import { connection } from "next/server";
import { json, fail, toErrorResponse } from "@/lib/server/http";
import { getPaymentStatus } from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";

/** Hali ya malipo ya oda (inayotumika na ukurasa wa kusubiri). */
export async function GET(req: Request) {
  await connection();
  try {
    const reference = new URL(req.url).searchParams
      .get("reference")
      ?.trim()
      .toUpperCase();
    if (!reference) return fail("Nambari ya oda inahitajika.");

    const status = getPaymentStatus(reference);
    const order = getOrder(reference);
    if (!order || !status) return fail("Oda haipatikani.", 404);

    return json({
      ok: true,
      reference,
      status,
      paymentMethod: order.payment,
      order,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
