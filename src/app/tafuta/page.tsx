"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { categories as fallbackCategories, getProductBySlug, searchProducts, type Category } from "@/lib/data/catalog";
import { apiGet, arrayOrEmpty } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SearchIcon, SparkleIcon } from "@/components/ui/icons";

type SearchResult = {
  type: "product" | "article";
  slug: string;
  name: string;
  hint: string;
  href: string;
};

function localResults(query: string): SearchResult[] {
  return searchProducts(query).map((p) => ({
    type: "product" as const,
    slug: p.slug,
    name: p.name,
    hint: p.shortDescription,
    href: `/bidhaa/${p.slug}`,
  }));
}

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
  const categoryResource = useAsync<Category[]>("store-categories", async () => {
    const data = await apiGet<{ ok: boolean; categories: Category[] }>("/api/categories");
    return arrayOrEmpty<Category>(data.categories);
  });
  const categoryOptions = categoryResource.data ?? fallbackCategories;

  // Search wa backend (bidhaa + makala) — hutumia utafutaji wa ndani kama
  // kinga endapo server/mtandao haupo.
  const resource = useAsync<SearchResult[]>(`search:${q}`, async () => {
    const query = q.trim();
    if (!query) return [];
    try {
      const data = await apiGet<{ ok: boolean; results: SearchResult[] }>(
        `/api/search?q=${encodeURIComponent(query)}&limit=24`,
      );
      return arrayOrEmpty<SearchResult>(data.results);
    } catch {
      return localResults(query);
    }
  }, { delayMs: 120 });

  const results = resource.data ?? [];
  const loading = q.trim() !== "" && resource.loading;

  const productResults = results.filter((r) => r.type === "product");
  const articleResults = results.filter((r) => r.type === "article");

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Search</p>
      <h1 className="heading-display mt-2">
        {q ? `Results for “${q}”` : "Search products"}
      </h1>

      {loading ? (
<p className="mt-2 text-sm text-ink-500">Searching…</p>
      ) : q ? (
        <p className="mt-2 text-sm text-ink-500">
          {results.length} {results.length === 1 ? "result" : "results"}
          {" found"}
        </p>
      ) : (
        <p className="mt-2 text-ink-500">
          Enter a search term or choose a category below.
        </p>
      )}

      <ul className="mt-6 flex flex-wrap gap-2">
        {categoryOptions.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/bidhaa?kategoria=${c.slug}`}
              className="badge border border-cream-300 bg-surface text-ink-500 transition-colors hover:border-brand-300 hover:text-accent"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      {loading ? (
        <ul className="product-grid mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="card h-64 animate-pulse bg-cream-100" />
          ))}
        </ul>
      ) : q && results.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <SearchIcon className="mx-auto h-12 w-12 text-ink-300" />
          <p className="font-display mt-6 text-xl text-ink-900">
            No results for “{q}”
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Try another search or browse all products.
          </p>
          <Link href="/bidhaa" className="btn-primary mt-6">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          {productResults.length > 0 ? (
            <ul className="product-grid mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {productResults.map((result) => {
                const product = getProductBySlug(result.slug);
                if (!product) return null;
                return (
                  <li key={result.slug}>
                    <ProductCard product={product} />
                  </li>
                );
              })}
            </ul>
          ) : null}

          {articleResults.length > 0 ? (
            <section className="mt-12">
              <h2 className="font-display text-2xl text-ink-900">
                Related articles
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {articleResults.map((result) => (
                  <li key={result.slug}>
                    <Link
                      href={result.href}
                      className="card flex items-start gap-3 p-4 transition-colors hover:border-brand-300"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent">
                        <SparkleIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink-900">
                          {result.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-500">
                          {result.hint}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
