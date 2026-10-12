"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { type Order, type OrderStatus } from "@/lib/orders";
import { apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

export const ORDERS_KEY = "niffer.orders.v1";

/**
 * Oda za kifaa hiki (localStorage) — huhifadhi oda ulizoweka wewe mwenyewe
 * ili zionekane mara moja bila kusubiri mtandao. Oda za server zinaingia
 * kupitia `useAdminOrders` / `useOrderLookup`.
 */
const ordersStore = createLocalStore<Order[]>(ORDERS_KEY, []);

/** Oda zote za kifaa hiki. */
export function listOrders(): Order[] {
  return ordersStore.get();
}

/** Hifadhi oda (kumbuka ya ndani baada ya server kuidhinisha). */
export function pushOrder(order: Order) {
  const rest = ordersStore.get().filter((o) => o.code !== order.code);
  ordersStore.set([order, ...rest].slice(0, 50));
}

/** Weka oda kwenye kifaa (bila kugusa server — tumia `patchOrderStatus`). */
export function cacheOrders(next: Order[]) {
  ordersStore.set(next.slice(0, 50));
}

/** Hook: oda za kifaa hiki (live). */
export function useOrders(): Order[] {
  return useSyncExternalStore(
    ordersStore.subscribe,
    ordersStore.get,
    ordersStore.getServer,
  );
}

/* ============ Backend ============ */

export type CreateOrderPayload = {
  customer: {
    name: string;
    phone: string;
    region: string;
    city?: string;
    street?: string;
    address: string;
    note?: string;
    email?: string;
  };
  payment: string;
  lines: { slug: string; qty: number }[];
  promoCode?: string;
  giftCardCode?: string;
};

/** Weka oda mpya kwenye server. Hurusha `ApiError` kama kuna hitilafu. */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<{ order: Order; stock: Record<string, number> }> {
  const data = await apiPost<{
    ok: boolean;
    order: Order;
    stock: Record<string, number>;
  }>("/api/orders", payload);
  return { order: data.order, stock: data.stock };
}

/** Oda moja kutoka server. */
export async function fetchOrder(code: string): Promise<Order | undefined> {
  const key = code.trim().toUpperCase();
  if (!key) return undefined;
  // Kwanza ramani ya ndani (haraka), kisha server.
  const local = ordersStore.get().find((o) => o.code.toUpperCase() === key);
  if (local) return local;

  try {
    const data = await apiGet<{ ok: boolean; order: Order }>(
      `/api/orders/${encodeURIComponent(key)}`,
    );
    return data.order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

/** Oda zote za server (admin). */
export async function fetchAllOrders(): Promise<Order[]> {
  const data = await apiGet<{ ok: boolean; orders: Order[] }>("/api/orders");
  return data.orders;
}

/** Badilisha hatua ya oda kwenye server (admin). */
export async function patchOrderStatus(
  code: string,
  status: OrderStatus,
): Promise<Order> {
  const data = await apiPatch<{ ok: boolean; order: Order }>(
    `/api/orders/${encodeURIComponent(code)}`,
    { status },
  );
  // Sasisha kumbuka ya ndani ikiwa oda hii ipo hapa.
  const local = ordersStore.get();
  if (local.some((o) => o.code === code)) {
    ordersStore.set(
      local.map((o) => (o.code === code ? { ...o, status } : o)),
    );
  }
  return data.order;
}

/* ============ Hooks ============ */

/** Oda zote za server (admin) — zinasasishwa kila dakika 30. */
export function useAdminOrders(): {
  orders: Order[];
  loading: boolean;
  error: string;
  refresh: () => void;
} {
  const resource = useAsync<Order[]>("orders", fetchAllOrders, {
    intervalMs: 30_000,
  });
  return {
    orders: resource.data ?? [],
    loading: resource.loading,
    error: resource.error,
    refresh: resource.refresh,
  };
}

/** Oda moja (server) — inatumika kwenye ukurasa wa maelezo ya oda. */
export function useOrderLookup(code: string): {
  order: Order | undefined;
  loading: boolean;
  error: string;
} {
  const key = code.trim().toUpperCase();
  const resource = useAsync<Order | undefined>(`order:${key}`, async () =>
    fetchOrder(key),
  );
  return {
    order: resource.data ?? undefined,
    loading: key ? resource.loading : false,
    error: resource.error,
  };
}
