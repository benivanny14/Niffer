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
  if (!found) throw new InputError("Njia ya malipo si sahihi.");
  return found.id;
}

/** Stoo halisi ya bidhaa zote (DB). */
export function getStockMap(): Record<string, number> {
  const rows = getDb()
    .prepare("SELECT slug, qty FROM stock")
    .all() as { slug: string; qty: number }[];
  const map: Record<string, number> = {};
  for (const row of rows) map[row.slug] = row.qty;
  // Hakikisha kila bidhaa ya katalogi ipo.
  for (const p of products) if (!(p.slug in map)) map[p.slug] = p.stock;
  return map;
}

type CatalogItem = { slug: string; name: string; priceTsh: number };

/**
 * Katalogi ya bei kutoka DB (bidhaa za admin zikiwemo) na fallback ya
 * katalogi ya ndani. Inatumika kuhesabu upya bei salama kwenye oda.
 */
function pricedCatalog(): CatalogItem[] {
  try {
    const rows = getDb()
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

/** Weka stoo ya bidhaa moja (admin). */
export function setStockValue(slug: string, qty: number): number {
  const safe = Math.max(0, Math.floor(qty));
  getDb()
    .prepare(
      `INSERT INTO stock (slug, qty, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET qty = excluded.qty, updated_at = excluded.updated_at`,
    )
    .run(slug, safe, nowIso());
  return safe;
}

/**
 * Tengeneza oda — hesabu upya bei kutoka katalogi (kuzuia udanganyifu),
 * thibitisha stoo, punguza stoo na hifadhi oda kwenye DB.
 */
export function createOrder(input: CreateOrderInput): {
  order: Order;
  stock: Record<string, number>;
} {
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

  if (customer.name.length < 2) throw new InputError("Jina halisi linahitajika.");
  if (!/^[0-9+\s]{9,15}$/.test(customer.phone)) {
    throw new InputError("Weka namba sahihi ya simu (mfano 0754 000 000).");
  }
  if (!isRegion(customer.region)) throw new InputError("Chagua mkoa sahihi.");
  if (!customer.city || !isCityInRegion(customer.region, customer.city)) {
    throw new InputError("Chagua mji / wilaya sahihi ndani ya mkoa uliochagua.");
  }
  if (!customer.street || customer.street.length < 2) {
    throw new InputError("Weka mtaa / kata yako.");
  }
  if (customer.address.length < 5) {
    throw new InputError("Weka anwani kamili ya kuwasilishwa.");
  }

  const payment = validPayment(input.payment ?? "cod");

  const rawLines = input.lines ?? [];
  if (rawLines.length === 0) throw new InputError("Kikapu chako ni tupu.");
  if (rawLines.length > 30) throw new InputError("Oda imezidi kiwango.");

  // Pooza kiasi na bidhaa.
  const catalog = pricedCatalog();
  const lines: CartLine[] = [];
  for (const line of rawLines) {
    const qty = Math.floor(Number(line.qty));
    if (!line.slug || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      throw new InputError("Kiasi cha bidhaa si sahihi.");
    }
    const product = catalog.find((p) => p.slug === line.slug);
    if (!product) throw new InputError(`Bidhaa "${line.slug}" haipo.`);
    if (!lines.some((l) => l.slug === line.slug)) {
      lines.push({ slug: line.slug, qty });
    }
  }

  const stock = getStockMap();
  for (const line of lines) {
    const available = stock[line.slug] ?? 0;
    if (line.qty > available) {
      const name = catalog.find((p) => p.slug === line.slug)?.name ?? line.slug;
      throw new InputError(
        available === 0
          ? `${name} imeisha stoo. Ondoa kutoka kikapu.`
          : `Stoo ya ${name} imebaki ${available} tu.`,
        409,
      );
    }
  }

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
    ? applyPromoFromDb(input.promoCode, subtotalTsh)
    : null;
  const applied = promo && promo.ok ? promo : null;
  const discountTsh = applied
    ? applied.discountTsh(subtotalTsh, shippingBase)
    : 0;
  const shippingTsh = applied?.freeShipping ? 0 : shippingBase;

  // Kadi ya zawadi: thibitisha na hesabu (haiwezi kuzidi jumla).
  let giftCard = null as ReturnType<typeof getGiftCard> | null;
  let giftDiscountTsh = 0;
  if (input.giftCardCode?.trim()) {
    giftCard = getGiftCard(input.giftCardCode.trim());
    if (!giftCard || giftCard.status !== "issued") {
      throw new InputError("Kadi ya zawadi si sahihi au tayari imetumika.");
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
  for (let i = 0; i < 8 && exists.get(code); i += 1) code = makeOrderCode();
  if (exists.get(code)) throw new InputError("Jaribu tena (msisitizo wa nambari).", 500);

  const createdAt = nowIso();
  const history: StatusEvent[] = [
    { status: "imapokelewa", at: createdAt },
  ];

  db.exec("BEGIN");
  try {
    db.prepare(
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

    db.prepare(
      "INSERT INTO order_events (code, status, at) VALUES (?, ?, ?)",
    ).run(code, "imapokelewa", createdAt);

    // Punguza stoo — thibitisha kwamba kuna kutosha (si MAX(0, …)).
    const dec = db.prepare(
      "UPDATE stock SET qty = qty - ?, updated_at = ? WHERE slug = ? AND qty >= ?",
    );
    for (const line of lines) {
      const result = dec.run(line.qty, createdAt, line.slug, line.qty);
      if (Number(result.changes) !== 1) {
        throw new InputError(
          `Stoo ya ${line.slug} haitoshi. Jaribu tena.`,
          409,
        );
      }
    }

    // Redeem kadi ya zawadi ndani ya transaction (haiwezi kutumika tena).
    if (giftCard) {
      const redeemed = redeemGiftCard(giftCard.code, code);
      if (!redeemed) {
        throw new InputError(
          "Kadi ya zawadi tayari imetumika na mtu mwingine.",
          409,
        );
      }
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error instanceof InputError
      ? error
      : new InputError("Imeshindikana kuhifadhi oda. Jaribu tena.", 500);
  }

  // Arifa kwa admin (DB + barua pepe nyepesi).
  const location = [customer.city, customer.region].filter(Boolean).join(", ");
  notifyAdmin({
    kind: "oda",
    title: `Oda mpya ${code}`,
    body: `${customer.name} (${customer.phone}) — ${formatTsh(totalTsh)}. Bidhaa: ${lines.map((l) => `${l.slug} ×${l.qty}`).join(", ")}. Eneo: ${location}, ${customer.street}`,
    ref: `/admin`,
  });

  // Arifa kwa mteja: oda yako imepokelewa.
  notifyCustomer({
    customerId: input.customerId,
    phone: customer.phone,
    orderCode: code,
    kind: "oda",
    title: `Oda yako ${code} imepokelewa`,
    body: `Tumepokea oda yako ya ${formatTsh(totalTsh)}. Tutakuarifu unapoanza kuandaliwa. Fuatilia hali yake kwenye ukurasa wa oda.`,
  });

  const order = getOrder(code);
  if (!order) throw new InputError("Imeshindikana kuhifadhi oda.", 500);

  return { order, stock: getStockMap() };
}

/** Oda zote (mpya kwanza). */
export function listOrders(limit = 200): Order[] {
  const rows = getDb()
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as OrderRow[];
  return rows.map(rowToOrder);
}

/** Oda moja kwa nambari. */
export function getOrder(code: string): Order | undefined {
  const key = code.trim().toUpperCase();
  if (!key) return undefined;
  const row = getDb()
    .prepare("SELECT * FROM orders WHERE code = ?")
    .get(key) as OrderRow | undefined;
  return row ? rowToOrder(row) : undefined;
}

/** Badilisha hatua ya oda (admin). */
export function updateOrderStatus(
  code: string,
  status: OrderStatus,
): Order | undefined {
  if (!VALID_STATUSES.includes(status)) {
    throw new InputError("Hatua ya oda si sahihi.");
  }
  // Kughairiwa — hudumisha stoo na kadi ya zawadi.
  if (status === "ghairiwa") return cancelOrder(code);
  const key = code.trim().toUpperCase();
  const existing = getOrder(key);
  if (!existing) throw new InputError("Oda haipatikani.", 404);

  const at = nowIso();
  const history = [...(existing.history ?? [])];
  if (!history.some((h) => h.status === status)) {
    history.push({ status, at });
  }

  const db = getDb();
  db.prepare("UPDATE orders SET status = ?, history = ? WHERE code = ?").run(
    status,
    JSON.stringify(history),
    key,
  );
  db.prepare(
    "INSERT INTO order_events (code, status, at) VALUES (?, ?, ?)",
  ).run(key, status, at);

  return getOrder(key);
}

/**
 * Ghairi oda — kurudisha stoo na (ikiwa kupo) kadi ya zawadi.
 * Inaruhusiwa tu wakati oda bado "imapokelewa" (hajanza kuandaliwa).
 */
export function cancelOrder(code: string): Order | undefined {
  const key = code.trim().toUpperCase();
  const existing = getOrder(key);
  if (!existing) throw new InputError("Oda haipatikani.", 404);
  if (existing.demo) {
    throw new InputError("Oda ya majaribio haiwezi kughairiwa.");
  }
  if (existing.status === "ghairiwa") return existing;
  if (existing.status !== "imapokelewa") {
    throw new InputError(
      "Oda hii tayari imeanza kuandaliwa — haiwezi kughairiwa. Tupigie simu kwa msaada.",
      409,
    );
  }

  const at = nowIso();
  const db = getDb();
  db.exec("BEGIN");
  try {
    // Rudisha stoo ya kila bidhaa.
    const inc = db.prepare(
      "UPDATE stock SET qty = qty + ?, updated_at = ? WHERE slug = ?",
    );
    for (const line of existing.lines) {
      inc.run(line.qty, at, line.slug);
    }
    // Rudisha kadi ya zawadi (kama ilikuwa imetumika na oda hii).
    if (existing.giftCardCode) {
      db.prepare(
        `UPDATE gift_cards SET status = 'issued', redeemed_at = NULL, order_code = NULL
         WHERE code = ? AND status = 'redeemed' AND order_code = ?`,
      ).run(existing.giftCardCode, key);
    }

    const history = [...(existing.history ?? [])];
    if (!history.some((h) => h.status === "ghairiwa")) {
      history.push({ status: "ghairiwa", at });
    }
    db.prepare(
      "UPDATE orders SET status = 'ghairiwa', history = ? WHERE code = ?",
    ).run(JSON.stringify(history), key);
    db.prepare(
      "INSERT INTO order_events (code, status, at) VALUES (?, 'ghairiwa', ?)",
    ).run(key, at);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  notifyAdmin({
    kind: "oda",
    title: `Oda ${key} imeghairishwa`,
    body: `Oda ${key} ya ${existing.customer.name} (${existing.customer.phone}) imeghairishwa. Stoo imerudishwa.`,
    ref: "/admin",
  });
  notifyCustomer({
    customerId: existing.customerId,
    phone: existing.customer.phone,
    orderCode: key,
    kind: "status",
    title: `Oda ${key} imeghairiwa`,
    body: `Oda yako ${key} imeghairishwa kama ulivyoomba. Stoo imerudishwa; ikiwa ulilipa tayari, tutakuarifu kuhusu marejesho.`,
  });

  return getOrder(key);
}

/** Takwimu za dashibodi. */
export function orderStats(): {
  orderCount: number;
  revenueTsh: number;
  pendingCount: number;
} {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS orderCount,
              COALESCE(SUM(CASE WHEN status != 'ghairiwa' THEN total_tsh ELSE 0 END), 0) AS revenueTsh,
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
