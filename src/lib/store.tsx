"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type Product } from "@/lib/data/catalog";
import { createLocalStore } from "@/lib/local-store";
import { applyServerStock, getStock } from "@/lib/stock";
import {
  applyServerProducts,
  getProduct,
  productsStore,
} from "@/lib/catalog-client";
import { apiGet } from "@/lib/api";

const CART_KEY = "niffer.cart.v1";
const WISHLIST_KEY = "niffer.wishlist.v1";

export type CartItem = { slug: string; qty: number };

const cartStore = createLocalStore<CartItem[]>(CART_KEY, []);
const wishlistStore = createLocalStore<string[]>(WISHLIST_KEY, []);

/** Ongeza bidhaa kwenye upendwa (kutoka akaunti — merge). */
export function mergeWishlist(slugs: string[]) {
  const prev = wishlistStore.get();
  const merged = Array.from(new Set([...prev, ...slugs]));
  wishlistStore.set(merged);
}

/** `ready`: false kwenye server/first paint, true baada ya hydration. */
const subscribeNoop = () => () => {};
const getClientReady = () => true;
const getServerReady = () => false;

type StoreValue = {
  items: CartItem[];
  count: number;
  subtotalTsh: number;
  lines: { product: Product; qty: number }[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  inWishlist: (slug: string) => boolean;
  toggleWishlist: (slug: string) => void;
  wishlist: string[];
  ready: boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.get,
    cartStore.getServer,
  );
  const wishlist = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.get,
    wishlistStore.getServer,
  );
  const ready = useSyncExternalStore(
    subscribeNoop,
    getClientReady,
    getServerReady,
  );
  // Bidhaa za DB (admin) — zinabadilisha bei/jina mara tu zikipakuliwa.
  const serverProducts = useSyncExternalStore(
    productsStore.subscribe,
    productsStore.getSnapshot,
    productsStore.getServerSnapshot,
  );

  // Pakia stoo na katalogi halisi kutoka backend mara tu duka likifunguliwa.
  useEffect(() => {
    let alive = true;
    apiGet<{ ok: boolean; stock: Record<string, number> }>("/api/stock")
      .then((data) => {
        if (alive && data?.stock) applyServerStock(data.stock);
      })
      .catch(() => {
        /* server hai / mtandao — tumia stoo ya ndani */
      });
    apiGet<{ ok: boolean; products: Product[] }>("/api/products")
      .then((data) => {
        if (alive && Array.isArray(data?.products) && data.products.length > 0) {
          applyServerProducts(data.products);
        }
      })
      .catch(() => {
        /* fallback: katalogi ya ndani */
      });
    return () => {
      alive = false;
    };
  }, []);

  const add = useCallback((slug: string, qty = 1) => {
    // Zuzuia kuongeza zaidi ya stoo halisi iliyopo.
    const cap = Math.max(getStock(slug), 0);
    if (cap <= 0) return;
    const prev = cartStore.get();
    const found = prev.find((i) => i.slug === slug);
    if (found) {
      cartStore.set(
        prev.map((i) =>
          i.slug === slug
            ? { ...i, qty: Math.min(i.qty + qty, cap, 99) }
            : i,
        ),
      );
    } else {
      cartStore.set([...prev, { slug, qty: Math.min(qty, cap, 99) }]);
    }
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    const cap = Math.max(getStock(slug), 0);
    const prev = cartStore.get();
    if (qty <= 0) {
      cartStore.set(prev.filter((i) => i.slug !== slug));
      return;
    }
    cartStore.set(
      prev.map((i) =>
        i.slug === slug ? { ...i, qty: Math.min(qty, cap, 99) } : i,
      ),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    cartStore.set(cartStore.get().filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => cartStore.set([]), []);

  const toggleWishlist = useCallback((slug: string) => {
    const prev = wishlistStore.get();
    wishlistStore.set(
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const inWishlist = useCallback(
    (slug: string) => wishlist.includes(slug),
    [wishlist],
  );

  const lines = useMemo(() => {
    // `serverProducts` inahakikisha bei/jina jipya la DB linapotumika.
    const catalog = serverProducts;
    return items
      .map((i) => {
        const product =
          catalog?.find((p) => p.slug === i.slug) ?? getProduct(i.slug);
        return product ? { product, qty: i.qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => x !== null);
  }, [items, serverProducts]);

  const subtotalTsh = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.priceTsh * l.qty, 0),
    [lines],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  const value: StoreValue = {
    items,
    lines,
    count,
    subtotalTsh,
    add,
    setQty,
    remove,
    clear,
    inWishlist,
    toggleWishlist,
    wishlist,
    ready,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore lazima itumike ndani ya <StoreProvider>");
  return ctx;
}
