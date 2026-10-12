import { getDb } from "@/lib/server/db";
import { timingSafeEqual } from "node:crypto";
import type { Order } from "@/lib/orders";

/**
 * Malipo (mobile money) kupitia AzamPay.
 *
 * Vipengele vitatu:
 * - `gateway` — AZAMPAY_APP_ID / AZAMPAY_MERCHANT_ID / AZAMPAY_API_KEY
 *   zimewekwa → tunaita AzamPay Checkout na browser hupelekwa kwenye
 *   ukurasa wao wa malipo.
 * - `mock`    — AZAMPAY_MOCK=1 → mzunguko kamili wa ndani (bila malipo halisi)
 *   ili kila kitu kiweze kuhakikiwa local.
 * - `disabled` — hakuna kitu kimejazwa → oda inabaki na malipo ya kawaida
 *   (lipa baada ya kupokea) kama ilivyokuwa awali.
 *
 * `.env.example` ina orodha ya kila kitu kinachohitajika.
 */

export type PaymentMode = "gateway" | "mock" | "disabled";
export type PaymentStatus = "pending" | "paid" | "failed";

export type PaymentStart = {
  mode: PaymentMode;
  redirectUrl?: string;
};

const env = (name: string): string => process.env[name]?.trim() || "";

/** Njia za malipo ya mtandaoni (mobile money) — si "lipa baada ya kupokea". */
const ONLINE_METHODS = ["mpesa", "mixx", "airtel"];

export function isOnlinePayment(payment: string): boolean {
  return ONLINE_METHODS.includes(payment);
}

export function paymentConfig() {
  const appId = env("AZAMPAY_APP_ID");
  const merchantId = env("AZAMPAY_MERCHANT_ID");
  const apiKey = env("AZAMPAY_API_KEY");
  const baseUrl = env("AZAMPAY_BASE_URL") || "https://apigw.azampay.co";
  const mock = env("AZAMPAY_MOCK") === "1";
  const enabled = mock || Boolean(appId && merchantId && apiKey);
  const appUrl =
    env("APP_URL") || env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
  return { appId, merchantId, apiKey, baseUrl, mock, enabled, appUrl };
}

/* ============ Kuanzisha malipo ============ */

export async function startPayment(order: Order): Promise<PaymentStart> {
  const cfg = paymentConfig();
  if (!cfg.enabled) return { mode: "disabled" };

  if (cfg.mock) {
    return {
      mode: "mock",
      redirectUrl: `/api/payments/mock?reference=${encodeURIComponent(order.code)}`,
    };
  }

  try {
    const url = await azamPayCheckout(order, cfg);
    if (url) {
      setPaymentRef(order.code, `azam-${order.code}`);
      return { mode: "gateway", redirectUrl: url };
    }
  } catch (error) {
    // Hazikuja — oda inabaki salama kwenye malipo ya kawaida (COD).
    console.error("[payments] AzamPay haikufungua:", error);
  }
  return { mode: "disabled" };
}

async function azamPayCheckout(
  order: Order,
  cfg: ReturnType<typeof paymentConfig>,
): Promise<string | null> {
  // 1) Token (client credentials)
  const tokenRes = await fetch(`${cfg.baseUrl}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: cfg.appId,
      client_secret: cfg.apiKey,
      scope: "checkout",
    }),
  });
  if (!tokenRes.ok) throw new Error(`token haikupatikana (${tokenRes.status})`);
  const tokenData = (await tokenRes.json()) as Record<string, unknown>;
  const token =
    (tokenData.access_token as string | undefined) ??
    (tokenData.accessToken as string | undefined);
  if (!token) throw new Error("hakuna access token");

  // 2) Checkout session
  const res = await fetch(`${cfg.baseUrl}/azampay/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      appId: cfg.appId,
      merchantId: cfg.merchantId,
      amount: order.totalTsh,
      currency: "TZS",
      countryCode: "TZ",
      merchantTransactionId: order.code,
      paymentDescription: `Niffer Cosmetics oda ${order.code}`,
      returnUrl: `${cfg.appUrl}/malipo/inayosubiri?reference=${order.code}`,
      failureUrl: `${cfg.appUrl}/malipo/imeshindikana?reference=${order.code}`,
      successUrl: `${cfg.appUrl}/malipo/inayosubiri?reference=${order.code}`,
      emailAddress: order.customer.email ?? undefined,
    }),
  });
  if (!res.ok) throw new Error(`checkout haikufanikiwa (${res.status})`);

  const data = (await res.json()) as Record<string, unknown>;
  const url =
    (data.url as string | undefined) ??
    (data.checkoutUrl as string | undefined) ??
    (data.paymentUrl as string | undefined);
  return url ?? null;
}

/* ============ Hali ya malipo ============ */

function setPaymentRef(code: string, ref: string): void {
  getDb()
    .prepare(
      "UPDATE orders SET payment_ref = COALESCE(payment_ref, ?) WHERE code = ?",
    )
    .run(ref, code);
}

/** Badilisha hali ya malipo (pending / paid / failed). */
export function setPaymentStatus(
  code: string,
  status: PaymentStatus,
  providerRef?: string,
): boolean {
  const result = getDb()
    .prepare(
      `UPDATE orders
         SET payment_status = ?,
             payment_ref = COALESCE(?, payment_ref)
       WHERE code = ?`,
    )
    .run(status, providerRef ?? null, code);
  return result.changes > 0;
}

export function getPaymentStatus(code: string): PaymentStatus | null {
  const row = getDb()
    .prepare("SELECT payment_status FROM orders WHERE code = ?")
    .get(code) as { payment_status?: string | null } | undefined;
  if (!row) return null;
  return (row.payment_status as PaymentStatus) ?? "pending";
}

/** Hifadhi salama ya callback ya gateway (hakikisha ni token sahihi). */
export function validCallbackToken(token: string | null): boolean {
  const expected = env("PAYMENT_CALLBACK_TOKEN");
  if (!expected) {
    // Dev: kubali. Production: KATAA (fail-closed) — callback isiyo na
    // token inaweza kubadilisha hali ya oda kwa udanganyifu.
    return process.env.NODE_ENV !== "production";
  }
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Mock mode: ni kwa development PEKEE. */
export function mockPaymentsAllowed(): boolean {
  return env("AZAMPAY_MOCK") === "1" && process.env.NODE_ENV !== "production";
}
