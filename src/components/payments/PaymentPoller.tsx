"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { formatTsh } from "@/lib/format";
import type { Order } from "@/lib/orders";

type StatusResponse = {
  ok: boolean;
  status?: "pending" | "paid" | "failed";
  order?: Order;
  error?: string;
};

/**
 * Inasubiri muamala wa malipo ukimalize (kila sekunde 3) kisha inaongoza
 * kwenye ukurasa wa mafanikio au mgumu.
 */
export function PaymentPoller({ reference }: { reference: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [tries, setTries] = useState(0);
  const stopped = useRef(false);

  useEffect(() => {
    stopped.current = false;
    let timer: number | undefined;

    async function check() {
      if (stopped.current) return;
      try {
        const data = await apiGet<StatusResponse>(
          `/api/payments/status?reference=${encodeURIComponent(reference)}`,
          { timeoutMs: 8000 },
        );
        if (stopped.current) return;
        if (data.order) setOrder(data.order);
        if (data.status === "paid") {
          stopped.current = true;
          router.replace(
            `/malipo/amefanikiwa?reference=${encodeURIComponent(reference)}`,
          );
          return;
        }
        if (data.status === "failed") {
          stopped.current = true;
          router.replace(
            `/malipo/imeshindikana?reference=${encodeURIComponent(reference)}`,
          );
          return;
        }
      } catch {
        /* jaribu tena */
      }
      setTries((t) => t + 1);
      timer = window.setTimeout(check, 3000);
    }

    timer = window.setTimeout(check, 1500);
    return () => {
      stopped.current = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [reference, router]);

  const givingUp = tries > 60;

  return (
    <div className="card p-8 text-center">
      <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-cream-300 border-t-brand-700" />
      <h2 className="mt-5 font-display text-2xl text-ink-900">
        Tunasubiri uthibitisho wa malipo…
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        Nambari ya oda:{" "}
        <span className="font-semibold text-ink-900">{reference}</span>
        {order ? ` · ${formatTsh(order.totalTsh)}` : ""} — usifunge ukurasa huu.
      </p>

      {givingUp ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-ink-500">
            Bado hatujapata uthibitisho. Oda yako imehifadhiwa — unaweza
            kufuatilia hali yake kwenye ukurasa wa oda au kupiga simu kwetu.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-outline"
            >
              Jaribu tena
            </button>
            <a href={`/odha/${reference}`} className="btn-primary">
              Angalia oda yako
            </a>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-ink-400">
          {error || "Inathibitisha kila baada ya sekunde 3…"}
        </p>
      )}
    </div>
  );
}
