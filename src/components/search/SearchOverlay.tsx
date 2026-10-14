"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getProductBySlug, searchProducts } from "@/lib/data/catalog";
import { formatTsh } from "@/lib/format";
import { apiGet } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { ProductImage } from "@/components/media/ProductImage";
import { CloseIcon, SearchIcon, SparkleIcon } from "@/components/ui/icons";

type SearchResult = {
  type: "product" | "article";
  slug: string;
  name: string;
  hint: string;
  href: string;
};

function localResults(query: string): SearchResult[] {
  return searchProducts(query)
    .slice(0, 6)
    .map((p) => ({
      type: "product" as const,
      slug: p.slug,
      name: p.name,
      hint: p.shortDescription,
      href: `/bidhaa/${p.slug}`,
    }));
}

type Props = { open: boolean; onClose: () => void };

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Funga kwa Escape, focus kwenye input, Tab haendi nje ya dialog (AA).
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(
      '[aria-label="Search products"]',
    );
    inputRef.current?.focus();

    function focusables() {
      if (!dialog) return [] as HTMLElement[];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
    }

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
      }
    }

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previous?.focus?.();
    };
  }, [open, onClose]);

  // Search wa backend (bidhaa + makala) kwa deboi ya milisekunde 200.
  const resource = useAsync<SearchResult[]>(`overlay:${query}`, async () => {
    const q = query.trim();
    if (!q) return [];
    try {
      const data = await apiGet<{ ok: boolean; results: SearchResult[] }>(
        `/api/search?q=${encodeURIComponent(q)}&limit=6`,
      );
      return data.results;
    } catch {
      return localResults(q);
    }
  }, { delayMs: 200 });

  const results = query.trim() ? resource.data ?? [] : [];
  const searching = query.trim() !== "" && resource.loading;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    onClose();
    router.push(`/tafuta?q=${encodeURIComponent(q)}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-cream-50/95 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <div className="container-x py-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-xl text-ink-900">Search</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-full p-2 text-ink-500 hover:bg-cream-200 hover:text-ink-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-cream-300 bg-surface px-4 py-3">
            <SearchIcon className="h-5 w-5 shrink-0 text-ink-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search serum, lipstick, perfume…"
              className="w-full bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-400"
              aria-label="Search query"
            />
          </div>
        </form>

        <div className="mt-6">
          {query.trim() === "" ? (
            <p className="text-sm text-ink-500">
              Enter a product name or category to search.
            </p>
          ) : results.length === 0 && searching ? (
            <ul className="space-y-2">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-surface"
                />
              ))}
            </ul>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-cream-300 bg-surface p-8 text-center">
              <p className="font-display text-lg text-ink-900">
                No results for “{query}”
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Try another search, or browse all products.
              </p>
              <Link
                href="/bidhaa"
                onClick={onClose}
                className="btn-primary mt-4"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {results.map((result) => {
                  const product =
                    result.type === "product"
                      ? getProductBySlug(result.slug)
                      : undefined;
                  return (
                    <li key={`${result.type}-${result.slug}`}>
                      <Link
                        href={result.href}
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-2xl border border-transparent bg-surface p-3 transition-colors hover:border-cream-300"
                      >
                        <span className="h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-cream-300">
                          {product ? (
                            <ProductImage
                              src={product.image}
                              alt={product.imageAlt}
                              className="h-full w-full"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center bg-cream-100 text-brand-600">
                              <SparkleIcon className="h-6 w-6" />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-ink-900">
                            {result.name}
                          </span>
                          <span className="text-sm text-accent">
                            {product
                              ? formatTsh(product.priceTsh)
                              : result.type === "article"
                                ? "Article →"
                                : result.hint}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={`/tafuta?q=${encodeURIComponent(query.trim())}`}
                onClick={onClose}
                className="mt-4 inline-flex text-sm font-semibold text-accent hover:text-accent"
              >
                View all results →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
