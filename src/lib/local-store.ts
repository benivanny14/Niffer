import { readStorage, writeStorage } from "@/lib/format";

/**
 * LocalStorage-backed external store (angalia store.tsx).
 * Hutumwa na useSyncExternalStore — SSR hutumia `getServer`
 * (hali safi), client hupakia data baada ya hydration bila setState
 * ndani ya effect. Pia husikia mabadiliko kutoka tab nyingine.
 */
export function createLocalStore<T>(key: string, initial: T) {
  let snapshot: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load(): T {
    if (!loaded) {
      snapshot = readStorage<T>(key, initial);
      loaded = true;
    }
    return snapshot;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          snapshot = readStorage<T>(key, initial);
          listener();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    get(): T {
      return load();
    },
    getServer(): T {
      return initial;
    },
    set(next: T) {
      snapshot = next;
      loaded = true;
      writeStorage(key, next);
      listeners.forEach((l) => l());
    },
    /** Read upya kutoka localStorage (kwa admin/refresh). */
    reload() {
      loaded = false;
      load();
      listeners.forEach((l) => l());
    },
  };
}
