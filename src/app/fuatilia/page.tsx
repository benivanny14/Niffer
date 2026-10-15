"use client";

import Link from "next/link";
import { useState } from "react";
import { formatTsh } from "@/lib/format";
import { getProductBySlug } from "@/lib/data/catalog";
import { liveStatus, statusLabel, statusSteps, type Order } from "@/lib/orders";
import { fetchOrder } from "@/lib/orders-client";
import { errorMessage } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import { SearchIcon, TruckIcon } from "@/components/ui/icons";

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (searching) return;
    setSearching(true);
    setError("");
    setNotFound(false);
    setOrder(null);
    try {
      const found = await fetchOrder(code);
      setOrder(found ?? null);
      setNotFound(!found);
    } catch (err) {
      setOrder(null);
      setError(errorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  const currentStatus = order ? liveStatus(order) : null;
  const isCancelled = currentStatus === "ghairiwa";
  const stepIndex = currentStatus
    ? statusSteps.findIndex((s) => s.id === currentStatus)
    : -1;

  return (
    <div className="container-x max-w-2xl py-12 lg:py-16">
      <p className="eyebrow">Customer service</p>
      <h1 className="heading-display mt-2">Track your order</h1>
      <p className="mt-3 text-ink-500">
        Enter the order number you received (for example{" "}
        <span className="font-medium text-ink-700">NCF-XXXXXXXXXXXX</span>) ili kuona
        to check its progress.
      </p>

      <form onSubmit={lookup} className="mt-6 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-surface px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink-400" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="NCF-XXXXXXXXXXXX"
            aria-label="Order number"
            className="w-full bg-transparent py-3 text-sm uppercase text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="btn-primary disabled:opacity-60"
        >
{searching ? "Searching…" : "Search"}
        </button>
      </form>

      {error ? (
        <div className="card mt-8 border-danger-200 bg-danger-50 p-6">
          <p className="text-sm text-danger-600">{error}</p>
        </div>
      ) : null}

      {searching ? (
        <div className="card mt-8 animate-pulse p-6">
          <div className="h-4 w-32 rounded bg-cream-200" />
          <div className="mt-3 h-6 w-48 rounded bg-cream-200" />
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2 rounded-full bg-cream-200" />
            ))}
          </div>
        </div>
      ) : null}

      {notFound && !searching ? (
        <div className="card mt-8 p-6">
          <p className="font-display text-lg text-ink-900">
            We could not find that order
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Check that the number is correct, or call us{" "}
            <a
              href="tel:+255754000000"
              className="font-medium text-accent hover:underline"
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
              <p className="text-sm text-ink-500">Order number</p>
              <p className="font-display text-xl text-ink-900">
                {order.code}
              </p>
            </div>
            <span
              className={`badge ${
                isCancelled
                  ? "bg-danger-100 text-danger-600"
                  : "bg-brand-100 text-accent"
              }`}
            >
              {currentStatus ? statusLabel(currentStatus) : ""}
            </span>
          </div>
          {isCancelled ? (
            <p className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">
              This order was cancelled. Call us if you need help.
            </p>
          ) : null}
          <p className="mt-3 text-sm">
            <Link
              href={`/odha/${order.code}`}
              className="font-medium text-accent hover:underline"
            >
              View full order details →
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
                      done ? "font-semibold text-accent" : "text-ink-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 grid gap-4 border-t border-cream-200 pt-4 text-sm sm:grid-cols-2">
            {order.customer?.name ? (
              <div>
                <p className="text-ink-500">Recipient</p>
                <p className="font-medium text-ink-900">
                  {order.customer.name}
                </p>
                {order.customer.phone ? (
                  <p className="text-ink-500">
                    {formatPhone(order.customer.phone)}
                  </p>
                ) : null}
              </div>
            ) : null}
            {order.customer?.region ? (
              <div>
                <p className="text-ink-500">Delivery address</p>
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
              <span>Total</span>
              <span className="text-accent">
                {formatTsh(order.totalTsh)}
              </span>
            </li>
          </ul>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <TruckIcon className="h-5 w-5 text-brand-600" />
        <p className="text-sm text-ink-500">
          Questions about your order?{" "}
          <Link
            href="/wasiliana"
            className="font-medium text-accent hover:underline"
          >
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
