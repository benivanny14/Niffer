import { getDb, nowIso } from "@/lib/server/db";
import { InputError } from "@/lib/server/orders";

/**
 * Lead/content repositories: ujumbe wa fomu (wasiliana/jumla), jarida,
 * kadi za zawadi na hakiki.
 */

const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;

export type MessageKind = "contact" | "wholesale" | "giftcard";

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

export function addMessage(input: {
  kind?: MessageKind;
  name?: string;
  phone?: string;
  email?: string;
  body?: Record<string, string>;
}): MessageRecord {
  const name = (input.name ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();
  const kind: MessageKind =
    input.kind === "wholesale" || input.kind === "giftcard"
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

  getDb()
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

export function listMessages(limit = 100): MessageRecord[] {
  const rows = getDb()
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

export function countUnreadMessages(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'")
    .get() as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}

/* ============ Jarida (newsletter) ============ */

export function subscribeNewsletter(
  rawEmail: string,
  source = "site",
): { email: string; created: boolean } {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new InputError("Weka anwani sahihi ya barua pepe.");
  }
  const existing = getDb()
    .prepare("SELECT email FROM newsletter WHERE email = ?")
    .get(email) as { email?: string } | undefined;

  if (existing?.email) return { email, created: false };

  getDb()
    .prepare(
      "INSERT INTO newsletter (id, email, source, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(id("nl"), email, source, nowIso());

  return { email, created: true };
}

export function listSubscribers(limit = 500): {
  email: string;
  createdAt: string;
}[] {
  const rows = getDb()
    .prepare("SELECT email, created_at FROM newsletter ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as { email: string; created_at: string }[];
  return rows.map((r) => ({ email: r.email, createdAt: r.created_at }));
}

export function countSubscribers(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM newsletter")
    .get() as { n?: number } | undefined;
  return Number(row?.n ?? 0);
}

/* ============ Kadi za zawadi ============ */

export type GiftCard = {
  code: string;
  amountTsh: number;
  recipient: string;
  message: string;
  status: "issued" | "redeemed" | "expired";
  createdAt: string;
};

const GIFT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function giftCode(): string {
  let out = "GC-";
  for (let i = 0; i < 6; i += 1) {
    out += GIFT_ALPHABET[Math.floor(Math.random() * GIFT_ALPHABET.length)];
  }
  return out;
}

export function issueGiftCard(input: {
  amountTsh?: number;
  recipient?: string;
  message?: string;
}): GiftCard {
  const amount = Math.floor(Number(input.amountTsh ?? 0));
  if (!Number.isFinite(amount) || amount < 1000 || amount > 1_000_000) {
    throw new InputError("Chagua thamani sahihi ya kadi.");
  }

  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM gift_cards WHERE code = ?");
  let code = giftCode();
  for (let i = 0; i < 10 && exists.get(code); i += 1) code = giftCode();

  const createdAt = nowIso();
  db.prepare(
    `INSERT INTO gift_cards (code, amount_tsh, recipient, message, status, created_at)
     VALUES (?, ?, ?, ?, 'issued', ?)`,
  ).run(
    code,
    amount,
    (input.recipient ?? "").trim().slice(0, 80),
    (input.message ?? "").trim().slice(0, 300),
    createdAt,
  );

  return {
    code,
    amountTsh: amount,
    recipient: (input.recipient ?? "").trim(),
    message: (input.message ?? "").trim(),
    status: "issued",
    createdAt,
  };
}

export function listGiftCards(limit = 100): GiftCard[] {
  const rows = getDb()
    .prepare("SELECT * FROM gift_cards ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as {
    code: string;
    amount_tsh: number;
    recipient: string;
    message: string;
    status: string;
    created_at: string;
  }[];

  return rows.map((r) => ({
    code: r.code,
    amountTsh: r.amount_tsh,
    recipient: r.recipient,
    message: r.message,
    status: r.status as GiftCard["status"],
    createdAt: r.created_at,
  }));
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

export function addReview(input: {
  customerName?: string;
  location?: string;
  rating?: number;
  comment?: string;
  productSlug?: string;
}): StoredReview {
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
    status: "approved",
    createdAt: nowIso(),
  };

  getDb()
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

export function listReviews(limit = 200): StoredReview[] {
  const rows = getDb()
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
