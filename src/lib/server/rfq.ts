import { getDb, nowIso } from "@/lib/server/db";
import { InputError } from "@/lib/server/errors";
import { bulkUnitPrice, tierFor } from "@/lib/wholesale";

/**
 * RFQ (Request for Quote) — ombi la bei ya wingi kama Alibaba.
 * Kila ombi hupatiwa nambari (RFQ-XXXXX) ili mteja aweze kufuatilia
 * hatua na bei iliyowekwa na timu ya jumla kupitia portali ya /jumla.
 */

export type RfqStatus = "new" | "reviewed" | "quoted" | "accepted" | "declined";

export const rfqStatusSteps: { id: RfqStatus; label: string }[] = [
  { id: "new", label: "Imepokelewa" },
  { id: "reviewed", label: "Inapitiwa" },
  { id: "quoted", label: "Bei yamewekwa" },
  { id: "accepted", label: "Imekubalika" },
  { id: "declined", label: "Imekataliwa" },
];

export type Rfq = {
  code: string;
  business: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  productSlug: string;
  productName: string;
  qty: number;
  note: string;
  status: RfqStatus;
  /** Bei ya jumla iliyowekwa na timu (jumla kwa oda yote). */
  quoteTsh: number | null;
  /** Bei ya unit iliyowekwa na timu. */
  unitQuoteTsh: number | null;
  createdAt: string;
  updatedAt: string;
};

type RfqRow = {
  code: string;
  business: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  product_slug: string;
  product_name: string;
  qty: number;
  note: string;
  status: string;
  quote_tsh: number | null;
  unit_quote_tsh: number | null;
  created_at: string;
  updated_at: string;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRfqCode(): string {
  let out = "";
  for (let i = 0; i < 5; i += 1) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `RFQ-${out}`;
}

function rowToRfq(row: RfqRow): Rfq {
  return {
    code: row.code,
    business: row.business,
    name: row.name,
    phone: row.phone,
    email: row.email,
    region: row.region,
    productSlug: row.product_slug,
    productName: row.product_name,
    qty: row.qty,
    note: row.note,
    status: (rfqStatusSteps.some((s) => s.id === row.status)
      ? row.status
      : "new") as RfqStatus,
    quoteTsh: row.quote_tsh,
    unitQuoteTsh: row.unit_quote_tsh,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CreateRfqInput = {
  business?: string;
  name?: string;
  phone?: string;
  email?: string;
  region?: string;
  productSlug?: string;
  productName?: string;
  qty?: number | string;
  note?: string;
  /** Bei ya rejareja ya bidhaa (kwa makadirio ya daraja). */
  retailPriceTsh?: number;
};

/** Hifadhi ombi la bei ya jumla na urudishe nambari ya kufuatilia. */
export function createRfq(input: CreateRfqInput): Rfq {
  const business = (input.business ?? "").trim();
  const name = (input.name ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();
  const region = (input.region ?? "").trim();
  const productSlug = (input.productSlug ?? "").trim();
  const productName = (input.productName ?? "").trim();
  const note = (input.note ?? "").trim().slice(0, 600);
  const qty = Math.floor(Number(input.qty));

  if (business.length < 2) throw new InputError("Jina la biashara linahitajika.");
  if (name.length < 2) throw new InputError("Jina la mtu wa kuwasiliana linahitajika.");
  if (!/^[0-9+\s]{9,15}$/.test(phone)) {
    throw new InputError("Weka namba sahihi ya simu (mfano 0754 000 000).");
  }
  if (!Number.isFinite(qty) || qty < 1 || qty > 1_000_000) {
    throw new InputError("Wingi sahihi unahitajika (mfano 50).");
  }

  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM rfqs WHERE code = ?");
  let code = makeRfqCode();
  for (let i = 0; i < 10 && exists.get(code); i += 1) code = makeRfqCode();
  if (exists.get(code)) {
    throw new InputError("Jaribu tena (msisitizo wa nambari ya RFQ).", 500);
  }

  const at = nowIso();
  db.prepare(
    `INSERT INTO rfqs (
       code, business, name, phone, email, region,
       product_slug, product_name, qty, note, status,
       quote_tsh, unit_quote_tsh, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NULL, NULL, ?, ?)`,
  ).run(
    code,
    business,
    name,
    phone,
    email,
    region,
    productSlug,
    productName,
    qty,
    note,
    at,
    at,
  );

  // Rekodi pia kwenye ujumbe wa fomu ili uonekane kwenye inbox ya admin.
  try {
    db.prepare(
      `INSERT INTO messages (id, kind, name, phone, email, body, status, created_at)
       VALUES (?, 'rfq', ?, ?, ?, ?, 'new', ?)`,
    ).run(
      `rfq-${code}`,
      name,
      phone,
      email,
      JSON.stringify({
        code,
        business,
        region,
        product: productName,
        quantity: String(qty),
        note,
      }),
      at,
    );
  } catch {
    /* ujumbe ni nyongeza tu — RFQ tayari imehifadhiwa */
  }

  const created = getRfq(code);
  if (!created) throw new InputError("Imeshindikana kuhifadhi ombi. Jaribu tena.", 500);
  return created;
}

/** Oda mpya kwanza. */
export function listRfqs(limit = 200): Rfq[] {
  const rows = getDb()
    .prepare("SELECT * FROM rfqs ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as RfqRow[];
  return rows.map(rowToRfq);
}

/** Ombi moja kwa nambari. */
export function getRfq(code: string): Rfq | undefined {
  const key = code.trim().toUpperCase();
  if (!key) return undefined;
  const row = getDb()
    .prepare("SELECT * FROM rfqs WHERE code = ?")
    .get(key) as RfqRow | undefined;
  return row ? rowToRfq(row) : undefined;
}

/** Ombi za biashara moja (portali — kwa simu iliyosajiliwa). */
export function listRfqsByPhone(phone: string, limit = 50): Rfq[] {
  const digits = normalizePhone(phone);
  if (digits.length < 9) return [];
  // Tafuta kwa nambari zilizoandikwa (0754… / 255754… ni sawa).
  const rows = getDb()
    .prepare("SELECT * FROM rfqs ORDER BY created_at DESC LIMIT 500")
    .all() as unknown as RfqRow[];
  return rows
    .filter((row) => {
      const stored = normalizePhone(row.phone);
      return (
        stored === digits ||
        stored.replace(/^0/, "255") === digits.replace(/^0/, "255")
      );
    })
    .slice(0, limit)
    .map(rowToRfq);
}

/** Punguza simu kuwa tarakimu tu (kulinganisha salama). */
function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

const VALID_STATUS = rfqStatusSteps.map((s) => s.id);

/** Sasisha hali na bei ya wito (admin). */
export function updateRfq(
  code: string,
  patch: { status?: string; quoteTsh?: number | null; unitQuoteTsh?: number | null },
): Rfq {
  const key = code.trim().toUpperCase();
  const existing = getRfq(key);
  if (!existing) throw new InputError("Ombi la RFQ halipatikani.", 404);

  const cols: string[] = [];
  const vals: (string | number | null)[] = [];

  if (patch.status !== undefined) {
    if (!VALID_STATUS.includes(patch.status as RfqStatus)) {
      throw new InputError("Hali ya RFQ si sahihi.");
    }
    cols.push("status = ?");
    vals.push(patch.status);
  }
  if (patch.quoteTsh !== undefined) {
    const value =
      patch.quoteTsh === null ? null : Math.max(0, Math.round(patch.quoteTsh));
    cols.push("quote_tsh = ?");
    vals.push(value);
  }
  if (patch.unitQuoteTsh !== undefined) {
    const value =
      patch.unitQuoteTsh === null
        ? null
        : Math.max(0, Math.round(patch.unitQuoteTsh));
    cols.push("unit_quote_tsh = ?");
    vals.push(value);
  }
  if (cols.length === 0) throw new InputError("Hakuna mabadiliko yaliyotumwa.");

  // Bei ya unit pekee imejazwa — hesabu jumla.
  if (patch.unitQuoteTsh != null && patch.quoteTsh === undefined) {
    cols.push("quote_tsh = ?");
    vals.push(Math.round(patch.unitQuoteTsh) * existing.qty);
  }

  cols.push("updated_at = ?");
  vals.push(nowIso());

  getDb()
    .prepare(`UPDATE rfqs SET ${cols.join(", ")} WHERE code = ?`)
    .run(...vals, key);

  const updated = getRfq(key);
  if (!updated) throw new InputError("Imeshindikana kusasisha ombi.", 500);
  return updated;
}

/** Makadirio ya daraja kwa ombi (RFQ preview). */
export function rfqTierPreview(retailPriceTsh: number, qty: number) {
  const tier = tierFor(qty);
  return {
    tier,
    unitPriceTsh: bulkUnitPrice(retailPriceTsh, qty),
  };
}

export function rfqStats(): { total: number; newCount: number; quoted: number } {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END), 0) AS newCount,
              COALESCE(SUM(CASE WHEN status = 'quoted' THEN 1 ELSE 0 END), 0) AS quoted
       FROM rfqs`,
    )
    .get() as
    | { total: number; newCount: number; quoted: number }
    | undefined;
  return {
    total: Number(row?.total ?? 0),
    newCount: Number(row?.newCount ?? 0),
    quoted: Number(row?.quoted ?? 0),
  };
}
