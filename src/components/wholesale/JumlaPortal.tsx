"use client";

import { useState } from "react";
import Link from "next/link";
import { products, getProductBySlug, type Product } from "@/lib/data/catalog";
import { formatTsh } from "@/lib/format";
import {
  bulkSavings,
  bulkTotal,
  bulkUnitPrice,
  tierFor,
} from "@/lib/wholesale";
import { site, tanzaniaRegions, waLink } from "@/lib/site";
import { apiPost, errorMessage } from "@/lib/api";
import { CheckIcon, TagIcon } from "@/components/ui/icons";

const field =
  "w-full rounded-sm border border-ink-900/25 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900";

/**
 * Kikokotoo cha bei ya jumla — chagua bidhaa na wingi, unapata bei ya unit,
 * jumla na kiwango cha kuokolewa kwa daraja la jumla.
 */
export function BulkCalculator({ products: items }: { products?: Product[] }) {
  const catalog = items ?? products;
  const [slug, setSlug] = useState(catalog[0]?.slug ?? "");
  const [qtyInput, setQtyInput] = useState("25");

  const product =
    catalog.find((p) => p.slug === slug) ?? getProductBySlug(slug);
  const qty = Math.max(0, Number.parseInt(qtyInput, 10) || 0);
  const tier = tierFor(qty);

  const unit = product ? bulkUnitPrice(product.priceTsh, qty) : 0;
  const total = product ? bulkTotal(product.priceTsh, qty) : 0;
  const savings = product ? bulkSavings(product.priceTsh, qty) : 0;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2">
        <TagIcon className="h-4 w-4 text-accent" />
        <h3 className="font-display text-lg text-ink-900">
          Kikokotoo cha bei ya jumla
        </h3>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Bidhaa</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={field}
          >
            {catalog.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} — {formatTsh(p.priceTsh)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Wingi (pcs)
          </span>
          <input
            type="number"
            min={1}
            max={100000}
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            className={field}
            inputMode="numeric"
            placeholder="mfano 25"
          />
        </label>
      </div>

      {product && qty > 0 ? (
        <dl className="mt-5 grid gap-3 rounded-xl bg-cream-100 p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-500">Daraja</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">
              {tier ? (
                <span className="badge bg-brand-100 text-accent">
                  {tier.label} · −{tier.discount}%
                </span>
              ) : (
                <span className="text-ink-500">
                  Rejareja (jiunge na jumla kuanzia 10)
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-ink-500">Bei ya unit</dt>
            <dd className="mt-0.5 font-display text-lg text-ink-900">
              {formatTsh(unit)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-500">Jumla ({qty} pcs)</dt>
            <dd className="mt-0.5 font-display text-lg text-ink-900">
              {formatTsh(total)}
              {savings > 0 ? (
                <span className="ml-2 text-xs font-semibold text-success-600">
                  unaokea {formatTsh(savings)}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      ) : null}

      <p className="mt-3 text-xs text-ink-400">
        Makadirio tu — bei ya mwisho inathibitishwa na timu ya jumla baada ya
        RFQ yako kupitiwa.
      </p>
    </div>
  );
}

/**
 * RFQ (Request for Quote) — ombi la bei ya wingi kama Alibaba:
 * hurushwa kwenye backend na unaonekana kwenye dashibodi ya admin.
 */
export function RfqForm({ products: items }: { products?: Product[] }) {
  const catalog = items ?? products;
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<string>(tanzaniaRegions[0]);
  const [slug, setSlug] = useState(catalog[0]?.slug ?? "");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [doneCode, setDoneCode] = useState("");

  const product = catalog.find((p) => p.slug === slug);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!/^[0-9+\s]{9,15}$/.test(phone.trim())) {
      setError("Weka namba sahihi ya simu (mfano 0754 000 000).");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await apiPost<{ ok: boolean; rfq: { code: string } }>(
        "/api/rfq",
        {
          business,
          name,
          phone,
          email,
          region,
          productSlug: product?.slug ?? "",
          productName: product?.name ?? "",
          qty,
          note,
        },
      );
      setDoneCode(res.rfq.code);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const waText =
    `Habari ${site.name}, naomba bei ya jumla (RFQ).\n` +
    `Biashara: ${business}\nMtu: ${name}\nSimu: ${phone}\nMkoa: ${region}\n` +
    `Bidhaa: ${product?.name ?? "—"}\nWingi: ${qty || "—"} pcs` +
    (note ? `\nMaelezo: ${note}` : "");

  if (doneCode) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl text-ink-900">
          RFQ yako imepokelewa
        </h3>
        <p className="mt-2 text-sm text-ink-500">
          Nambari ya ombi lako — hifadhi ili kufuatilia hatua na bei:
        </p>
        <p className="mt-3 font-mono text-2xl font-semibold tracking-wide text-accent">
          {doneCode}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/jumla/ombi" className="btn-primary">
            Fuatilia ombi langu
          </Link>
          <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="btn-outline">
            Tuma kwa WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setDoneCode("")}
            className="btn-outline"
          >
            Tuma nyingine
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <h3 className="font-display text-lg text-ink-900">
          Ombi la bei ya wingi (RFQ)
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Eleza bidhaa na wingi unayohitaji — tutakupa bei maalum.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Jina la biashara *
          </span>
          <input
            required
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className={field}
            placeholder="mfano: Glow Beauty Store"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Mtu wa kuwasiliana *
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Jina lako"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Namba ya simu *
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
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Barua pepe (hiari)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            placeholder="wewe@mfano.com"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Mkoa</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={field}
          >
            {tanzaniaRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Bidhaa</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={field}
          >
            {catalog.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Wingi unaohitaji (pcs) *
          </span>
          <input
            required
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className={field}
            placeholder="mfano 50"
            inputMode="numeric"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          Maelezo ya ziada (hiari)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className={field}
          placeholder="Aina ya bidhaa, muda wa kuhitaji, mahali pa kusafirisha…"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="btn-primary w-full disabled:opacity-60"
      >
        {sending ? "Inatuma…" : "Tuma ombi la bei (RFQ)"}
      </button>
    </form>
  );
}
