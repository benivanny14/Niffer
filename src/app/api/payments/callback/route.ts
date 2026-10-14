import { connection, type NextRequest } from "next/server";
import { json, fail } from "@/lib/server/http";
import {
  setPaymentStatus,
  validCallbackToken,
  type PaymentStatus,
} from "@/lib/server/payments";
import { getOrder } from "@/lib/server/orders";

/**
 * AzamPay callback (webhook) — gateway hutuma hali ya muamala hapa baada ya
 * mteja kumaliza malipo. Enter `PAYMENT_CALLBACK_TOKEN` kwenye env ili kuhakikisha
 * ni mwitikio halisi wa gateway (header: `x-callback-token` au `token`).
 */
export async function POST(req: NextRequest) {
  await connection();
  try {
    const token =
      req.headers.get("x-callback-token") ??
      req.nextUrl.searchParams.get("token");
    if (!validCallbackToken(token)) {
      return fail("Invalid token.", 401);
    }

    const body = (await req.json().catch(() => null)) as {
      reference?: string;
      merchantTransactionId?: string;
      transactionId?: string;
      status?: string;
      result?: string;
    } | null;
if (!body) return fail("The payment response is invalid.");

    const reference = (
      body.reference ??
      body.merchantTransactionId ??
      ""
    )
      .trim()
      .toUpperCase();
    if (!reference || !(await getOrder(reference))) {
      return fail("Order not found.", 404);
    }

    const raw = (body.status ?? body.result ?? "").toUpperCase();
    const status: PaymentStatus =
      raw.includes("SUCCESS") || raw.includes("PAID") || raw === "0"
        ? "paid"
        : raw.includes("FAIL") || raw.includes("CANCEL")
          ? "failed"
          : "pending";

    await setPaymentStatus(reference, status, body.transactionId);
    return json({ ok: true, reference, status });
  } catch {
    return fail("Server error.", 500);
  }
}
