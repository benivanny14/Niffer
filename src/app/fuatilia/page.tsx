"use client";

import Link from "next/link";
import { useState } from "react";
import { formatTsh } from "@/lib/format";
import { getProductBySlug } from "@/lib/data/catalog";
import { liveStatus, statusSteps, type Order } from "@/lib/orders";
import { findOrder } from "@/lib/orders-client";
import { formatPhone } from "@/lib/format";
import { SearchIcon, TruckIcon } from "@/components/ui/icons";

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    const found = findOrder(code);
    setOrder(found ?? null);
    setNotFound(!found);
  }

  const stepIndex = order
    ? statusSteps.findIndex((s) => s.id === liveStatus(order))
    : -1;

  return (
    <div className="container-x max-w-2xl py-12 lg:py-16">
      <p className="eyebrow">Huduma kwa wateja</p>
      <h1 className="heading-display mt-2">Fuatilia oda yako</h1>
      <p className="mt-3 text-ink-500">
        Weka nambari ya oda uliyopata (mfano{" "}
        <span className="font-medium text-ink-700">NCF-8F3K</span>) ili kuona
        hatua iliyofikia.
      </p>

      <form onSubmit={lookup} className="mt-6 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-white px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink-400" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="NCF-XXXX"
            aria-label="Nambari ya oda"
            className="w-full bg-transparent py-3 text-sm uppercase text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
        <button type="submit" className="btn-primary">
          Tafuta
        </button>
      </form>

      {notFound ? (
        <div className="card mt-8 p-6">
          <p className="font-display text-lg text-ink-900">
            Hatukupata oda hiyo
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Hakikisha nambari ni sahihi, au tupigie simu{" "}
            <a
              href="tel:+255754000000"
              className="font-medium text-brand-700 hover:underline"
            >
              +255 754 000 000
            </a>
            .
          </p>
        </div>
      ) : null}

      {order ? (
        <div className="card mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-ink-500">Nambari ya oda</p>
              <p className="font-display text-xl text-ink-900">
                {order.code}
              </p>
            </div>
            <span className="badge bg-brand-100 text-brand-700">
              {statusSteps[stepIndex]?.label}
            </span>
          </div>
          <p className="mt-3 text-sm">
            <Link
              href={`/odha/${order.code}`}
              className="font-medium text-brand-700 hover:underline"
            >
              Ona maelezo kamili ya oda hii →
            </Link>
          </p>

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
                      done ? "font-semibold text-brand-700" : "text-ink-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 grid gap-4 border-t border-cream-200 pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-ink-500">Mpokeaji</p>
              <p className="font-medium text-ink-900">
                {order.customer.name}
              </p>
              <p className="text-ink-500">
                {formatPhone(order.customer.phone)}
              </p>
            </div>
            <div>
              <p className="text-ink-500">Kuwasilishwa</p>
              <p className="font-medium text-ink-900">
                {order.customer.region}
              </p>
              <p className="text-ink-500">{order.customer.address}</p>
            </div>
          </div>

          <ul className="mt-4 space-y-2 border-t border-cream-200 pt-4 text-sm">
            {order.lines.map((line) => {
              const p = getProductBySlug(line.slug);
              return (
                <li key={line.slug} className="flex justify-between">
                  <span className="text-ink-700">
                    {p?.name ?? line.slug} ×{line.qty}
                  </span>
                  <span className="font-medium text-ink-900">
                    {p ? formatTsh(p.priceTsh * line.qty) : "—"}
                  </span>
                </li>
              );
            })}
            <li className="flex justify-between border-t border-cream-200 pt-2 font-semibold">
              <span>Jumla</span>
              <span className="text-brand-700">
                {formatTsh(order.totalTsh)}
              </span>
            </li>
          </ul>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <TruckIcon className="h-5 w-5 text-brand-600" />
        <p className="text-sm text-ink-500">
          Maswali kuhusu oda yako?{" "}
          <Link
            href="/wasiliana"
            className="font-medium text-brand-700 hover:underline"
          >
            Wasiliana nasi
          </Link>
        </p>
      </div>
    </div>
  );
}
