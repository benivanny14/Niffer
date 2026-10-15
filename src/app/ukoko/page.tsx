"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatTsh } from "@/lib/format";
import {
  paymentMethods,
  site,
  tanzaniaRegions,
  tanzaniaCities,
  type PaymentId,
} from "@/lib/site";
import { createOrder, pushOrder } from "@/lib/orders-client";
import { getStock, applyServerStock } from "@/lib/stock";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
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
  const [city, setCity] = useState<string>("");
  const [street, setStreet] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentId>("mpesa");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Discount code (promo) — thibitishwa na server (DB).
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{
    code: string;
    label: string;
    freeShipping: boolean;
    discountTsh: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);

  // Gift card.
  const [giftInput, setGiftInput] = useState("");
  const [gift, setGift] = useState<{
    code: string;
    amountTsh: number;
    recipient: string;
  } | null>(null);
  const [giftError, setGiftError] = useState("");
  const [giftChecking, setGiftChecking] = useState(false);

  const [email, setEmail] = useState("");

  // Jaribu kujaza taarifa kutoka akaunti (mteja aliyeingia).
  useEffect(() => {
    let alive = true;
    apiGet<{
      ok: boolean;
      customer: {
        name: string;
        phone: string;
        email: string | null;
      } | null;
    }>("/api/customers/me")
      .then((data) => {
        if (!alive || !data.customer) return;
        setName((prev) => prev || data.customer!.name);
        setPhone((prev) => prev || data.customer!.phone);
        setEmail((prev) => prev || (data.customer!.email ?? ""));
      })
      .catch(() => {
        /* mteja hajaringia — fomu ya kawaida */
      });
    return () => {
      alive = false;
    };
  }, []);

  const cities = tanzaniaCities[region as keyof typeof tanzaniaCities] ?? [];

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
  // Gift card inaweza kufunika subtotal tu (si usafirishaji).
  const beforeGift = Math.max(0, subtotalTsh - (promo?.freeShipping ? 0 : discountTsh));
  const giftDiscountTsh = gift ? Math.min(gift.amountTsh, beforeGift) : 0;
  const total = Math.max(0, beforeGift - giftDiscountTsh) + shipping;

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
      setError("Enter a valid phone number (e.g. 0754 000 000).");
      return;
    }
    if (!city) {
      setError("Select your city or district.");
      return;
    }
    if (!street.trim()) {
      setError("Enter your street or ward.");
      return;
    }
    // Kizuizi cha haraka kwenye client (server ndio huthibitisha tena).
    for (const line of lines) {
      const available = getStock(line.product.slug);
      if (line.qty > available) {
        setError(
          available === 0
            ? `${line.product.name} is out of stock. Remove it from your bag.`
            : `Only ${available} of ${line.product.name} remain in stock.`,
        );
        return;
      }
    }
    setError("");
    setSubmitting(true);

    try {
      const { order, stock, paymentUrl } = await createOrder({
        customer: { name, phone, region, city, street, address, note, email },
        payment,
        lines: lines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
        promoCode: promo?.code,
        giftCardCode: gift?.code,
      });

      // Stock has been updated and the order saved.
      applyServerStock(stock);
      pushOrder(order);
      clear();

      // Malipo ya mtandaoni — elekeza kwenye gateway ya AzamPay.
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      // COD / malipo ya kawaida — onyesha oda.
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
        <h1 className="heading-display mt-6">Your bag is empty</h1>
        <p className="mt-3 text-ink-500">
          Add a product to continue to checkout.
        </p>
        <Link href="/bidhaa" className="btn-primary mt-8">
          Browse products
        </Link>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

  return (
    <div className="checkout-page container-x py-10 lg:py-14">
      <h1 className="heading-display">Checkout</h1>
      <p className="mt-2 text-ink-500">
        Enter your details so we can deliver your order as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-5">
        {/* Delivery details */}
        <div className="space-y-5 lg:col-span-3">
          <h2 className="font-display text-xl text-ink-900">
            Delivery details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-700">
                Full name *
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
                placeholder="Your name"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-700">
                Phone number *
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
              Email address (optional)
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-700">
                Region *
              </span>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setCity("");
                }}
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
                City / District *
              </span>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={field}
              >
                <option value="">Select a city…</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Street / Ward *
            </span>
            <input
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className={field}
              placeholder="e.g. Mikocheni B, Uhuru Street"
              minLength={2}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Full address *
            </span>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className={field}
              placeholder="House or office name, nearby landmark…"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Delivery notes (optional)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={field}
              placeholder="Preferred delivery time or directions…"
            />
          </label>

          <div>
            <h2 className="font-display text-xl text-ink-900">
              Payment method
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

        {/* Order summary */}
        <aside className="lg:col-span-2">
          <div className="card sticky top-30 p-6 sm:top-32">
            <h2 className="font-display text-xl text-ink-900">Your order</h2>
            <ul className="mt-4 space-y-3">
              {lines.map(({ product, qty }) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <span className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-cream-300">
                    <ProductImage
                      src={product.image}
                      alt={product.imageAlt}
                      fit="contain"
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

            {/* Discount code */}
            {/* Avoid a nested form here because HTML does not allow forms inside other forms. */}
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
                  placeholder="Discount code"
                  aria-label="Discount code"
                  className="w-full bg-transparent py-2.5 text-sm uppercase text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
              <button
                type="button"
                onClick={applyPromoCode}
                className="btn-outline px-4 py-2 text-xs"
              >
                Apply
              </button>
            </div>
            {promoError ? (
              <p className="mt-2 text-xs text-danger-600">{promoError}</p>
            ) : null}
            {promo ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-success-600">
                <CheckIcon className="h-3.5 w-3.5" />
                {promo.label} applied.
              </p>
            ) : null}

            {/* Gift card */}
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
                  placeholder="Gift card code"
                  aria-label="Gift card code"
                  className="w-full bg-transparent py-2.5 text-sm uppercase text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
              <button
                type="button"
                onClick={() => void applyGiftCard()}
                disabled={giftChecking}
                className="btn-outline px-4 py-2 text-xs disabled:opacity-60"
              >
                {giftChecking ? "Checking…" : "Apply"}
              </button>
            </div>
            {giftError ? (
              <p className="mt-2 text-xs text-danger-600">{giftError}</p>
            ) : null}
            {gift ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-success-600">
                <CheckIcon className="h-3.5 w-3.5" />
                Gift card {gift.code} — {formatTsh(gift.amountTsh)} applied.
              </p>
            ) : null}

            <dl className="mt-5 space-y-2 border-t border-cream-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-medium">{formatTsh(subtotalTsh)}</dd>
              </div>
              {discountTsh > 0 ? (
                <div className="flex justify-between text-success-600">
                  <dt>Discount ({promo?.code})</dt>
                  <dd className="font-medium">−{formatTsh(discountTsh)}</dd>
                </div>
              ) : null}
              {giftDiscountTsh > 0 ? (
                <div className="flex justify-between text-success-600">
                  <dt>Gift card ({gift?.code})</dt>
                  <dd className="font-medium">−{formatTsh(giftDiscountTsh)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-ink-500">Delivery</dt>
                <dd className="font-medium">
                  {shipping === 0 ? "Free" : formatTsh(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-cream-200 pt-2 text-base">
                <dt className="font-semibold text-ink-900">Total</dt>
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
              {submitting ? "Placing order…" : "Place order"}
            </button>

            <ul className="mt-4 space-y-2 text-xs text-ink-500">
              <li className="flex items-center gap-2">
                <TruckIcon className="h-4 w-4 shrink-0 text-brand-600" />
                {region === "Dar es Salaam"
                  ? "Dar es Salaam: 1–2 days"
                  : "Other regions: 2–5 days"}
              </li>
              <li className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 shrink-0 text-brand-600" />
                Review your order details before payment
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
