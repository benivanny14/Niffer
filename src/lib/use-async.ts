"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Resource ya backend inayopakuliwa kwa `key` (mfano: nambari ya oda).
 *
 * `setState` hufanyika ndani ya callbacks za promise pekee (si moja kwa moja
 * ndani ya effect) — kanuni ya React 19 na lint ya mradi huu.
 */
export type AsyncResource<T> = {
  data: T | null;
  loading: boolean;
  error: string;
  refresh: () => void;
};

type Options = {
  /** Subiri hivi kabla ya kwanza (deboi kwa utafutaji). */
  delayMs?: number;
  /** Pakia upya mara kwa mara (dashboard). */
  intervalMs?: number;
};

export function useAsync<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: Options = {},
): AsyncResource<T> {
  const { delayMs = 0, intervalMs } = options;
  const fetcherRef = useRef(fetcher);

  // Sasisha ref baada ya kila render (si wakati wa render).
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const [state, setState] = useState<{
    key: string;
    data: T | null;
    error: string;
  } | null>(null);

  const run = useCallback(() => {
    fetcherRef
      .current()
      .then((data) => setState({ key, data, error: "" }))
      .catch((error: unknown) =>
        setState({
          key,
          data: null,
          error:
            error instanceof Error && error.message
              ? error.message
              : "Hitilafu imetokea. Jaribu tena.",
        }),
      );
  }, [key]);

  useEffect(() => {
    const timer = window.setTimeout(run, delayMs);
    const interval = intervalMs
      ? window.setInterval(run, intervalMs)
      : undefined;
    return () => {
      window.clearTimeout(timer);
      if (interval) window.clearInterval(interval);
    };
  }, [run, delayMs, intervalMs]);

  const fresh = state !== null && state.key === key;

  return {
    data: fresh ? state.data : null,
    loading: !fresh,
    error: fresh ? state.error : "",
    refresh: run,
  };
}
