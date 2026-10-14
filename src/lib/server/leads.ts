import { getDb, nowIso } from "@/lib/server/db";
import { InputError } from "@/lib/server/errors";

/**
 * Lead/content repositories: ujumbe wa fomu (wasiliana/jumla), jarida,
 * kadi za zawadi na hakiki.
 */

const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;

export type MessageKind = "contact" | "wholesale" | "giftcard" | "rfq";

export type MessageRecord = {
  id: string;
  kind: MessageKind;
  name: string;
  phone: string;
  email: string;
  body: Record<string, string>;
  status: "new" | "read" | "done";
  createdAt: string;
};

export async function addMessage(input: {
  kind?: MessageKind;
  name?: string;
  phone?: string;
  email?: string;
  body?: Record<string, string>;
}): Promise<MessageRecord> {
  const name = (input.name ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();
  const kind: MessageKind =
    input.kind === "wholesale" ||
    input.kind === "giftcard" ||
    input.kind === "rfq"
      ? input.kind
      : "contact";

  if (name.length < 2) throw new InputError("Jina halisi linahitajika.");
  if (phone && !/^[0-9+\s]{9,15}$/.test(phone)) {
    throw new InputError("Weka namba sahihi ya simu (mfano 0754 000 000).");
  }
  if (kind === "contact" && (input.body?.message ?? "").trim().length < 5) {
    throw new InputError("Ujumbe wako ni mfupi sana.");
  }

  const record: MessageRecord = {
    id: id("msg"),
    kind,
    name,
    phone,
    email,
    body: input.body ?? {},
    status: "new",
    createdAt: nowIso(),
  };

  await getDb()
    .prepare(
      `INSERT INTO messages (id, kind, name, phone, email, body, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.id,
      record.kind,
      record.name,
      record.phone,
      record.email,
      JSON.stringify(record.body),
      record.status,
      record.createdAt,
    );

  return record;
}

export async function listMessages(limit = 100): Promise<MessageRecord[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as {
    id: string;
    kind: string;
    name: string;
    phone: string;
    email: string;
    body: string;
    status: string;
    created_at: string;
  }[];

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind as MessageKind,
    name: row.name,
    phone: row.phone,
    email: row.email,
    body: JSON.parse(row.body || "{}") as Record<string, string>,
    status: row.status as MessageRecord["status"],
    createdAt: row.created_at,
  }));
}

export async function countUnreadMessages(): Promise<number> {
  const row = await getDb()
    .prepare("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'")
    .get() as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}

/** Weka ujumbe kuwa umesomwa (admin). Rudisha true kama umebadilika. */
export async function markMessageRead(messageId: string): Promise<boolean> {
  const result = await getDb()
    .prepare(
      "UPDATE messages SET status = 'read' WHERE id = ? AND status = 'new'",
    )
    .run(messageId);
  return Number((await result).changes) > 0;
}

/** Weka ujumbe WOTE kuwa wamesomwa (admin bulk). Rudisha idadi. */
export async function markAllMessagesRead(): Promise<number> {
  const result = await getDb()
    .prepare("UPDATE messages SET status = 'read' WHERE status = 'new'")
    .run();
  return Number((await result).changes);
}

/* ============ Jarida (newsletter) ============ */

export async function subscribeNewsletter(
  rawEmail: string,
  source = "site",
): Promise<{ email: string; created: boolean }> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new InputError("Weka anwani sahihi ya barua pepe.");
  }
  const existing = await getDb()
    .prepare("SELECT email FROM newsletter WHERE email = ?")
    .get(email) as { email?: string } | undefined;

  if (existing?.email) return { email, created: false };

  await getDb()
    .prepare(
      "INSERT INTO newsletter (id, email, source, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(id("nl"), email, source, nowIso());

  return { email, created: true };
}

export async function listSubscribers(limit = 500): Promise<{
  email: string;
  createdAt: string;
}[]> {
  const rows = await getDb()
    .prepare("SELECT email, created_at FROM newsletter ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as { email: string; created_at: string }[];
  return rows.map((r) => ({ email: r.email, createdAt: r.created_at }));
}

export async function countSubscribers(): Promise<number> {
  const row = await getDb()
    .prepare("SELECT COUNT(*) AS n FROM newsletter")
    .get() as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}

/** Ondoa barua pepe kutoka jarida (jiondoe). Rudisha true kama ilifutwa. */
export async function unsubscribeNewsletter(rawEmail: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return false;
  const result = await getDb()
    .prepare("DELETE FROM newsletter WHERE email = ?")
    .run(email);
  return Number((await result).changes) > 0;
}

/* ============ Kadi za zawadi ============ */

export type GiftCard = {
  code: string;
  amountTsh: number;
  recipient: string;
  message: string;
  status: "issued" | "redeemed" | "expired";
  createdAt: string;
  expiresAt: string;
};

const GIFT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Kadi ya zawadi inaisha baada ya miaka 1. */
const GIFT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

function giftExpiresAt(createdAt: string): string {
  const base = Date.parse(createdAt);
  const t = Number.isFinite(base) ? base : Date.now();
  return new Date(t + GIFT_TTL_MS).toISOString();
}

/** Rudisha true kama kadi imeisha muda (bila kuandika DB). */
function isGiftExpired(
  status: string,
  createdAt: string,
  expiresAt: string | null | undefined,
): boolean {
  if (status !== "issued") return false;
  const exp = expiresAt || giftExpiresAt(createdAt);
  return Date.parse(exp) < Date.now();
}

function giftCode(): string {
  let out = "GC-";
  for (let i = 0; i < 6; i += 1) {
    out += GIFT_ALPHABET[Math.floor(Math.random() * GIFT_ALPHABET.length)];
  }
  return out;
}

export async function issueGiftCard(input: {
  amountTsh?: number;
  recipient?: string;
  message?: string;
}): Promise<GiftCard> {
  const amount = Math.floor(Number(input.amountTsh ?? 0));
  if (!Number.isFinite(amount) || amount < 1000 || amount > 1_000_000) {
    throw new InputError("Chagua thamani sahihi ya kadi.");
  }

  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM gift_cards WHERE code = ?");
  let code = giftCode();
  for (let i = 0; i < 10 && await exists.get(code); i += 1) code = giftCode();

  const createdAt = nowIso();
  const expiresAt = giftExpiresAt(createdAt);
  await db.prepare(
    `INSERT INTO gift_cards (code, amount_tsh, recipient, message, status, created_at, expires_at)
     VALUES (?, ?, ?, ?, 'issued', ?, ?)`,
  ).run(
    code,
    amount,
    (input.recipient ?? "").trim().slice(0, 80),
    (input.message ?? "").trim().slice(0, 300),
    createdAt,
    expiresAt,
  );

  return {
    code,
    amountTsh: amount,
    recipient: (input.recipient ?? "").trim(),
    message: (input.message ?? "").trim(),
    status: "issued",
    createdAt,
    expiresAt,
  };
}

export async function listGiftCards(limit = 100): Promise<GiftCard[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM gift_cards ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as {
    code: string;
    amount_tsh: number;
    recipient: string;
    message: string;
    status: string;
    created_at: string;
    expires_at: string | null;
  }[];

  return rows.map((r) => {
    const expiresAt = r.expires_at || giftExpiresAt(r.created_at);
    const status = isGiftExpired(r.status, r.created_at, r.expires_at)
      ? "expired"
      : (r.status as GiftCard["status"]);
    return {
      code: r.code,
      amountTsh: r.amount_tsh,
      recipient: r.recipient,
      message: r.message,
      status,
      createdAt: r.created_at,
      expiresAt,
    };
  });
}

/** Kadi moja kwa msimbo (redeem). Hurudisha "expired" kama muda imeisha. */
export async function getGiftCard(code: string): Promise<GiftCard | undefined> {
  const key = code.trim().toUpperCase();
  if (!key) return undefined;
  const row = await getDb()
    .prepare("SELECT * FROM gift_cards WHERE code = ?")
    .get(key) as
    | {
        code: string;
        amount_tsh: number;
        recipient: string;
        message: string;
        status: string;
        created_at: string;
        expires_at: string | null;
      }
    | undefined;
  if (!row) return undefined;

  let status = row.status;
  if (isGiftExpired(status, row.created_at, row.expires_at)) {
    // Weka "expired" kwenye DB kwa kudumu (lazy persist).
    status = "expired";
    await getDb()
      .prepare(
        "UPDATE gift_cards SET status = 'expired' WHERE code = ? AND status = 'issued'",
      )
      .run(row.code);
  }

  return {
    code: row.code,
    amountTsh: row.amount_tsh,
    recipient: row.recipient,
    message: row.message,
    status: status as GiftCard["status"],
    createdAt: row.created_at,
    expiresAt: row.expires_at || giftExpiresAt(row.created_at),
  };
}

/** Weka kadi kuwa imetumika (ndani ya transaction ya oda). Rudisha true kama imefanikiwa. */
export async function redeemGiftCard(code: string, orderCode: string, tx?: ReturnType<typeof getDb>): Promise<boolean> {
  const result = await (tx ?? getDb())
    .prepare(
      `UPDATE gift_cards
         SET status = 'redeemed', redeemed_at = ?, order_code = ?
       WHERE code = ? AND status = 'issued'
         AND (expires_at IS NULL OR expires_at > ?)`,
    )
    .run(nowIso(), orderCode, code.trim().toUpperCase(), nowIso());
  return Number((await result).changes) > 0;
}

/* ============ Hakiki ============ */

export type StoredReview = {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productSlug: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string | null;
};

export async function addReview(input: {
  customerName?: string;
  location?: string;
  rating?: number;
  comment?: string;
  productSlug?: string;
}): Promise<StoredReview> {
  const customerName = (input.customerName ?? "").trim();
  const comment = (input.comment ?? "").trim();
  const rating = Math.min(5, Math.max(1, Math.floor(Number(input.rating ?? 5))));

  if (customerName.length < 2) throw new InputError("Jina halisi linahitajika.");
  if (comment.length < 10) {
    throw new InputError("Hakiki yako ni fupi zaidi (angalau herufi 10).");
  }

  const record: StoredReview = {
    id: id("rev"),
    customerName,
    location: (input.location ?? "").trim() || "Tanzania",
    rating,
    comment: comment.slice(0, 800),
    productSlug: input.productSlug ?? "",
    // Haki: hakiki mpya zinasubiri uidhinishaji wa admin.
    status: "pending",
    createdAt: nowIso(),
  };

  await getDb()
    .prepare(
      `INSERT INTO reviews (id, customer_name, location, rating, comment, product_slug, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.id,
      record.customerName,
      record.location,
      record.rating,
      record.comment,
      record.productSlug,
      record.status,
      record.createdAt,
    );

  return record;
}

export async function listReviews(limit = 200): Promise<StoredReview[]> {
  const rows = await getDb()
    .prepare(
      `SELECT * FROM reviews WHERE status = 'approved'
       ORDER BY COALESCE(created_at, '') DESC, id DESC LIMIT ?`,
    )
    .all(limit) as unknown as {
    id: string;
    customer_name: string;
    location: string;
    rating: number;
    comment: string;
    product_slug: string;
    status: string;
    created_at: string | null;
  }[];

  return rows.map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    location: r.location,
    rating: r.rating,
    comment: r.comment,
    productSlug: r.product_slug,
    status: r.status as StoredReview["status"],
    createdAt: r.created_at,
  }));
}

function mapReviewRows(rows: {
  id: string;
  customer_name: string;
  location: string;
  rating: number;
  comment: string;
  product_slug: string;
  status: string;
  created_at: string | null;
}[]): StoredReview[] {
  return rows.map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    location: r.location,
    rating: r.rating,
    comment: r.comment,
    productSlug: r.product_slug,
    status: r.status as StoredReview["status"],
    createdAt: r.created_at,
  }));
}

/** Hakiki zote — admin (pamoja na pending/rejected). */
export async function listAllReviews(limit = 300): Promise<StoredReview[]> {
  const rows = await getDb()
    .prepare(
      `SELECT * FROM reviews
       ORDER BY COALESCE(created_at, '') DESC, id DESC LIMIT ?`,
    )
    .all(limit) as unknown as Parameters<typeof mapReviewRows>[0];
  return mapReviewRows(rows);
}

/** Sukuma upya rating/jumla ya hakiki kwenye bidhaa (DB). */
async function recomputeProductRating(productSlug: string): Promise<void> {
  if (!productSlug) return;
  const row = await getDb()
    .prepare(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS n FROM reviews
       WHERE product_slug = ? AND status = 'approved'`,
    )
    .get(productSlug) as
    | { avg_rating: number | null; n: number }
    | undefined;
  const count = Number(row?.n ?? 0);
  const avg = count > 0 ? Math.round(((row?.avg_rating ?? 0) + Number.EPSILON) * 10) / 10 : 0;
  await getDb()
    .prepare("UPDATE products SET rating = ?, review_count = ? WHERE slug = ?")
    .run(avg, count, productSlug);
}

/** Idhisha/kataa hakiki (admin). */
export async function setReviewStatus(
  reviewId: string,
  status: "approved" | "rejected",
): Promise<StoredReview> {
  const existing = await getDb()
    .prepare("SELECT product_slug FROM reviews WHERE id = ?")
    .get(reviewId) as { product_slug?: string } | undefined;
  const result = await getDb()
    .prepare("UPDATE reviews SET status = ? WHERE id = ?")
    .run(status, reviewId);
  if ((await result).changes === 0) {
    throw new InputError("Hakiki haipatikani.", 404);
  }
  // Sasisha rating ya bidhaa kutoka hakiki zilizoidhishwa.
  await recomputeProductRating(existing?.product_slug ?? "");
  const row = await getDb()
    .prepare("SELECT * FROM reviews WHERE id = ?")
    .get(reviewId) as Parameters<typeof mapReviewRows>[0][number];
  return mapReviewRows([row])[0];
}

/** Idadi ya hakiki zinazosubiri uidhinishaji (admin badge). */
export async function countPendingReviews(): Promise<number> {
  const row = await getDb()
    .prepare("SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'")
    .get() as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}
