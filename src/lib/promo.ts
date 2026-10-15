/**
 * Mfumo wa msimbo wa punguzo (promo/coupon).
 * Sheria ni rahisi na zinaweza kubadilishwa hapa. Backend halisi
 * itakapokuwa, tuta-validate kwenye server badala ya client hii.
 */

export type PromoRule = {
  code: string;
  label: string;
  /** Discount ya asilimia (0–100) kwa jumla ndogo. */
  percentOff?: number;
  /** Free delivery (Dar es Salaam na mikoa). */
  freeShipping?: boolean;
  /** Kiwango cha chini cha jumla ndogo ili msimbo utumike. */
  minSubtotalTsh?: number;
  expiresAt?: string;
  redeemedAt?: string;
  active: boolean;
};

export const promoCodes: PromoRule[] = [
  {
    code: "NIFFER10",
    label: "10% off",
    percentOff: 10,
    active: true,
  },
  {
    code: "BURE2026",
    label: "Free delivery",
    freeShipping: true,
    active: true,
  },
  {
    code: "KARIBU15",
    label: "15% off orders from TSh 40,000",
    percentOff: 15,
    minSubtotalTsh: 40000,
    active: true,
  },
];

export type PromoApplied = {
  ok: true;
  code: string;
  label: string;
  freeShipping: boolean;
  /** Kiwango cha punguzo kwa jumla ndogo na usafirishaji. */
  discountTsh: (subtotalTsh: number, shippingTsh: number) => number;
};

export type PromoResult = PromoApplied | { ok: false; reason: string };

/** Tathmini msimbo wa punguzo dhidi ya oda ya sasa. */
export function applyPromo(
  rawCode: string,
  subtotalTsh: number,
): PromoResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a discount code." };

  const rule = promoCodes.find((r) => r.code === code);
  if (!rule || !rule.active) {
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
