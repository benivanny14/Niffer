import type { Product } from "@/lib/data/catalog";

/**
 * Vichujio vya katalogi — ritimu safi inayoshirikiwa na ukurasa wa /bidhaa,
 * API ya `/api/products` na majaribio. Mtindo wa jiji.com: mkoa → mji,
 * pamoja na bei, aina na upangaji.
 */

export type SortKey = "maarufu" | "mpya" | "bei-chini" | "bei-juu" | "ukadiriaji";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "maarufu", label: "Maarufu zaidi" },
  { value: "mpya", label: "Mpya kwanza" },
  { value: "bei-chini", label: "Bei ndogo kwanza" },
  { value: "bei-juu", label: "Bei kubwa kwanza" },
  { value: "ukadiriaji", label: "Ukadiriaji bora" },
];

export type ProductFilters = {
  category?: string | null;
  /** Kipengele: mpya | punguzo | inayoisha */
  feature?: string | null;
  region?: string | null;
  city?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  /** Utafutaji wa maandishi (jina/maelezo). */
  query?: string | null;
  sort?: SortKey;
};

export type ProductFilterCounts = {
  category: Record<string, number>;
  region: Record<string, number>;
  city: Record<string, number>;
};

const SORTS: SortKey[] = ["maarufu", "mpya", "bei-chini", "bei-juu", "ukadiriaji"];

export function isSortKey(value: string | undefined | null): value is SortKey {
  return !!value && (SORTS as string[]).includes(value);
}

function matchesQuery(product: Product, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = `${product.name} ${product.category} ${product.shortDescription} ${product.description} ${product.ingredients}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Chuja bidhaa kulingana na vichujio vyote (kategoria, eneo, bei, utafutaji). */
export function filterProducts(
  items: Product[],
  filters: ProductFilters = {},
): Product[] {
  const min = filters.minPrice ?? null;
  const max = filters.maxPrice ?? null;

  const filtered = items.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.feature === "mpya" && !product.badges.includes("new")) {
      return false;
    }
    if (filters.feature === "punguzo" && !product.badges.includes("sale")) {
      return false;
    }
    if (
      filters.feature === "inayoisha" &&
      !(product.badges.includes("low-stock") || product.stock <= 5)
    ) {
      return false;
    }
    if (filters.region && product.region !== filters.region) return false;
    // Mji huwekwa kama tu mkoa umechaguliwa (mji upo ndani ya mkoa).
    if (filters.city && product.city !== filters.city) return false;
    if (min !== null && product.priceTsh < min) return false;
    if (max !== null && product.priceTsh > max) return false;
    if (filters.query && !matchesQuery(product, filters.query)) return false;
    return true;
  });

  return sortProducts(filtered, filters.sort ?? "maarufu", filters.feature);
}

/** Panga bidhaa — "mpya" huweka bidhaa mpya juu kabla ya kupanga kwa maarufu. */
export function sortProducts(
  items: Product[],
  sort: SortKey = "maarufu",
  feature?: string | null,
): Product[] {
  const list = [...items];
  switch (sort) {
    case "bei-chini":
      list.sort((a, b) => a.priceTsh - b.priceTsh);
      break;
    case "bei-juu":
      list.sort((a, b) => b.priceTsh - a.priceTsh);
      break;
    case "ukadiriaji":
      list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "mpya":
      list.sort((a, b) => Number(hasNew(b)) - Number(hasNew(a)) || b.reviewCount - a.reviewCount);
      break;
    case "maarufu":
    default:
      list.sort((a, b) => {
        // Kipengele "mpya" huweka bidhaa mpya juu; kisha maarufu (bestseller)
        // na idadi ya hakiki ndio wanayoamua.
        if (feature === "mpya") {
          const fresh = Number(hasNew(b)) - Number(hasNew(a));
          if (fresh !== 0) return fresh;
        }
        const best = Number(hasBest(b)) - Number(hasBest(a));
        if (best !== 0) return best;
        return b.reviewCount - a.reviewCount;
      });
      break;
  }
  return list;
}

const hasNew = (p: Product) => p.badges.includes("new");
const hasBest = (p: Product) => p.badges.includes("bestseller");

/**
 * Idadi kwa kila kichujio (chips zenye hesabu kama jiji.com).
 * Hesabu zinatokana na kuchuja na vichujio vingine ISIPUWA kichujio kinachohesabiwa.
 */
export function filterCounts(
  items: Product[],
  filters: ProductFilters = {},
): ProductFilterCounts {
  const counts: ProductFilterCounts = {
    category: {},
    region: {},
    city: {},
  };
  for (const product of items) {
    counts.category[product.category] =
      (counts.category[product.category] ?? 0) + 1;
    const region = product.region ?? "";
    const city = product.city ?? "";
    if (region) counts.region[region] = (counts.region[region] ?? 0) + 1;
    if (city) counts.city[city] = (counts.city[city] ?? 0) + 1;
  }
  // Punguza hesabu kwa vichujio vingine (isipokuwa kichujio kinachohesabiwa).
  const without = (omit: keyof ProductFilters) =>
    filterProducts(items, { ...filters, [omit]: undefined });

  if (filters.category) {
    counts.category = tally(without("category"), (p) => p.category);
  }
  if (filters.region || filters.city) {
    counts.region = tally(without("region"), (p) => p.region ?? "");
    counts.city = tally(without("city"), (p) => p.city ?? "");
    // Mji: onyesha tu miji ya mkoa uliochaguliwa.
    if (filters.region) {
      for (const city of Object.keys(counts.city)) {
        const product = items.find(
          (p) => p.city === city && p.region === filters.region,
        );
        if (!product) delete counts.city[city];
      }
    }
  }
  delete counts.city[""];
  delete counts.region[""];
  return counts;
}

function tally(
  items: Product[],
  key: (product: Product) => string,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const product of items) {
    const k = key(product);
    if (!k) continue;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Tofauti ya bei (kwa vichujio vya bei vya haraka). */
export const priceRanges: { value: string; label: string; min: number; max: number | null }[] = [
  { value: "chini-20", label: "Chini ya TSh 20,000", min: 0, max: 19_999 },
  { value: "20-40", label: "TSh 20,000 – 40,000", min: 20_000, max: 40_000 },
  { value: "juu-40", label: "Zaidi ya TSh 40,000", min: 40_001, max: null },
];

/** Tafsiri thamani ya kipande cha bei kuwa min/max. */
export function parsePriceRange(
  value: string | null | undefined,
): { min: number | null; max: number | null } {
  const range = priceRanges.find((r) => r.value === value);
  if (!range) return { min: null, max: null };
  return { min: range.min, max: range.max };
}
