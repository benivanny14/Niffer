"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { formatTsh } from "@/lib/format";
import { site } from "@/lib/site";
import { ProductImage } from "@/components/media/ProductImage";
import { BagIcon, CloseIcon } from "@/components/ui/icons";

type Props = { open: boolean; onClose: () => void };

export function CartDrawer({ open, onClose }: Props) {
  const { lines, subtotalTsh, count, setQty, remove } = useStore();

  // Funga kwa Escape + zuia body scroll wakiwa wazi.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const freeShippingLeft = Math.max(
    site.freeShippingThresholdTsh - subtotalTsh,
    0,
  );

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Kikapu chako">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in-right flex-col bg-cream-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
          <h2 className="font-display text-xl text-ink-900">
            Kikapu ({count})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Funga kikapu"
            className="rounded-full p-2 text-ink-500 transition-colors hover:bg-cream-200 hover:text-ink-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <BagIcon className="h-12 w-12 text-ink-300" />
            <p className="font-display text-lg text-ink-900">
              Kikapu chako ni tupu
            </p>
            <p className="text-sm text-ink-500">
              Ongeza bidhaa unazopenda ili kuanza oda yako.
            </p>
            <Link href="/bidhaa" onClick={onClose} className="btn-primary mt-2">
              Vinjari bidhaa
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {freeShippingLeft > 0 ? (
                <p className="mb-4 rounded-xl bg-brand-100 px-4 py-2.5 text-sm text-brand-800">
                  Ongeza bidhaa {formatTsh(freeShippingLeft)} upate
                  usafirishaji bure Dar es Salaam.
                </p>
              ) : (
                <p className="mb-4 rounded-xl bg-success-100 px-4 py-2.5 text-sm text-success-600">
                  Hongera! Umepata usafirishaji bure Dar es Salaam.
                </p>
              )}

              <ul className="space-y-4">
                {lines.map(({ product, qty }) => (
                  <li
                    key={product.slug}
                    className="flex gap-3 border-b border-cream-200 pb-4 last:border-0"
                  >
                    <Link
                      href={`/bidhaa/${product.slug}`}
                      onClick={onClose}
                      className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-cream-300"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.imageAlt}
                        className="h-full w-full"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/bidhaa/${product.slug}`}
                          onClick={onClose}
                          className="text-sm font-semibold leading-snug text-ink-900 hover:text-brand-700"
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
                      <p className="mt-1 text-sm font-semibold text-brand-700">
                        {formatTsh(product.priceTsh)}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <div className="flex items-center rounded-full border border-cream-300 bg-white">
                          <button
                            type="button"
                            onClick={() => setQty(product.slug, qty - 1)}
                            aria-label="Punguza"
                            className="px-3 py-1.5 text-ink-500 hover:text-brand-700"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.slug, qty + 1)}
                            aria-label="Ongeza"
                            className="px-3 py-1.5 text-ink-500 hover:text-brand-700"
                          >
                            +
                          </button>
                        </div>
                        <span className="ml-auto text-sm font-semibold text-ink-900">
                          {formatTsh(product.priceTsh * qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-cream-300 px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-500">Jumla ndogo</span>
                <span className="font-display text-xl text-ink-900">
                  {formatTsh(subtotalTsh)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-400">
                Usafirishaji huhesabiwa kwenye hatua ya malipo.
              </p>
              <Link
                href="/ukoko"
                onClick={onClose}
                className="btn-primary mt-4 w-full"
              >
                Endelea na Malipo
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 w-full text-center text-sm font-medium text-ink-500 hover:text-brand-700"
              >
                Endelea Kununua
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
