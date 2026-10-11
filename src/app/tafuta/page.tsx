"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { categories, searchProducts } from "@/lib/data/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SearchIcon } from "@/components/ui/icons";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-12">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-cream-200" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const results = useMemo(() => searchProducts(q), [q]);

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Utafitaji</p>
      <h1 className="heading-display mt-2">
        {q ? `Matokeo ya “${q}”` : "Tafuta bidhaa"}
      </h1>

      {q ? (
        <p className="mt-2 text-sm text-ink-500">
          {results.length} {results.length === 1 ? "bidhaa" : "bidhaa"}
          {" zimepatikana"}
        </p>
      ) : (
        <p className="mt-2 text-ink-500">
          Andika neno la utafutaji, au chagua kategoria hapa chini.
        </p>
      )}

      <ul className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/bidhaa?kategoria=${c.slug}`}
              className="badge border border-cream-300 bg-white text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      {q && results.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <SearchIcon className="mx-auto h-12 w-12 text-ink-300" />
          <p className="font-display mt-6 text-xl text-ink-900">
            Hakuna matokeo ya “{q}”
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Jaribu neno lingine, au vinjari bidhaa zote.
          </p>
          <Link href="/bidhaa" className="btn-primary mt-6">
            Vinjari Bidhaa
          </Link>
        </div>
      ) : results.length > 0 ? (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
