/**
 * Helper functions za kuformat — zinatumika pande zote (server na client).
 * Usiweke "use client" hapa: formatTsh n.k. zinahitajika na Server Components.
 */

/** Ama usome/uandike localStorage kwa usalama (SSR, private mode, etc.). */
export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — puuza */
  }
}

/** Nambari fupi ya oda, mfano "NCF-8F3K". */
export function makeOrderCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `NCF-${out}`;
}

/** TSh 32,000 */
export function formatTsh(amount: number): string {
  return `TSh ${new Intl.NumberFormat("en-US").format(amount)}`;
}

/** Punguzo la 20% — au null kama hakuna compare-at price. */
export function discountPercent(
  priceTsh: number,
  compareAtTsh?: number,
): number | null {
  if (!compareAtTsh || compareAtTsh <= priceTsh) return null;
  return Math.round((1 - priceTsh / compareAtTsh) * 100);
}

/** 255754000000 → 0754 000 000 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^255/, "0");
  // Muundo wa simu za Tanzania: 0754 000 000 (4-3-3).
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}
