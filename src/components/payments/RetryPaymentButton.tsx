"use client";

import { useState } from "react";
import { apiPost, errorMessage } from "@/lib/api";

/** Jaribu malipo upya kwa oda isiyolipwa. */
export function RetryPaymentButton({ reference }: { reference: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function retry() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await apiPost<{
        ok: boolean;
        payment?: { redirectUrl?: string };
      }>("/api/payments/start", { reference });
      if (data.payment?.redirectUrl) {
        window.location.href = data.payment.redirectUrl;
        return;
      }
      // Malipo ya kawaida (COD) — rudi kwenye oda.
      window.location.href = `/odha/${reference}`;
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => void retry()}
        disabled={busy}
        className="btn-outline disabled:opacity-60"
      >
        {busy ? "Inafungua…" : "Jaribu malipo tena"}
      </button>
      {error ? <span className="text-xs text-danger-600">{error}</span> : null}
    </span>
  );
}
