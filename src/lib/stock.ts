"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { products, type Product } from "@/lib/data/catalog";

/**
 * Mfumo wa stoo wa moja kwa moja (live).
 *
 * Stoo ya kila bidhaa = marekebisho ya admin (localStorage) YAKIWA
 * hayapo, thamani ya catalog. Admin hubadilisha stoo kwenye /admin na
 * badiliko linaonekana mara moja kwenye duka lote (ProductCard, BuyBox,
 * kikapu, checkout). Unaponunua, stoo hupungua moja kwa moja.
 */
const STOCK_KEY = "niffer.stock.v1";
const stockStore = createLocalStore<Record<string, number>>(STOCK_KEY, {});

/** Stoo halisi ya bidhaa (marekebisho ya admin au catalog). */
export function getStock(slug: string): number {
  const override = stockStore.get()[slug];
  if (typeof override === "number") return Math.max(0, override);
  return products.find((p) => p.slug === slug)?.stock ?? 0;
}

/** Hook: stoo halisi ya bidhaa moja (live). */
export function useStock(slug: string): number {
  const overrides = useSyncExternalStore(
    stockStore.subscribe,
    stockStore.get,
    stockStore.getServer,
  );
  const override = overrides[slug];
  if (typeof override === "number") return Math.max(0, override);
  return products.find((p) => p.slug === slug)?.stock ?? 0;
}

/** Hook: marekebisho yote (kwa admin). */
export function useStockOverrides(): Record<string, number> {
  return useSyncExternalStore(
    stockStore.subscribe,
    stockStore.get,
    stockStore.getServer,
  );
}

/** Weka stoo (admin). */
export function setStock(slug: string, qty: number) {
  stockStore.set({ ...stockStore.get(), [slug]: Math.max(0, qty) });
}

/**
 * Pakia stoo kutoka kwenye API (server ndio mwanzo wa ukweli).
 * Hutumika baada ya checkout, kufungua duka na marekebisho ya admin.
 */
export function applyServerStock(next: Record<string, number>) {
  const current = stockStore.get();
  const merged: Record<string, number> = { ...current };
  for (const [slug, qty] of Object.entries(next)) {
    merged[slug] = Math.max(0, Math.floor(qty));
  }
  stockStore.set(merged);
}

/** Punguza stoo (unaponunua). Hauwezi kupungua chini ya sifuri. */
export function decrementStock(lines: { slug: string; qty: number }[]) {
  const next = { ...stockStore.get() };
  for (const line of lines) {
    const current = getStock(line.slug);
    next[line.slug] = Math.max(0, current - line.qty);
  }
  stockStore.set(next);
}

/** Stoo zote zilizosalia, kwa orodha ya bidhaa (admin/dropship). */
export function availableStock(product: Product): number {
  return getStock(product.slug);
}
