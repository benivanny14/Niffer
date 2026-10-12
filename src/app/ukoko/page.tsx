"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatTsh } from "@/lib/format";
import {
  paymentMethods,
  site,
  tanzaniaRegions,
  type PaymentId,
} from "@/lib/site";
import { createOrder, pushOrder } from "@/lib/orders-client";
import { getStock, applyServerStock } from "@/lib/stock";
import { apiPost, errorMessage } from "@/lib/api";
import { ProductImage } from "@/components/media/ProductImage";
import {
  BagIcon,
  CheckIcon,
  ShieldIcon,
  SparkleIcon,
  TagIcon,
  TruckIcon,
} from "@/components/ui/icons";

export default function CheckoutPage() {
  const { lines, subtotalTsh, clear, ready } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState<string>(tanzaniaRegions[0]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentId>("mpesa");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Msimbo wa punguzo (promo) — thibitishwa na server (DB).
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{
    code: string;
    label: string;
    freeShipping: boolean;
    discountTsh: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);

  // Kadi ya zawadi.
  const [giftInput, setGiftInput] = useState("");
  const [gift, setGift] = useState<{
    code: string;
    amountTsh: number;
    recipient: string;
  } | null>(null);
  const [giftError, setGiftError] = useState("");
  const [giftChecking, setGiftChecking] = useState(false);

  const shippingBase = useMemo(
    () =>
      region === "Dar es Salaam" && subtotalTsh < site.freeShippingThresholdTsh
        ? site.baseShippingTsh
        : 0,
    [region, subtotalTsh],
  );

  const discountTsh = promo
    ? promo.freeShipping
      ? 0
      : promo.discountTsh
    : 0;
  const shipping = promo?.freeShipping ? 0 : shippingBase;
  const beforeGift =
    Math.max(0, subtotalTsh - (promo?.freeShipping ? 0 : discountTsh)) +
    shipping;
  const giftDiscountTsh = gift ? Math.min(gift.amountTsh, beforeGift) : 0;
  const total = Math.max(0, beforeGift - giftDiscountTsh);

  async function applyPromoCode() {
    if (promoChecking) return;
    setPromoChecking(true);
    setPromoError("");
    try {
      const data = await apiPost<{
        ok: boolean;
        promo: {
          code: string;
          label: string;
          freeShipping: boolean;
          discountTsh: number;
        };
      }>("/api/promo/validate", {
        code: promoInput,
        subtotalTsh,
        shippingTsh: shippingBase,
      });
      setPromo(data.promo);
      setPromoError("");
    } catch (err) {
      setPromo(null);
      setPromoError(errorMessage(err));
    } finally {
      setPromoChecking(false);
    }
  }

  async function applyGiftCard() {
    if (giftChecking) return;
    setGiftChecking(true);
    setGiftError("");
    try {
      const data = await apiPost<{
        ok: boolean;
        giftCard: { code: string; amountTsh: number; recipient: string };
      }>("/api/giftcards/validate", { code: giftInput });
      setGift(data.giftCard);
      setGiftError("");
    } catch (err) {
      setGift(null);
      setGiftError(errorMessage(err));
    } finally {
      setGiftChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0 || submitting) return;
    if (!/^[0-9+\s]{9,15}$/.test(phone.trim())) {
      setError("Weka namba sahihi ya simu (mfano 0754 000 000).");
      return;
    }
    // Kizuizi cha haraka kwenye client (server ndio huthibitisha tena).
    for (const line of lines) {
      const available = getStock(line.product.slug);
      if (line.qty > available) {
        setError(
          available === 0
            ? `${line.product.name} imeisha stoo. Ondoa kutoka kikapu.`
            : `Stoo ya ${line.product.name} imebaki ${available} tu.`,
        );
        return;
      }
    }
    setError("");
    setSubmitting(true);

    try {
      const { order, stock } = await createOrder({
        customer: { name, phone, region, address, note },
        payment,
        lines: lines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
        promoCode: promo?.code,
        giftCardCode: gift?.code,
      });

      // Stoo mpya kutoka server + oda imehifadhiwa kwenye DB.
      applyServerStock(stock);
      pushOrder(order);
      clear();
      router.push(`/odha/${order.code}`);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  if (lines.length === 0) {
    return (
      <div className="container-x max-w-xl py-20 text-center">
        <BagIcon className="mx-auto h-14 w-14 text-ink-300" />
        <h1 className="heading-display mt-6">Kikapu chako ni tupu</h1>
        <p className="mt-3 text-ink-500">
          Ongeza bidhaa kwanza ili kuendelea na malipo.
        </p>
        <Link href="/bidhaa" className="btn-primary mt-8">
          Vinjari Bidhaa
        </Link>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="heading-display">Malipo</h1>
      <p className="mt-2 text-ink-500">
        Jaza taarifa zako ili tukuletee bidhaa haraka iwezekanavyo.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-5">
        {/* Taarifa */}
        <div className="space-y-5 lg:col-span-3">
          <h2 className="font-display text-xl text-ink-900">
            Taarifa za kuwasilisha
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-700">
                Jina kamili *
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
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Mkoa *
            </span>
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
            <span className="mb-1.5 block font-medium text-ink-700">
              Anwani kamili *
            </span>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className={field}
              placeholder="Mtaa, kata, jina la nyumba au ofisi…"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Maelezo ya ziada (hiari)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={field}
              placeholder="Muda unafaa, alama ya njia…"
            />
          </label>

          <div>
            <h2 className="font-display text-xl text-ink-900">
              Njia ya malipo
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    payment === m.id
                      ? "border-brand-600 bg-brand-50"
                      : "border-cream-300 bg-surface hover:border-brand-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="accent-brand-700"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">
                      {m.label}
                    </span>
                    <span className="block text-xs text-ink-500">
                      {m.note}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Muhtasari */}
        <aside className="lg:col-span-2">
          <div className="card sticky top-28 p-6">
            <h2 className="font-display text-xl text-ink-900">Oda yako</h2>
            <ul className="mt-4 space-y-3">
              {lines.map(({ product, qty }) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <span className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-cream-300">
                    <ProductImage
                      src={product.image}
                      alt={product.imageAlt}
                      className="h-full w-full"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-900">
                      {product.name}
                    </span>
                    <span className="text-xs text-ink-500">×{qty}</span>
                  </span>
                  <span className="text-sm font-semibold text-ink-900">
                    {formatTsh(product.priceTsh * qty)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Msimbo wa punguzo */}
            {/* Si <form>: HTML hairuhusu form ndani ya fomu kuu ya oda. */}
            <div className="mt-5 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-surface px-3">
                <TagIcon className="h-4 w-4 shrink-0 text-ink-400" />
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyPromoCode();
                    }
                  }}
                  placeholder="Msimbo wa punguzo"
                  aria-label="Msimbo wa punguzo"
                  className="w-full bg-transparent py-2.5 text-sm uppercase text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
              <button
                type="button"
                onClick={applyPromoCode}
                className="btn-outline px-4 py-2 text-xs"
              >
                Tumia
              </button>
            </div>
            {promoError ? (
              <p className="mt-2 text-xs text-danger-600">{promoError}</p>
            ) : null}
            {promo ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-success-600">
                <CheckIcon className="h-3.5 w-3.5" />
                {promo.label} imeongezwa.
              </p>
            ) : null}

            {/* Kadi ya zawadi */}
            <div className="mt-3 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-surface px-3">
                <SparkleIcon className="h-4 w-4 shrink-0 text-ink-400" />
                <input
                  value={giftInput}
                  onChange={(e) => setGiftInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void applyGiftCard();
                    }
                  }}
                  placeholder="Msimbo wa kadi ya zawadi"
                  aria-label="Msimbo wa kadi ya zawadi"
                  className="w-full bg-transparent py-2.5 text-sm uppercase text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
              <button
                type="button"
                onClick={() => void applyGiftCard()}
                disabled={giftChecking}
                className="btn-outline px-4 py-2 text-xs disabled:opacity-60"
              >
                {giftChecking ? "Inathibitisha…" : "Tumia"}
              </button>
            </div>
            {giftError ? (
              <p className="mt-2 text-xs text-danger-600">{giftError}</p>
            ) : null}
            {gift ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-success-600">
                <CheckIcon className="h-3.5 w-3.5" />
                Kadi {gift.code} — {formatTsh(gift.amountTsh)} imeongezwa.
              </p>
            ) : null}

            <dl className="mt-5 space-y-2 border-t border-cream-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Jumla ndogo</dt>
                <dd className="font-medium">{formatTsh(subtotalTsh)}</dd>
              </div>
              {discountTsh > 0 ? (
                <div className="flex justify-between text-success-600">
                  <dt>Punguzo ({promo?.code})</dt>
                  <dd className="font-medium">−{formatTsh(discountTsh)}</dd>
                </div>
              ) : null}
              {giftDiscountTsh > 0 ? (
                <div className="flex justify-between text-success-600">
                  <dt>Kadi ya zawadi ({gift?.code})</dt>
                  <dd className="font-medium">−{formatTsh(giftDiscountTsh)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-ink-500">Usafirishaji</dt>
                <dd className="font-medium">
                  {shipping === 0 ? "Bure" : formatTsh(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-cream-200 pt-2 text-base">
                <dt className="font-semibold text-ink-900">Jumla</dt>
                <dd className="font-display text-ink-900">
                  {formatTsh(total)}
                </dd>
              </div>
            </dl>

            {error ? (
              <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-5 w-full disabled:opacity-60"
            >
              {submitting ? "Inaweka oda…" : "Weka Oda"}
            </button>

            <ul className="mt-4 space-y-2 text-xs text-ink-500">
              <li className="flex items-center gap-2">
                <TruckIcon className="h-4 w-4 shrink-0 text-brand-600" />
                {region === "Dar es Salaam"
                  ? "Dar es Salaam: siku 1–2"
                  : "Mikoa mingine: siku 2–5"}
              </li>
              <li className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 shrink-0 text-brand-600" />
                Bidhaa halisi 100% · Malipo salama
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
