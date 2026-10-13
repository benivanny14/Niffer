"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrderLookup } from "@/lib/orders-client";
import { useNow } from "@/lib/clock";
import { liveStatus, statusEvents, statusSteps } from "@/lib/orders";
import { getProductBySlug } from "@/lib/data/catalog";
import { formatTsh, formatPhone } from "@/lib/format";
import { site, waLink } from "@/lib/site";
import { ProductImage } from "@/components/media/ProductImage";
import {
  BagIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/ui/icons";

const paymentLabels: Record<string, string> = {
  mpesa: "M-Pesa",
  mixx: "Mixx by Yas",
  airtel: "Airtel Money",
  cod: "Malipo poa (baada ya kupokea)",
};

export default function OrderPage() {
  const params = useParams<{ code: string }>();
  const code = params?.code ?? "";
  const { order, loading, error } = useOrderLookup(code);
  // Saa ya client (husasishwa kila sekunde) — demo inasonga yenyewe.
  const now = useNow();

  if (loading) {
    return (
      <div className="container-x max-w-3xl py-12 lg:py-16">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-cream-200" />
        <div className="mx-auto mt-6 h-8 w-72 animate-pulse rounded-lg bg-cream-200" />
        <div className="card mt-10 animate-pulse p-6">
          <div className="h-4 w-40 rounded bg-cream-200" />
          <div className="mt-4 h-24 rounded-xl bg-cream-200" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-x max-w-xl py-20 text-center">
        <BagIcon className="mx-auto h-14 w-14 text-ink-300" />
        <h1 className="heading-display mt-6">Hatukupata oda hii</h1>
        <p className="mt-3 text-ink-500">
          {error && !error.startsWith("Oda hiyo")
            ? error
            : <>Nambari <span className="font-medium text-ink-700">{code}</span>{" "}
              haipatikani. Angalia tena, au tupigie simu{" "}
              <a
                href={`tel:${site.phoneTel}`}
                className="font-medium text-accent hover:underline"
              >
                {site.phoneDisplay}
              </a>
              .
            </>}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/fuatilia" className="btn-primary">
            Fuatilia Oda
          </Link>
          <Link href="/bidhaa" className="btn-outline">
            Vinjari Bidhaa
          </Link>
        </div>
      </div>
    );
  }

  const status = now > 0 ? liveStatus(order, now) : order.status;
  const stepIndex = statusSteps.findIndex((s) => s.id === status);
  const events = statusEvents(order);
  const waText = `Habari ${site.name}, nina oda ${order.code}. Jumla: ${formatTsh(order.totalTsh)}`;

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      {/* Header ya mafanikio */}
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="heading-display mt-6">Asante! Oda yako imepokelewa</h1>
        <p className="mt-3 text-ink-500">
          Nambari ya oda yako ni{" "}
          <span className="font-semibold text-ink-900">{order.code}</span>.
          Tutakupigia simu kuthibitisha ndani ya dakika chache.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-outline no-print mt-5"
        >
          Chapisha risiti
        </button>
      </div>

      <div className="card mt-10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-ink-500">Nambari ya oda</p>
            <p className="font-display text-xl text-ink-900">{order.code}</p>
          </div>
          <span className="badge bg-brand-100 text-accent">
            {statusSteps[stepIndex]?.label}
          </span>
        </div>

        {/* Hatua */}
        <ol className="mt-6 grid grid-cols-4 gap-2">
          {statusSteps.map((step, i) => {
            const done = i <= stepIndex;
            return (
              <li key={step.id} className="text-center">
                <div
                  className={`mx-auto h-2 w-full rounded-full ${
                    done ? "bg-brand-700" : "bg-cream-300"
                  }`}
                />
                <span
                  className={`mt-2 block text-[11px] ${
                    done ? "font-semibold text-accent" : "text-ink-400"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Matukio */}
        <ul className="mt-6 space-y-2 border-t border-cream-200 pt-4 text-sm">
          {events.map((event) => {
            const label = statusSteps.find((s) => s.id === event.status)?.label;
            const future =
              now > 0 && event.at != null && event.at.getTime() > now;
            return (
              <li
                key={event.status}
                className="flex items-center justify-between"
              >
                <span
                  className={
                    event.at && !future
                      ? "font-medium text-ink-900"
                      : "text-ink-400"
                  }
                >
                  {label}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-ink-400">
                  {event.at ? (
                    future ? (
                      <>
                        <ClockIcon className="h-3.5 w-3.5" />
                        Inatarajiwa {event.at.toLocaleString("sw-TZ")}
                      </>
                    ) : (
                      event.at.toLocaleString("sw-TZ")
                    )
                  ) : (
                    "—"
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Taarifa */}
        <div className="mt-6 grid gap-4 border-t border-cream-200 pt-4 text-sm sm:grid-cols-2">
          {order.customer?.name ? (
            <div>
              <p className="text-ink-500">Mpokeaji</p>
              <p className="font-medium text-ink-900">{order.customer.name}</p>
              {order.customer.phone ? (
                <p className="text-ink-500">
                  {formatPhone(order.customer.phone)}
                </p>
              ) : null}
            </div>
          ) : null}
          {order.customer?.region ? (
            <div>
              <p className="text-ink-500">Kuwasilishwa</p>
              <p className="font-medium text-ink-900">
                {[order.customer.city, order.customer.region]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.customer.street ? (
                <p className="text-ink-500">{order.customer.street}</p>
              ) : null}
              {order.customer.address ? (
                <p className="text-ink-500">{order.customer.address}</p>
              ) : null}
            </div>
          ) : null}
          <div>
            <p className="text-ink-500">Njia ya malipo</p>
            <p className="font-medium text-ink-900">
              {paymentLabels[order.payment] ?? order.payment}
            </p>
          </div>
          <div>
            <p className="text-ink-500">Oda iliwekwa</p>
            <p className="font-medium text-ink-900">
              {new Date(order.createdAt).toLocaleString("sw-TZ")}
            </p>
          </div>
        </div>

        {/* Bidhaa */}
        <ul className="mt-4 space-y-3 border-t border-cream-200 pt-4 text-sm">
          {order.lines.map((line) => {
            const p = getProductBySlug(line.slug);
            return (
              <li key={line.slug} className="flex items-center gap-3">
                {p ? (
                  <span className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-cream-300">
                    <ProductImage
                      src={p.image}
                      alt={p.imageAlt}
                      className="h-full w-full"
                    />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink-900">
                    {p?.name ?? line.slug} ×{line.qty}
                  </span>
                </span>
                <span className="font-medium text-ink-900">
                  {p ? formatTsh(p.priceTsh * line.qty) : "—"}
                </span>
              </li>
            );
          })}
          {order.discountTsh && order.discountTsh > 0 ? (
            <li className="flex justify-between text-success-600">
              <span>
                Punguzo{order.promoCode ? ` (${order.promoCode})` : ""}
              </span>
              <span className="font-medium">−{formatTsh(order.discountTsh)}</span>
            </li>
          ) : null}
          {order.giftDiscountTsh && order.giftDiscountTsh > 0 ? (
            <li className="flex justify-between text-success-600">
              <span>
                Kadi ya zawadi
                {order.giftCardCode ? ` (${order.giftCardCode})` : ""}
              </span>
              <span className="font-medium">
                −{formatTsh(order.giftDiscountTsh)}
              </span>
            </li>
          ) : null}
          <li className="flex justify-between border-t border-cream-200 pt-3">
            <span className="text-ink-500">Usafirishaji</span>
            <span className="font-medium">
              {order.shippingTsh === 0 ? "Bure" : formatTsh(order.shippingTsh)}
            </span>
          </li>
          <li className="flex justify-between border-t border-cream-200 pt-2 text-base font-semibold">
            <span>Jumla</span>
            <span className="text-accent">{formatTsh(order.totalTsh)}</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={waLink(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          <ChatIcon className="h-4 w-4" />
          Thibitisha kwa WhatsApp
        </a>
        <Link href="/bidhaa" className="btn-outline">
          Endelea Kununua
        </Link>
        <Link href="/fuatilia" className="btn-outline">
          Fuatilia Oda
        </Link>
      </div>

      <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-ink-400">
        <li className="flex items-center gap-1.5">
          <TruckIcon className="h-4 w-4 text-brand-600" />
          Dar es Salaam siku 1–2 · mikoa mingine 2–5
        </li>
        <li className="flex items-center gap-1.5">
          <ShieldIcon className="h-4 w-4 text-brand-600" />
          Bidhaa halisi 100%
        </li>
      </ul>
    </div>
  );
}
