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

  // Funga kwa Escape, zuia body scroll, nafunga focus ndani ya drawer
  // (focus trap ya kiwango cha AA — Tab haendi nje ya dialog).
  useEffect(() => {
    if (!open) return;
    const dialog = document.querySelector<HTMLElement>(
      '[aria-label="Your shopping bag"]',
    );
    const previous = document.activeElement as HTMLElement | null;

    function focusables() {
      if (!dialog) return [] as HTMLElement[];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
    }

    // Enter kwenye result cha kwanza (kitufe cha kufunga).
    focusables()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (
        !dialog?.contains(document.activeElement) &&
        document.activeElement
      ) {
        // Focus iliondoka dialog bila Tab (mfano: click nje) — rudisha.
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      // Rudisha focus kwenye result kilichochochea drawer.
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const freeShippingLeft = Math.max(
    site.freeShippingThresholdTsh - subtotalTsh,
    0,
  );

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your shopping bag">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in-right flex-col bg-cream-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
          <h2 className="font-display text-xl text-ink-900">
            Your bag ({count})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="rounded-full p-2 text-ink-500 transition-colors hover:bg-cream-200 hover:text-ink-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <BagIcon className="h-12 w-12 text-ink-300" />
            <p className="font-display text-lg text-ink-900">
              Your shopping bag is empty
            </p>
            <p className="text-sm text-ink-500">
              Add products to your bag to get started.
            </p>
            <Link href="/bidhaa" onClick={onClose} className="btn-primary mt-2">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {freeShippingLeft > 0 ? (
                <p className="mb-4 rounded-xl bg-brand-100 px-4 py-2.5 text-sm text-accent">
                  Add {formatTsh(freeShippingLeft)} to qualify for
                  free delivery in Dar es Salaam.
                </p>
              ) : (
                <p className="mb-4 rounded-xl bg-success-100 px-4 py-2.5 text-sm text-success-600">
                  Hongera! Umepata free delivery in Dar es Salaam.
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
                          className="text-sm font-semibold leading-snug text-ink-900 hover:text-accent"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(product.slug)}
                          aria-label={`Remove ${product.name}`}
                          className="text-xs text-ink-400 underline hover:text-danger-600"
                        >
                          Ondoa
                        </button>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-accent">
                        {formatTsh(product.priceTsh)}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <div className="flex items-center rounded-full border border-cream-300 bg-surface">
                          <button
                            type="button"
                            onClick={() => setQty(product.slug, qty - 1)}
                            aria-label="Decrease quantity"
                            className="px-3 py-1.5 text-ink-500 hover:text-accent"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.slug, qty + 1)}
                            aria-label="Increase quantity"
                            className="px-3 py-1.5 text-ink-500 hover:text-accent"
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
                <span className="text-sm text-ink-500">Subtotal</span>
                <span className="font-display text-xl text-ink-900">
                  {formatTsh(subtotalTsh)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-400">
                Delivery is calculated at checkout.
              </p>
              <Link
                href="/ukoko"
                onClick={onClose}
                className="btn-primary mt-4 w-full"
              >
                Continue to checkout
              </Link>
              <Link
                href="/kikapu"
                onClick={onClose}
                className="mt-2 block w-full text-center text-sm font-medium text-ink-500 hover:text-accent"
              >
                View full bag
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="mt-1 w-full text-center text-sm font-medium text-ink-500 hover:text-accent"
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
