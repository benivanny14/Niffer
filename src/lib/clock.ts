"use client";

import { useSyncExternalStore } from "react";

/**
 * Saa ya client inayosasishwa kila sekunde — bila setState ndani ya
 * effect (lint: react-hooks/set-state-in-effect). SSR hutumia 0,
 * client hubadilika baada ya hydration.
 */
let currentTime = 0;
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!interval) {
    // Kwanza mara hii — kwenye browser tu (baada ya hydration).
    currentTime = Date.now();
    interval = setInterval(() => {
      currentTime = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval) {
      clearInterval(interval);
      interval = null;
    }
  };
}

function getSnapshot() {
  return currentTime;
}

function getServerSnapshot() {
  return 0;
}

/** Muda wa sasa (Date.now()) unaosasishwa kila sekunde; 0 kwenye server. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
