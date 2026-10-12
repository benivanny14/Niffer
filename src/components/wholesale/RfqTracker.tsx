"use client";

import { useState } from "react";
import { formatTsh } from "@/lib/format";
import { apiGet, errorMessage } from "@/lib/api";
import { tierFor } from "@/lib/wholesale";
import { SearchIcon } from "@/components/ui/icons";

const field =
  "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

type Rfq = {
  code: string;
  business: string;
  name: string;
  phone: string;
  region: string;
  productName: string;
  qty: number;
  status: "new" | "reviewed" | "quoted" | "accepted" | "declined";
  quoteTsh: number | null;
  unitQuoteTsh: number | null;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<Rfq["status"], string> = {
  new: "Imepokelewa",
  reviewed: "Inapitiwa",
  quoted: "Bei yamewekwa",
  accepted: "Imekubalika",
  declined: "Imekataliwa",
};

const statusStyles: Record<Rfq["status"], string> = {
  new: "bg-cream-100 text-ink-500",
  reviewed: "bg-warning-100 text-warning-600",
  quoted: "bg-brand-100 text-accent",
  accepted: "bg-success-100 text-success-600",
  declined: "bg-danger-100 text-danger-600",
};

const STATUS_FLOW: Rfq["status"][] = [
  "new",
  "reviewed",
  "quoted",
  "accepted",
];

/** Portali ya jumla: tafuta ombi lako la RFQ kwa namba ya simu. */
export function RfqTracker() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!/^[0-9+\s]{9,15}$/.test(phone.trim())) {
      setError("Weka namba sahihi ya simu (mfano 0754 000 000).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await apiGet<{ ok: boolean; rfqs: Rfq[] }>(
        `/api/rfq?phone=${encodeURIComponent(phone.trim())}`,
      );
      setRfqs(res.rfqs);
      setSearched(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={search} className="card flex flex-col gap-3 p-6 sm:flex-row">
        <label className="flex-1 text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Namba ya simu ya biashara *
          </span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={field}
            placeholder="0754 000 000"
            inputMode="tel"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary h-fit self-end px-6 disabled:opacity-60"
        >
          <SearchIcon className="h-4 w-4" />
          {loading ? "Inatafuta…" : "Tafuta ombi"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      ) : null}

      {searched && rfqs.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-ink-500">
          Hatujapata ombi lolote kwa namba hii. Hakikisha namba ni ile uliyotumia
          kwenye fomu ya RFQ, au{" "}
          <a href="/jumla" className="font-semibold text-accent hover:underline">
            weka ombi jipya
          </a>
          .
        </p>
      ) : null}

      {rfqs.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {rfqs.map((rfq) => {
            const current = STATUS_FLOW.indexOf(rfq.status);
            const declined = rfq.status === "declined";
            const stepIndex = declined ? STATUS_FLOW.length - 1 : current;
            return (
              <li key={rfq.code} className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-lg font-semibold text-accent">
                      {rfq.code}
                    </span>
                    <span className={`badge ${statusStyles[rfq.status]}`}>
                      {statusLabels[rfq.status]}
                    </span>
                    {declined ? (
                      <span className="badge bg-danger-100 text-danger-600">
                        Haiendelei
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-ink-400">
                    {new Date(rfq.createdAt).toLocaleDateString("sw-TZ")}
                  </span>
                </div>

                {/* Hatua za ombi */}
                {!declined ? (
                  <ol className="mt-4 flex flex-wrap gap-2">
                    {STATUS_FLOW.map((status, index) => (
                      <li
                        key={status}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          index <= stepIndex
                            ? "bg-brand-700 text-white"
                            : "bg-cream-100 text-ink-400"
                        }`}
                      >
                        {index + 1}. {statusLabels[status]}
                      </li>
                    ))}
                  </ol>
                ) : null}

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-ink-400">Biashara</dt>
                    <dd className="mt-0.5 font-medium text-ink-900">
                      {rfq.business}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-400">Bidhaa &amp; wingi</dt>
                    <dd className="mt-0.5 font-medium text-ink-900">
                      {rfq.productName || "—"} × {rfq.qty} pcs
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-400">Mkoa</dt>
                    <dd className="mt-0.5 font-medium text-ink-900">
                      {rfq.region || "—"}
                    </dd>
                  </div>
                </dl>

                {/* Bei */}
                <div className="mt-4 rounded-xl bg-cream-100 p-4 text-sm">
                  {rfq.unitQuoteTsh != null ? (
                    <>
                      <p className="text-ink-500">Bei iliyowekwa na timu</p>
                      <p className="mt-1 font-display text-xl text-ink-900">
                        {formatTsh(rfq.unitQuoteTsh)} kwa kitu
                        {rfq.quoteTsh != null ? (
                          <span className="ml-2 text-sm font-semibold text-success-600">
                            jumla {formatTsh(rfq.quoteTsh)}
                          </span>
                        ) : null}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-ink-500">
                        Bei rasmi bado haijawekwa — tutakupigia simu na bei
                        yako maalum:
                      </p>
                      <p className="mt-1 font-display text-lg text-ink-700">
                        {tierFor(rfq.qty)?.label ?? "Rejareja"} · {rfq.qty} pcs
                      </p>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
