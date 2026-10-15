import { getDb, nowIso } from "@/lib/server/db";
import { makeOrderCode, formatTsh } from "@/lib/format";
import { applyPromoFromDb } from "@/lib/server/promo";
import { notifyAdmin } from "@/lib/server/notify";
import { notifyCustomer } from "@/lib/server/customer-notify";
import { InputError } from "@/lib/server/errors";
import { getGiftCard, redeemGiftCard } from "@/lib/server/leads";
import { products } from "@/lib/data/catalog";
import { site, paymentMethods, isRegion, isCityInRegion, type PaymentId } from "@/lib/site";
import {
  statusSteps,
  type CartLine,
  type Order,
  type OrderStatus,
  type StatusEvent,
} from "@/lib/orders";

export type OrderRow = {
  code: string;
  created_at: string;
  status: string;
  customer: string;
  payment: string;
  lines: string;
  subtotal_tsh: number;
  shipping_tsh: number;
  total_tsh: number;
  promo_code: string | null;
  discount_tsh: number | null;
  history: string;
  demo: number;
  customer_id?: string | null;
  payment_status?: string | null;
  payment_ref?: string | null;
  gift_card_code?: string | null;
  gift_discount_tsh?: number | null;
};

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function rowToOrder(row: OrderRow): Order {
  return {
    code: row.code,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    customer: parseJson<Order["customer"]>(row.customer, {
      name: "",
      phone: "",
      region: "",
      address: "",
    }),
    payment: row.payment as PaymentId,
    lines: parseJson<CartLine[]>(row.lines, []),
    subtotalTsh: row.subtotal_tsh,
    shippingTsh: row.shipping_tsh,
    totalTsh: row.total_tsh,
    promoCode: row.promo_code ?? undefined,
    discountTsh: row.discount_tsh ?? undefined,
    history: parseJson<StatusEvent[]>(row.history, []),
    demo: row.demo === 1,
    paymentStatus: (row.payment_status as Order["paymentStatus"]) ?? "pending",
    paymentRef: row.payment_ref ?? undefined,
    customerId: row.customer_id ?? undefined,
    giftCardCode: row.gift_card_code ?? undefined,
    giftDiscountTsh: row.gift_discount_tsh ?? undefined,
  };
}

export type CreateOrderInput = {
  customer?: Partial<Order["customer"]>;
  payment?: string;
  lines?: CartLine[];
  promoCode?: string;
  /** Msimbo wa kadi ya zawadi (redeem kutoka DB). */
  giftCardCode?: string;
  /** Mteja aliyeingia (session) — huunganishwa na akaunti yake. */
  customerId?: string;
};

const VALID_STATUSES: OrderStatus[] = [
  ...statusSteps.map((s) => s.id),
  "ghairiwa",
];

function validPayment(id: string): PaymentId {
  const found = paymentMethods.find((m) => m.id === id);
  if (!found) throw new InputError("Invalid payment method.");
  return found.id;
}

/** Stoo halisi ya bidhaa zote (DB). */
export async function getStockMap(): Promise<Record<string, number>> {
  const rows = await getDb()
    .prepare("SELECT slug, qty FROM stock")
    .all() as { slug: string; qty: number }[];
  const map: Record<string, number> = {};
  for (const row of rows) map[row.slug] = row.qty;
  // Hakikisha kila bidhaa ya katalogi ipo.
  for (const p of products) if (!(p.slug in map)) map[p.slug] = p.stock;
  return map;
}

export type StockMovement = {
  id: number;
  slug: string;
  name: string;
  delta: number;
  quantity: number;
  reason: string;
  reference: string | null;
  createdAt: string;
};

export async function listStockMovements(limit = 50, slug?: string): Promise<StockMovement[]> {
  const filterSlug = slug?.trim();
  const where = filterSlug ? "WHERE m.slug = ?" : "";
  const values = filterSlug
    ? [filterSlug, Math.min(200, Math.max(1, Math.floor(limit)))]
    : [Math.min(200, Math.max(1, Math.floor(limit)))];
  const rows = await getDb().prepare(
    `SELECT m.id, m.slug, p.name, m.delta, m.quantity, m.reason, m.reference, m.created_at
     FROM stock_movements m LEFT JOIN products p ON p.slug = m.slug
     ${where}
     ORDER BY m.id DESC LIMIT ?`,
  ).all(...values) as {
    id: number; slug: string; name: string | null; delta: number; quantity: number;
    reason: string; reference: string | null; created_at: string;
  }[];
  return rows.map((row) => ({
    id: Number(row.id), slug: row.slug, name: row.name ?? row.slug,
    delta: Number(row.delta), quantity: Number(row.quantity), reason: row.reason,
    reference: row.reference, createdAt: row.created_at,
  }));
}

type CatalogItem = { slug: string; name: string; priceTsh: number };

/**
 * Katalogi ya bei kutoka DB (bidhaa za admin zikiwemo) na fallback ya
 * katalogi ya ndani. Inatumika kuhesabu upya bei salama kwenye oda.
 */
async function pricedCatalog(): Promise<CatalogItem[]> {
  try {
    const rows = await getDb()
      .prepare("SELECT slug, name, price_tsh FROM products")
      .all() as { slug: string; name: string; price_tsh: number }[];
    if (rows.length > 0) {
      return rows.map((r) => ({
        slug: r.slug,
        name: r.name,
        priceTsh: r.price_tsh,
      }));
    }
  } catch {
    /* DB haijasoma — tumia fallback */
  }
  return products.map((p) => ({
    slug: p.slug,
    name: p.name,
    priceTsh: p.priceTsh,
  }));
}

/** Enter stoo ya bidhaa moja (admin). */
export async function setStockValue(slug: string, qty: number): Promise<number> {
  const safe = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 0;
  const key = slug.trim();
  const db = getDb();
  const at = nowIso();
  await db.transaction(async (tx) => {
    const row = await tx.prepare("SELECT qty FROM stock WHERE slug = ? FOR UPDATE").get(key) as { qty?: number } | undefined;
    if (!row) throw new InputError("Product not found.", 404);
    const previous = Number(row.qty ?? 0);
    if (previous === safe) return;
    await tx.prepare(
      `UPDATE stock SET qty = ?, updated_at = ? WHERE slug = ?`,
    ).run(safe, at, key);
    await tx.prepare(
      "INSERT INTO stock_movements (slug, delta, quantity, reason, created_at) VALUES (?, ?, ?, 'admin_adjustment', ?)",
    ).run(key, safe - previous, safe, at);
  });
  return safe;
}

async function recordStockMovement(
  tx: ReturnType<typeof getDb>, slug: string, delta: number, quantity: number,
  reason: string, reference: string, at: string,
): Promise<void> {
  await tx.prepare(
    "INSERT INTO stock_movements (slug, delta, quantity, reason, reference, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(slug, delta, quantity, reason, reference, at);
}

/**
 * Tengeneza oda — hesabu upya bei kutoka katalogi (kuzuia udanganyifu),
 * thibitisha stoo, punguza stoo na hifadhi oda kwenye DB.
 */
export async function createOrder(input: CreateOrderInput): Promise<{
  order: Order;
  stock: Record<string, number>;
}> {
  const customer = {
    name: (input.customer?.name ?? "").trim(),
    phone: (input.customer?.phone ?? "").trim(),
    region: (input.customer?.region ?? "").trim(),
    city: input.customer?.city?.trim() || undefined,
    street: input.customer?.street?.trim() || undefined,
    address: (input.customer?.address ?? "").trim(),
    note: input.customer?.note?.trim() || undefined,
    email: input.customer?.email?.trim() || undefined,
  };

  if (customer.name.length < 2) throw new InputError("Please enter your name.");
  if (!/^[0-9+\s]{9,15}$/.test(customer.phone)) {
    throw new InputError("Enter a valid phone number (for example, 0754 000 000).");
  }
  if (!isRegion(customer.region)) throw new InputError("Choose a valid region.");
  if (!customer.city || !isCityInRegion(customer.region, customer.city)) {
    throw new InputError("Choose a valid city or district within the selected region.");
  }
  if (!customer.street || customer.street.length < 2) {
    throw new InputError("Enter your street or ward.");
  }
  if (customer.address.length < 5) {
    throw new InputError("Enter the full delivery address.");
  }

  const payment = validPayment(input.payment ?? "cod");

  const rawLines = input.lines ?? [];
  if (rawLines.length === 0) throw new InputError("Your cart is empty.");
  if (rawLines.length > 30) throw new InputError("The order exceeds the allowed limit.");

  // Pooza kiasi na bidhaa.
  const catalog = await pricedCatalog();
  const lines: CartLine[] = [];
  const quantities = new Map<string, number>();
  for (const line of rawLines) {
    if (!line || typeof line !== "object") throw new InputError("Invalid product quantity.");
    const qty = Math.floor(Number(line.qty));
    if (!line.slug || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      throw new InputError("Invalid product quantity.");
    }
    const product = catalog.find((p) => p.slug === line.slug);
    if (!product) throw new InputError(`Product "${line.slug}" was not found.`);
    const combined = (quantities.get(line.slug) ?? 0) + qty;
    if (combined > 99) throw new InputError("A product quantity cannot exceed 99.");
    quantities.set(line.slug, combined);
  }
  for (const [slug, qty] of quantities) lines.push({ slug, qty });

  // Hesabu upya bei (server ndio mwanzo wa ukweli — DB katalogi).
  const subtotalTsh = lines.reduce((sum, line) => {
    const p = catalog.find((x) => x.slug === line.slug)!;
    return sum + p.priceTsh * line.qty;
  }, 0);

  const shippingBase =
    customer.region === "Dar es Salaam" &&
    subtotalTsh < site.freeShippingThresholdTsh
      ? site.baseShippingTsh
      : 0;

  const promo = input.promoCode
    ? await applyPromoFromDb(input.promoCode, subtotalTsh)
    : null;
  const applied = promo && promo.ok ? promo : null;
  const discountTsh = applied
    ? applied.discountTsh(subtotalTsh, shippingBase)
    : 0;
  const shippingTsh = applied?.freeShipping ? 0 : shippingBase;

  // Gift card: thibitisha na hesabu (haiwezi kuzidi jumla).
  let giftCard = null as Awaited<ReturnType<typeof getGiftCard>> | null;
  let giftDiscountTsh = 0;
  if (input.giftCardCode?.trim()) {
    giftCard = await getGiftCard(input.giftCardCode.trim());
    if (!giftCard || giftCard.status !== "issued") {
      throw new InputError("The gift card is invalid or has already been used.");
    }
    const beforeGift = Math.max(
      0,
      subtotalTsh - (applied?.freeShipping ? 0 : discountTsh),
    );
    giftDiscountTsh = Math.min(giftCard.amountTsh, beforeGift);
  }

  const totalTsh =
    Math.max(
      0,
      subtotalTsh - (applied?.freeShipping ? 0 : discountTsh) - giftDiscountTsh,
    ) + shippingTsh;

  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM orders WHERE code = ?");
  let code = makeOrderCode();
  for (let i = 0; i < 8 && await exists.get(code); i += 1) code = makeOrderCode();
  if (await exists.get(code)) throw new InputError("Please try again.", 500);

  const createdAt = nowIso();
  const inventoryLines = [...lines].sort((a, b) => a.slug.localeCompare(b.slug));
  const history: StatusEvent[] = [
    { status: "imapokelewa", at: createdAt },
  ];

  try {
    await db.transaction(async (tx) => {
    await tx.prepare(
      `INSERT INTO orders (
         code, created_at, status, customer, payment, lines,
         subtotal_tsh, shipping_tsh, total_tsh, promo_code, discount_tsh, history, demo, customer_id,
         gift_card_code, gift_discount_tsh
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    ).run(
      code,
      createdAt,
      "imapokelewa",
      JSON.stringify(customer),
      payment,
      JSON.stringify(lines),
      subtotalTsh,
      shippingTsh,
      totalTsh,
      applied ? applied.code : null,
      discountTsh > 0 ? discountTsh : null,
      JSON.stringify(history),
      input.customerId ?? null,
      giftCard ? giftCard.code : null,
      giftDiscountTsh > 0 ? giftDiscountTsh : null,
    );

    await tx.prepare(
      "INSERT INTO order_events (code, status, at) VALUES (?, ?, ?)",
    ).run(code, "imapokelewa", createdAt);

    // Conditionally decrement inside this transaction to avoid overselling.
    const dec = tx.prepare(
      "UPDATE stock SET qty = qty - ?, updated_at = ? WHERE slug = ? AND qty >= ?",
    );
    for (const line of inventoryLines) {
      const result = await dec.run(line.qty, createdAt, line.slug, line.qty);
      if (Number(result.changes) !== 1) {
        const row = await tx.prepare("SELECT qty FROM stock WHERE slug = ?").get(line.slug) as { qty?: number } | undefined;
        const available = Number(row?.qty ?? 0);
        const name = catalog.find((p) => p.slug === line.slug)?.name ?? line.slug;
        throw new InputError(
          available === 0
            ? `${name} is out of stock. Remove it from your cart.`
            : `Only ${available} of ${name} remain in stock.`,
          409,
        );
      }
      const remaining = await tx.prepare("SELECT qty FROM stock WHERE slug = ?").get(line.slug) as { qty?: number } | undefined;
      await recordStockMovement(tx, line.slug, -line.qty, Number(remaining?.qty ?? 0), "order_placed", code, createdAt);
    }

    // Redeem kadi ya zawadi ndani ya transaction (haiwezi kutumika tena).
    if (giftCard) {
      const redeemed = await redeemGiftCard(giftCard.code, code, tx);
      if (!redeemed) {
        throw new InputError(
          "This gift card has already been redeemed by someone else.",
          409,
        );
      }
    }

    });
  } catch (error) {
    throw error instanceof InputError
      ? error
      : new InputError("Could not save the order. Please try again.", 500);
  }

  // Arifa kwa admin (DB + barua pepe nyepesi).
  const location = [customer.city, customer.region].filter(Boolean).join(", ");
  await notifyAdmin({
    kind: "oda",
    title: `New order ${code}`,
    body: `${customer.name} (${customer.phone}) ? ${formatTsh(totalTsh)}. Products: ${lines.map((l) => `${l.slug} x${l.qty}`).join(", ")}. Location: ${location}, ${customer.street}`,
    ref: `/admin`,
  });

  // Arifa kwa mteja: oda yako imepokelewa.
  await notifyCustomer({
    customerId: input.customerId,
    phone: customer.phone,
    orderCode: code,
    kind: "oda",
    title: `Order ${code} received`,
    body: `We received your order for ${formatTsh(totalTsh)}. We will notify you when preparation begins. Track its status on the order page.`,
  });

  const order = await getOrder(code);
  if (!order) throw new InputError("Could not save the order.", 500);

  return { order, stock: await getStockMap() };
}

/** Oda zote (mpya kwanza). */
export async function listOrders(limit = 200): Promise<Order[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as OrderRow[];
  return rows.map(rowToOrder);
}

/** Oda moja kwa nambari. */
export async function getOrder(code: string): Promise<Order | undefined> {
  const key = code.trim().toUpperCase();
  if (!key) return undefined;
  const row = await getDb()
    .prepare("SELECT * FROM orders WHERE code = ?")
    .get(key) as OrderRow | undefined;
  return row ? rowToOrder(row) : undefined;
}

/** Badilisha hatua ya oda (admin). */
export async function updateOrderStatus(
  code: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  if (!VALID_STATUSES.includes(status)) {
    throw new InputError("Invalid order status.");
  }
  // Kughairiwa — hudumisha stoo na kadi ya zawadi.
  if (status === "ghairiwa") return cancelOrder(code);
  const key = code.trim().toUpperCase();
  const existing = await getOrder(key);
  if (!existing) throw new InputError("Order not found.", 404);

  const at = nowIso();
  const history = [...(existing.history ?? [])];
  if (!history.some((h) => h.status === status)) {
    history.push({ status, at });
  }

  const db = getDb();
  await db.prepare("UPDATE orders SET status = ?, history = ? WHERE code = ?").run(
    status,
    JSON.stringify(history),
    key,
  );
  await db.prepare(
    "INSERT INTO order_events (code, status, at) VALUES (?, ?, ?)",
  ).run(key, status, at);

  return getOrder(key);
}

/**
 * Ghairi oda — kurudisha stoo na (ikiwa kupo) kadi ya zawadi.
 * Inaruhusiwa tu wakati oda bado "imapokelewa" (hajanza kuandaliwa).
 */
export async function cancelOrder(code: string): Promise<Order | undefined> {
  const key = code.trim().toUpperCase();
  const existing = await getOrder(key);
  if (!existing) throw new InputError("Order not found.", 404);
  if (existing.demo) {
    throw new InputError("Demo orders cannot be cancelled.");
  }
  if (existing.status === "ghairiwa") return existing;
  if (existing.status !== "imapokelewa") {
    throw new InputError(
      "This order is already being prepared and cannot be cancelled. Contact us for help.",
      409,
    );
  }

  const at = nowIso();
  const db = getDb();
  try {
    await db.transaction(async (tx) => {
    const history = [...(existing.history ?? [])];
    if (!history.some((h) => h.status === "ghairiwa")) {
      history.push({ status: "ghairiwa", at });
    }
    const claimed = await tx.prepare(
      "UPDATE orders SET status = 'ghairiwa', history = ? WHERE code = ? AND status = 'imapokelewa'",
    ).run(JSON.stringify(history), key);
    if (claimed.changes !== 1) {
      throw new InputError("This order can no longer be cancelled.", 409);
    }
    // Rudisha stoo ya kila bidhaa.
    const inc = tx.prepare(
      "UPDATE stock SET qty = qty + ?, updated_at = ? WHERE slug = ?",
    );
    for (const line of existing.lines) {
      await inc.run(line.qty, at, line.slug);
      const restored = await tx.prepare("SELECT qty FROM stock WHERE slug = ?").get(line.slug) as { qty?: number } | undefined;
      await recordStockMovement(tx, line.slug, line.qty, Number(restored?.qty ?? 0), "order_cancelled", key, at);
    }
    // Rudisha kadi ya zawadi (kama ilikuwa imetumika na oda hii).
    if (existing.giftCardCode) {
      await tx.prepare(
        `UPDATE gift_cards SET status = 'issued', redeemed_at = NULL, order_code = NULL
         WHERE code = ? AND status = 'redeemed' AND order_code = ?`,
      ).run(existing.giftCardCode, key);
    }

    await tx.prepare(
      "INSERT INTO order_events (code, status, at) VALUES (?, 'ghairiwa', ?)",
    ).run(key, at);
    });
  } catch (error) {
    throw error;
  }

  await notifyAdmin({
    kind: "oda",
    title: `Order ${key} cancelled`,
    body: `Order ${key} for ${existing.customer.name} (${existing.customer.phone}) was cancelled. Stock has been restored.`,
    ref: "/admin",
  });
  await notifyCustomer({
    customerId: existing.customerId,
    phone: existing.customer.phone,
    orderCode: key,
    kind: "status",
    title: `Order ${key} cancelled`,
    body: `Your order ${key} was cancelled as requested. Stock has been restored. If you already paid, we will contact you about the refund.`,
  });

  return getOrder(key);
}

/** Takwimu za dashibodi. */
export async function orderStats(): Promise<{
  orderCount: number;
  revenueTsh: number;
  pendingCount: number;
}> {
  const row = await getDb()
    .prepare(
      `SELECT COUNT(*) AS orderCount,
              COALESCE(SUM(CASE
                WHEN payment_status = 'paid' OR (payment = 'cod' AND status = 'imefika')
                THEN total_tsh ELSE 0 END), 0) AS revenueTsh,
              COALESCE(SUM(CASE WHEN status NOT IN ('imefika', 'ghairiwa') THEN 1 ELSE 0 END), 0) AS pendingCount
       FROM orders`,
    )
    .get() as
    | { orderCount: number; revenueTsh: number; pendingCount: number }
    | undefined;

  return {
    orderCount: Number(row?.orderCount ?? 0),
    revenueTsh: Number(row?.revenueTsh ?? 0),
    pendingCount: Number(row?.pendingCount ?? 0),
  };
}
