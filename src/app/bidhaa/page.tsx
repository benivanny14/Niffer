import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { categories } from "@/lib/data/catalog";
import { listProducts } from "@/lib/server/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import {
  filterCounts,
  filterProducts,
  isSortKey,
  type ProductFilters,
} from "@/lib/product-filter";

export const metadata: Metadata = {
  title: "Bidhaa zote",
  description:
    "Vinjari bidhaa za Niffer Cosmetics: skincare, makeup, nywele, perfume na zaidi — chuja kwa mkoa, mji, bei na kategoria. Bei za Tanzania kwa Shilingi ya Tanzania.",
};

type PageProps = {
  searchParams: Promise<{
    kategoria?: string;
    kipengele?: string;
    mkoa?: string;
    mji?: string;
    bei?: string;
    q?: string;
    sort?: string;
  }>;
};

export default function AllProductsPage({ searchParams }: PageProps) {
  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Njia" className="text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent">Nyumbani</Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-ink-700">Bidhaa</li>
        </ol>
      </nav>

      <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-2xl bg-cream-200" />}>
        <ProductGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function parseFilters(params: Awaited<PageProps["searchParams"]>): ProductFilters {
  const { kategoria, kipengele, mkoa, mji, bei, q, sort } = params;
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  if (bei === "chini-20") maxPrice = 19_999;
  else if (bei === "20-40") {
    minPrice = 20_000;
    maxPrice = 40_000;
  } else if (bei === "juu-40") minPrice = 40_001;

  return {
    category: kategoria || null,
    feature: kipengele || null,
    region: mkoa || null,
    city: mji || null,
    minPrice,
    maxPrice,
    query: q || null,
    sort: isSortKey(sort) ? sort : "maarufu",
  };
}

async function ProductGrid({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  await connection();
  const all = listProducts();
  const filtered = filterProducts(all, filters);
  const counts = filterCounts(all, filters);

  const activeCategory = filters.category
    ? categories.find((category) => category.slug === filters.category)
    : undefined;
  const heading =
    filters.feature === "mpya"
      ? "Bidhaa mpya"
      : filters.feature === "punguzo"
        ? "Punguzo"
        : filters.query
          ? `Matokeo ya "${filters.query}"`
          : filters.city
            ? `Bidhaa — ${filters.city}`
            : filters.region
              ? `Bidhaa — ${filters.region}`
              : "Bidhaa zote";

  return (
    <>
      <div className="mt-6 rounded-[2rem] border border-cream-300 bg-cream-100 p-6 shadow-[0_18px_40px_-32px_rgba(38,28,22,0.35)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Duka letu</p>
            <h1 className="heading-display mt-2">{activeCategory ? activeCategory.name : heading}</h1>
            <p className="mt-3 max-w-2xl text-ink-500">
              {activeCategory
                ? activeCategory.description
                : "Chuja kwa mkoa, mji, bei au kategoria ili kupata bidhaa inayokufaa."}
            </p>
          </div>
          <p className="rounded-full border border-brand-200 bg-surface px-3 py-1.5 text-sm font-medium text-accent">
            {filtered.length} bidhaa zimepatikana
          </p>
        </div>
      </div>

      <div className="mt-8">
        <CatalogFilters counts={counts} />
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card mt-10 p-10 text-center">
          <p className="font-display text-xl text-ink-900">Hakuna bidhaa zinazolingana na vichujio vyako</p>
          <p className="mt-2 text-sm text-ink-500">Jaribu kuondoa kichujio kimoja au vinjari bidhaa zote.</p>
          <Link href="/bidhaa" className="btn-primary mt-6">Ona bidhaa zote</Link>
        </div>
      )}
    </>
  );
}
