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
};

function rowToRule(row: PromoRow): PromoRule {
  return {
    code: row.code,
    label: row.label,
    percentOff: row.percent_off ?? undefined,
    freeShipping: row.free_shipping === 1,
    minSubtotalTsh: row.min_subtotal_tsh ?? undefined,
    active: row.active === 1,
  };
}

/** Promo zote (pamoja na zilizozimwa — admin). */
export function listPromoRules(): PromoRule[] {
  const rows = getDb()
    .prepare("SELECT * FROM promo_codes ORDER BY code")
    .all() as unknown as PromoRow[];
  return rows.map(rowToRule);
}

/** Tathmini msimbo dhidi ya oda (DB ndio mwanzo wa ukweli). */
export function applyPromoFromDb(
  rawCode: string,
  subtotalTsh: number,
): PromoResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Weka msimbo wa punguzo." };

  const row = getDb()
    .prepare("SELECT * FROM promo_codes WHERE code = ?")
    .get(code) as PromoRow | undefined;
  const rule = row ? rowToRule(row) : undefined;

  if (!rule || !rule.active) {
    return { ok: false, reason: "Msimbo huo si sahihi au umeisha muda." };
  }
  if (rule.minSubtotalTsh && subtotalTsh < rule.minSubtotalTsh) {
    return {
      ok: false,
      reason: `Msimbo huu unahitaji oda ya angalau TSh ${rule.minSubtotalTsh.toLocaleString("en-US")}.`,
    };
  }
  if (subtotalTsh <= 0) {
    return { ok: false, reason: "Kikapu chako ni tupu." };
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

export function createPromoRule(input: {
  code?: string;
  label?: string;
  percentOff?: number;
  freeShipping?: boolean;
  minSubtotalTsh?: number;
}): PromoRule {
  const code = (input.code ?? "").trim().toUpperCase();
  const label = (input.label ?? "").trim();
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) {
    throw new InputError("Msimbo wa (herufi 3–24: A-Z, 0–9, _ , -).");
  }
  if (label.length < 3) throw new InputError("Eleza msimbo (label) fupi.");
  const percentOff = input.percentOff ? Math.floor(input.percentOff) : undefined;
  const minSubtotalTsh = input.minSubtotalTsh
    ? Math.floor(input.minSubtotalTsh)
    : undefined;
  if (percentOff != null && (percentOff < 1 || percentOff > 100)) {
    throw new InputError("Asilimia lazima iwe kati ya 1 na 100.");
  }
  if (!percentOff && !input.freeShipping) {
    throw new InputError("Weka punguzo la asilimia au usafirishaji bure.");
  }

  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM promo_codes WHERE code = ?").get(code);
  if (exists) throw new InputError("Msimbo huo tayari upo.", 409);

  db.prepare(
    `INSERT INTO promo_codes (
       code, label, percent_off, free_shipping, min_subtotal_tsh, active, created_at
     ) VALUES (?, ?, ?, ?, ?, 1, ?)`,
  ).run(
    code,
    label,
    percentOff ?? null,
    input.freeShipping ? 1 : 0,
    minSubtotalTsh ?? null,
    nowIso(),
  );

  const row = db
    .prepare("SELECT * FROM promo_codes WHERE code = ?")
    .get(code) as PromoRow;
  return rowToRule(row);
}

/** Weka/ondoa uzima wa msimbo (admin). */
export function setPromoActive(code: string, active: boolean): PromoRule {
  const key = code.trim().toUpperCase();
  const db = getDb();
  const result = db
    .prepare("UPDATE promo_codes SET active = ? WHERE code = ?")
    .run(active ? 1 : 0, key);
  if (result.changes === 0) throw new InputError("Msimbo haupatikani.", 404);
  const row = db
    .prepare("SELECT * FROM promo_codes WHERE code = ?")
    .get(key) as PromoRow;
  return rowToRule(row);
}
