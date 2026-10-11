import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  categories,
  products,
  type CategorySlug,
} from "@/lib/data/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

export const metadata: Metadata = {
  title: "Bidhaa zote",
  description:
    "Vinjari bidhaa za Niffer Cosmetics: skincare, makeup, nywele, perfume na zaidi — bei za Tanzania kwa Shilingi ya Tanzania.",
};

type PageProps = {
  searchParams: Promise<{ kategoria?: string; kipengele?: string }>;
};


const isValidCategory = (value: string): value is CategorySlug =>
  categories.some((category) => category.slug === value);

export default function AllProductsPage({ searchParams }: PageProps) {
  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Njia" className="text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand-700">
              Nyumbani
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-ink-700">Bidhaa</li>
        </ol>
      </nav>

      {/* searchParams ni runtime data — Suspense hukuruhusu prerender shell. */}
      <Suspense
        fallback={
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-cream-200" />
        }
      >
        <ProductGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ProductGrid({ searchParams }: PageProps) {
  const { kategoria, kipengele } = await searchParams;
  const active = kategoria && isValidCategory(kategoria) ? kategoria : null;

  let filtered = products;
  if (active) {
    filtered = filtered.filter((product) => product.category === active);
  }
  if (kipengele === "mpya") {
    filtered = filtered.filter((product) => product.badges.includes("new"));
  }
  if (kipengele === "punguzo") {
    filtered = filtered.filter((product) => product.badges.includes("sale"));
  }

  const activeCategory = active
    ? categories.find((category) => category.slug === active)
    : undefined;
  const heading =
    kipengele === "mpya"
      ? "Bidhaa mpya"
      : kipengele === "punguzo"
        ? "Punguzo"
        : "Bidhaa zote";

  return (
    <>
      <div className="mt-6">
        <p className="eyebrow">Duka letu</p>
        <h1 className="heading-display mt-2">
          {activeCategory ? activeCategory.name : heading}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          {activeCategory
            ? activeCategory.description
            : "Chagua kategoria au vinjari bidhaa zote zilizochaguliwa kwa makini."}
        </p>
      </div>

      {/* Kichujio cha kategoria */}
      <ul className="mt-8 flex flex-wrap gap-2">
        <li>
          <Link
            href="/bidhaa"
            className={`badge border transition-colors ${
              !active
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-cream-300 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            Zote
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/bidhaa?kategoria=${category.slug}`}
              className={`badge border transition-colors ${
                active === category.slug
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-cream-300 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>

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
          <p className="font-display text-xl text-ink-900">
            Hakuna bidhaa kwenye kategoria hii bado
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Jaribu kategoria nyingine au vinjari bidhaa zote.
          </p>
          <Link href="/bidhaa" className="btn-primary mt-6">
            Ona bidhaa zote
          </Link>
        </div>
      )}
    </>
  );
}
