"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { demoOrders, type Order } from "@/lib/orders";

export const ORDERS_KEY = "niffer.orders.v1";

const ordersStore = createLocalStore<Order[]>(ORDERS_KEY, []);

/** Oda zote za kifaa hiki (kutoka localStorage). */
export function listOrders(): Order[] {
  return ordersStore.get();
}

/** Hifadhi oda mpya (mpya kwanza). */
export function pushOrder(order: Order) {
  ordersStore.set([order, ...ordersStore.get()].slice(0, 50));
}

/** Badilisha hatua ya oda (admin/demo). */
export function setOrderStatus(code: string, status: Order["status"]) {
  const next = ordersStore.get().map((o) =>
    o.code === code
      ? {
          ...o,
          status,
          history: [
            ...(o.history ?? []),
            { status, at: new Date().toISOString() },
          ],
        }
      : o,
  );
  ordersStore.set(next);
}

/** Oda moja kwa nambari — kwanza halisi, kisha demo. */
export function findOrder(code: string): Order | undefined {
  const c = code.trim().toLowerCase();
  return (
    ordersStore.get().find((o) => o.code.toLowerCase() === c) ??
    demoOrders().find((o) => o.code.toLowerCase() === c)
  );
}

/** Hook: oda za kifaa hiki (live — husasishwa moja kwa moja). */
export function useOrders(): Order[] {
  return useSyncExternalStore(
    ordersStore.subscribe,
    ordersStore.get,
    ordersStore.getServer,
  );
}

/** Hook: oda moja (live). */
export function useOrder(code: string): Order | undefined {
  const all = useOrders();
  const c = code.trim().toLowerCase();
  return all.find((o) => o.code.toLowerCase() === c);
}
