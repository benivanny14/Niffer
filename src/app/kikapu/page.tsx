"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatTsh } from "@/lib/format";
import { site } from "@/lib/site";
import { ProductImage } from "@/components/media/ProductImage";
import { BagIcon } from "@/components/ui/icons";

export default function CartPage() {
  const { lines, subtotalTsh, count, setQty, remove, ready, clear } =
    useStore();

  const freeShippingLeft = Math.max(
    site.freeShippingThresholdTsh - subtotalTsh,
    0,
  );

  return (
    <div className="cart-page container-x max-w-5xl py-12 lg:py-16">
      <p className="eyebrow">Ununuzi wako</p>
      <h1 className="heading-display mt-2">
        Kikapu chako{count > 0 ? ` (${count})` : ""}
      </h1>

      {!ready ? (
        <div className="card mt-8 animate-pulse p-6">
          <div className="h-4 w-32 rounded bg-cream-200" />
          <div className="mt-4 h-20 rounded-xl bg-cream-200" />
          <div className="mt-4 h-20 rounded-xl bg-cream-200" />
        </div>
      ) : lines.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <BagIcon className="mx-auto h-14 w-14 text-ink-300" />
          <p className="font-display mt-4 text-lg text-ink-900">
            Kikapu chako ni tupu
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Ongeza bidhaa unazopenda ili kuanza oda yako.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/bidhaa" className="btn-primary">
              Vinjari bidhaa
            </Link>
            <Link href="/upendwa" className="btn-outline">
              Bidhaa zako za upendwa
            </Link>
          </div>
        </div>
      ) : (
        <>
          {freeShippingLeft > 0 ? (
            <p className="mt-6 rounded-xl bg-brand-100 px-4 py-3 text-sm text-accent">
              Ongeza bidhaa {formatTsh(freeShippingLeft)} upate usafirishaji
              bure Dar es Salaam.
            </p>
          ) : (
            <p className="mt-6 rounded-xl bg-success-100 px-4 py-3 text-sm text-success-600">
              Hongera! Umepata usafirishaji bure Dar es Salaam.
            </p>
          )}

          <ul className="mt-6 space-y-4">
            {lines.map(({ product, qty }) => (
              <li key={product.slug} className="card flex gap-4 p-4">
                <Link
                  href={`/bidhaa/${product.slug}`}
                  className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-cream-300"
                >
                  <ProductImage
                    src={product.image}
                    alt={product.imageAlt}
                    className="h-full w-full"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link
                      href={`/bidhaa/${product.slug}`}
                      className="font-medium text-ink-900 hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(product.slug)}
                      aria-label={`Ondoa ${product.name}`}
                      className="text-xs text-ink-400 underline hover:text-danger-600"
                    >
                      Ondoa
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {formatTsh(product.priceTsh)} kwa kila moja
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center rounded-full border border-cream-300 bg-surface">
                      <button
                        type="button"
                        onClick={() => setQty(product.slug, qty - 1)}
                        aria-label="Punguza"
                        className="px-3.5 py-1.5 text-ink-500 hover:text-accent"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(product.slug, qty + 1)}
                        disabled={qty >= product.stock}
                        aria-label="Ongeza"
                        className="px-3.5 py-1.5 text-ink-500 hover:text-accent disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    {qty >= product.stock ? (
                      <span className="text-xs text-warning-600">
                        Stoo imebaki {product.stock}
                      </span>
                    ) : null}
                    <span className="ml-auto text-base font-semibold text-ink-900">
                      {formatTsh(product.priceTsh * qty)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="card mt-6 p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-ink-500">Jumla ndogo</span>
              <span className="font-display text-2xl text-ink-900">
                {formatTsh(subtotalTsh)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-400">
              Usafirishaji huhesabiwa kwenye hatua ya malipo.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/ukoko" className="btn-primary flex-1">
                Endelea na Malipo
              </Link>
              <Link href="/bidhaa" className="btn-outline">
                Endelea Kununua
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Ondoa bidhaa ZOTE kwenye kikapu? Hatua hii haiwezi kurudishwa.",
                  )
                ) {
                  clear();
                }
              }}
              className="mt-3 w-full text-center text-sm text-ink-400 transition-colors hover:text-danger-600"
            >
              Onda kikapu chote
            </button>
          </div>
        </>
      )}
    </div>
  );
}
