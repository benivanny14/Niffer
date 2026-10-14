/**
 * Wholesale pricing (wholesale / bulk pricing) — model kama Alibaba MOQ tiers.
 * Ritimu moja inatumika na ukurasa wa /jumla, kikokotoo cha portali na API.
 */

export type BulkTier = {
  min: number;
  max: number | null;
  discount: number; // asilimia
  label: string;
};

export const bulkTiers: BulkTier[] = [
  { min: 10, max: 24, discount: 10, label: "Wholesale Tier 1" },
  { min: 25, max: 49, discount: 15, label: "Wholesale Tier 2" },
  { min: 50, max: null, discount: 22, label: "Wholesale Tier 3" },
];

/** Tier linalofaa kwa wingi ulioingiza (null = bado bei ya rejareja). */
export function tierFor(qty: number): BulkTier | null {
  if (!Number.isFinite(qty) || qty <= 0) return null;
  let match: BulkTier | null = null;
  for (const tier of bulkTiers) {
    if (qty >= tier.min) match = tier;
  }
  return match;
}

/** Bei ya unit kwa wingi (jumla), ikiwa imezungushwa hadi TSh 100. */
export function bulkUnitPrice(priceTsh: number, qty: number): number {
  const tier = tierFor(qty);
  if (!tier) return priceTsh;
  const discounted = priceTsh * (1 - tier.discount / 100);
  return Math.round(discounted / 100) * 100;
}

/** Total kwa wingi. */
export function bulkTotal(priceTsh: number, qty: number): number {
  return bulkUnitPrice(priceTsh, qty) * Math.max(0, Math.floor(qty));
}

/** Kiwango cha kuokolewa ukilinganisha na bei ya rejareja. */
export function bulkSavings(priceTsh: number, qty: number): number {
  return priceTsh * Math.max(0, Math.floor(qty)) - bulkTotal(priceTsh, qty);
}
