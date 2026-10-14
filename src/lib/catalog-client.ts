"use client";

import {
  getProductBySlug,
  products as staticProducts,
  type Product,
} from "@/lib/data/catalog";

/**
 * Katalogi kwa client — bidhaa za server (DB, zilizohaririwa na admin)
 * zinapakuliwa mara duka likifunguliwa; fallback ni katalogi ya ndani.
 */

type Listener = () => void;

let hydrated: Product[] | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

/** Pakia bidhaa kutoka `/api/products` (server ndio mwanzo wa ukweli). */
export function applyServerProducts(next: Product[]) {
  hydrated = next;
  emit();
}

/** Store ya bidhaa kwa `useSyncExternalStore`. */
export const productsStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => hydrated,
  getServerSnapshot: (): Product[] | null => null,
};

/** Bidhaa kwa slug — ya DB (ikiwa imepakuliwa) au ya katalogi ya ndani. */
export function getProduct(slug: string): Product | undefined {
  return hydrated?.find((p) => p.slug === slug) ?? getProductBySlug(slug);
}

/** All products — DB (ikiwa ipo) au katalogi ya ndani. */
export function catalogProducts(): Product[] {
  return hydrated ?? staticProducts;
}
