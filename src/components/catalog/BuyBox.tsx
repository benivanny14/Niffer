"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/catalog";
import { formatTsh } from "@/lib/format";
import { site, waLink } from "@/lib/site";
import { useStore } from "@/lib/store";
import { useStock } from "@/lib/stock";
import { BagIcon, ChatIcon, CheckIcon } from "@/components/ui/icons";

export function BuyBox({ product }: { product: Product }) {
  const { add } = useStore();
  const liveStock = useStock(product.slug);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const max = Math.max(liveStock, 0);
  const outOfStock = max === 0;

  function handleAdd() {
    // Zuzuia kuongeza morei ya stoo iliyopo.
    add(product.slug, Math.min(qty, max));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const lineTotal = product.priceTsh * qty;
  const waText = waLink(
    `Hello ${site.name}, I would like to order: ${product.name} (x${qty}) — ${formatTsh(lineTotal)}`,
  );

  return (
    <div className="mt-6">
      {outOfStock ? (
        <p className="text-sm font-medium text-danger-600">Out of stock</p>
      ) : max <= 5 ? (
        <p className="text-sm font-medium text-warning-600">
              Only {max} left
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          className="flex items-center rounded-full border border-cream-300 bg-surface"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            className="px-4 py-3 text-ink-500 transition-colors hover:text-accent disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span
            className="w-8 text-center text-sm font-semibold text-ink-900"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            className="px-4 py-3 text-ink-500 transition-colors hover:text-accent disabled:opacity-40"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={outOfStock || qty >= max}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`btn flex-1 ${added ? "bg-success-600 text-on-success" : "btn-primary"}`}
          aria-live="polite"
        >
          {added ? (
            <>
              <CheckIcon className="h-4 w-4" />
              Added to bag
            </>
          ) : (
            <>
              <BagIcon className="h-4 w-4" />
              Add to bag
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-400">
          Total:{" "}
          <span className="font-semibold text-ink-900">
            {formatTsh(lineTotal)}
          </span>
        </p>
        <a
          href={waText}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          <ChatIcon className="h-4 w-4" />
          Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
