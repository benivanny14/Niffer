import { getDb, nowIso } from "@/lib/server/db";
import { InputError } from "@/lib/server/errors";
import type { PromoResult, PromoRule } from "@/lib/promo";

/**
 * Msimbo wa punguzo kwenye DB — admin anaweza kuongeza/kuzima.
 * Seed hutoka kwenye `promoCodes` ya ndani mara ya kwanza.
 */

type PromoRow = {
  code: string;
  label: string;
  percent_off: number | null;
  free_shipping: number;
  min_subtotal_tsh: number | null;
  active: number;
  expires_at: string | null;
  redeemed_at: string | null;
};

function rowToRule(row: PromoRow): PromoRule {
  return {
    code: row.code,
    label: row.label,
    percentOff: row.percent_off ?? undefined,
    freeShipping: row.free_shipping === 1,
    minSubtotalTsh: row.min_subtotal_tsh ?? undefined,
    active: row.active === 1 && !row.redeemed_at && !!row.expires_at && Date.parse(row.expires_at) > Date.now(),
    expiresAt: row.expires_at ?? undefined,
    redeemedAt: row.redeemed_at ?? undefined,
  };
}

/** Promo zote (pamoja na zilizozimwa — admin). */
export async function listPromoRules(): Promise<PromoRule[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM promo_codes ORDER BY code")
    .all() as unknown as PromoRow[];
  return rows.map(rowToRule);
}

export async function listAvailablePromoRules(): Promise<PromoRule[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM promo_codes WHERE active=1 AND redeemed_at IS NULL AND expires_at > ? ORDER BY code")
    .all(nowIso()) as unknown as PromoRow[];
  return rows.map(rowToRule);
}

/** Tathmini msimbo dhidi ya oda (DB ndio mwanzo wa ukweli). */
export async function applyPromoFromDb(
  rawCode: string,
  subtotalTsh: number,
): Promise<PromoResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a discount code." };

  const row = await getDb()
    .prepare("SELECT * FROM promo_codes WHERE code = ?")
    .get(code) as PromoRow | undefined;
  const rule = row ? rowToRule(row) : undefined;

  if (!rule || !rule.active || rule.redeemedAt || !rule.expiresAt || Date.parse(rule.expiresAt) <= Date.now()) {
    return { ok: false, reason: "This code is invalid or has expired." };
  }
  if (rule.minSubtotalTsh && subtotalTsh < rule.minSubtotalTsh) {
    return {
      ok: false,
      reason: `This code requires an order of at least TSh ${rule.minSubtotalTsh.toLocaleString("en-US")}.`,
    };
  }
  if (subtotalTsh <= 0) {
    return { ok: false, reason: "Your cart is empty." };
  }

  return {
    ok: true,
    code: rule.code,
    label: rule.label,
    freeShipping: !!rule.freeShipping,
    discountTsh: (sub, ship) => {
      const fromPercent = rule.percentOff
        ? Math.round((sub * rule.percentOff) / 100)
        : 0;
      const fromShipping = rule.freeShipping ? ship : 0;
      return fromPercent + fromShipping;
    },
  };
}

/* ============ Usimamizi (admin) ============ */

export async function createPromoRule(input: {
  code?: string;
  label?: string;
  percentOff?: number;
  freeShipping?: boolean;
  minSubtotalTsh?: number;
  expiresAt?: string;
}): Promise<PromoRule> {
  const code = (input.code ?? "").trim().toUpperCase();
  const label = (input.label ?? "").trim();
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) {
    throw new InputError("Code must be 3-24 characters and use only letters, numbers, underscores, or hyphens.");
  }
  if (label.length < 3) throw new InputError("Enter a short label for the code.");
  const percentOff = input.percentOff ? Math.floor(input.percentOff) : undefined;
  const minSubtotalTsh = input.minSubtotalTsh
    ? Math.floor(input.minSubtotalTsh)
    : undefined;
  if (percentOff != null && (percentOff < 1 || percentOff > 100)) {
    throw new InputError("Percentage must be between 1 and 100.");
  }
  if (!percentOff && !input.freeShipping) {
    throw new InputError("Enter a percentage discount or select free shipping.");
  }
  const expiresAt = input.expiresAt ? new Date(input.expiresAt).toISOString() : "";
  if (!expiresAt || Date.parse(expiresAt) <= Date.now()) {
    throw new InputError("Choose a future expiry date for this one-use code.");
  }

  const db = getDb();
  const exists = await db.prepare("SELECT 1 FROM promo_codes WHERE code = ?").get(code);
  if (exists) throw new InputError("This code already exists.", 409);

  await db.prepare(
    `INSERT INTO promo_codes (
      code, label, percent_off, free_shipping, min_subtotal_tsh, active, created_at, expires_at
     ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
  ).run(
    code,
    label,
    percentOff ?? null,
    input.freeShipping ? 1 : 0,
    minSubtotalTsh ?? null,
    nowIso(),
    expiresAt,
  );

  const row = await db
    .prepare("SELECT * FROM promo_codes WHERE code = ?")
    .get(code) as PromoRow;
  return rowToRule(row);
}

/** Enter/ondoa uzima wa msimbo (admin). */
export async function setPromoActive(code: string, active: boolean): Promise<PromoRule> {
  const key = code.trim().toUpperCase();
  const db = getDb();
  const result = await db
    .prepare(`UPDATE promo_codes SET active = ? WHERE code = ?
      AND (? = 0 OR (redeemed_at IS NULL AND expires_at > ?))`)
    .run(active ? 1 : 0, key, active ? 1 : 0, nowIso());
  if (result.changes === 0) throw new InputError("Code not found.", 404);
  const row = await db
    .prepare("SELECT * FROM promo_codes WHERE code = ?")
    .get(key) as PromoRow;
  return rowToRule(row);
}
