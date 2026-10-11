"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchProducts } from "@/lib/data/catalog";
import { formatTsh } from "@/lib/format";
import { ProductImage } from "@/components/media/ProductImage";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

type Props = { open: boolean; onClose: () => void };

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
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

  const results = useMemo(() => searchProducts(query).slice(0, 6), [query]);

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
      aria-label="Tafuta bidhaa"
    >
      <div className="container-x py-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-xl text-ink-900">Tafuta</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Funga utafutaji"
            className="rounded-full p-2 text-ink-500 hover:bg-cream-200 hover:text-ink-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-cream-300 bg-white px-4 py-3">
            <SearchIcon className="h-5 w-5 shrink-0 text-ink-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tafuta serum, lipstick, perfume…"
              className="w-full bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-400"
              aria-label="Neno la utafutaji"
            />
          </div>
        </form>

        <div className="mt-6">
          {query.trim() === "" ? (
            <p className="text-sm text-ink-500">
              Andika jina la bidhaa au kategoria unayotafuta.
            </p>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-cream-300 bg-white p-8 text-center">
              <p className="font-display text-lg text-ink-900">
                Hakuna matokeo ya “{query}”
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Jaribu neno lingine, au vinjari bidhaa zote.
              </p>
              <Link
                href="/bidhaa"
                onClick={onClose}
                className="btn-primary mt-4"
              >
                Vinjari Bidhaa
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/bidhaa/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 rounded-2xl border border-transparent bg-white p-3 transition-colors hover:border-cream-300"
                    >
                      <span className="h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-cream-300">
                        <ProductImage
                          src={product.image}
                          alt={product.imageAlt}
                          className="h-full w-full"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-ink-900">
                          {product.name}
                        </span>
                        <span className="text-sm text-brand-700">
                          {formatTsh(product.priceTsh)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/tafuta?q=${encodeURIComponent(query.trim())}`}
                onClick={onClose}
                className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Ona matokeo yote →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
