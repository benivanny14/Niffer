import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  products,
  type Product,
} from "@/lib/data/catalog";
import { findProduct, listProducts } from "@/lib/server/catalog";
import { listReviews } from "@/lib/server/leads";
import { formatTsh, discountPercent } from "@/lib/format";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductCard } from "@/components/catalog/ProductCard";
import { BuyBox } from "@/components/catalog/BuyBox";
import { ReviewForm } from "@/components/ui/ReviewForm";
import {
  ArrowRightIcon,
  MapPinIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/ui/icons";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // Union ya katalogi ya ndani + DB (bidhaa za admin).
  try {
    const fromDb = listProducts().map((p) => ({ slug: p.slug }));
    const seen = new Set<string>();
    const merged: { slug: string }[] = [];
    for (const { slug } of [...products.map((p) => ({ slug: p.slug })), ...fromDb]) {
      if (!seen.has(slug)) {
        seen.add(slug);
        merged.push({ slug });
      }
    }
    return merged;
  } catch {
    return products.map((product) => ({ slug: product.slug }));
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Bidhaa haipo" };

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

const badgeLabels: Record<Product["badges"][number], string> = {
  new: "Mpya",
  bestseller: "Kinachouzwa zaidi",
  sale: "Punguzo",
  "low-stock": "Zimebaki kidogo",
};

export default function ProductPage({ params }: PageProps) {
  // params ni URL data — Suspense hukuruhusu instant navigation (App Shell).
  return (
    <div className="container-x py-10 lg:py-14">
      <Suspense
        fallback={
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse rounded-3xl bg-cream-200" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-cream-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-cream-200" />
              <div className="h-24 animate-pulse rounded-xl bg-cream-200" />
            </div>
          </div>
        }
      >
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: PageProps) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const discount = discountPercent(product.priceTsh, product.compareAtTsh);
  // Hakiki zote (pamoja na mpya kutoka DB) kwa bidhaa hii.
  await connection();
  const productReviews = listReviews(300).filter(
    (r) => r.productSlug === product.slug,
  );
  // Bidhaa zinazohusiana kutoka DB (kategoria ile ile).
  const related = listProducts()
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Nyumbani", path: "/" },
              { name: "Bidhaa", path: "/bidhaa" },
              { name: product.name, path: `/bidhaa/${product.slug}` },
            ]),
          ),
        }}
      />
      {/* Breadcrumb */}
      <nav aria-label="Njia" className="text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent">
              Nyumbani
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/bidhaa" className="hover:text-accent">
              Bidhaa
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-ink-700">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery — placeholder hadi media module */}
        <div className="relative aspect-[4/5] animate-fade-in overflow-hidden rounded-3xl border border-cream-300 bg-gradient-to-br from-brand-100 via-cream-200 to-gold-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <SparkleIcon className="h-24 w-24 text-brand-300" />
          </div>
          {product.badges.length > 0 ? (
            <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="badge bg-surface/90 text-accent shadow-sm"
                >
                  {badgeLabels[badge]}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="animate-fade-up">
          <p className="eyebrow">{product.category}</p>
          <h1 className="heading-display mt-2">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="md"
            />
            <span className="text-sm text-ink-400">
              {productReviews.length > 0
                ? `${productReviews.length} maoni kwenye duka letu`
                : "Hakuna maoni bado"}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl text-ink-900">
              {formatTsh(product.priceTsh)}
            </span>
            {product.compareAtTsh ? (
              <span className="text-lg text-ink-300 line-through">
                {formatTsh(product.compareAtTsh)}
              </span>
            ) : null}
            {discount ? (
              <span className="badge bg-danger-100 text-danger-600">
                -{discount}%
              </span>
            ) : null}
          </div>

          <p className="mt-5 leading-relaxed text-ink-500">
            {product.shortDescription}
          </p>

          <ul className="mt-6 space-y-2.5 border-y border-cream-300 py-5 text-sm text-ink-500">
            <li className="flex items-center gap-2.5">
              <TruckIcon className="h-4 w-4 shrink-0 text-brand-600" />
              Usafirishaji Dar es Salaam ndani ya siku 1–2
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldIcon className="h-4 w-4 shrink-0 text-brand-600" />
              Bidhaa halisi 100% · malipo poa baada ya kupokea
            </li>
            {product.region || product.city ? (
              <li className="flex items-center gap-2.5">
                <MapPinIcon className="h-4 w-4 shrink-0 text-brand-600" />
                Inapatikana:{" "}
                {[product.city, product.region].filter(Boolean).join(", ")}
              </li>
            ) : null}
          </ul>

          <BuyBox product={product} />
        </div>
      </div>

      {/* Maoni ya bidhaa hii + fomu ya kuacha hakiki */}
      <section className="mt-16">
        <h2 className="heading-display">
          {productReviews.length > 0
            ? "Maoni ya bidhaa hii"
            : "Acha hakiki yako"}
        </h2>
        {productReviews.length > 0 ? (
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {productReviews.map((review) => (
              <li key={review.id}>
                <figure className="card flex h-full flex-col gap-3 p-6">
                  <RatingStars rating={review.rating} size="md" />
                  <blockquote className="text-sm leading-relaxed text-ink-700">
                    “{review.comment}”
                  </blockquote>
                  <figcaption className="mt-auto pt-2 text-sm">
                    <span className="font-semibold text-ink-900">
                      {review.customerName}
                    </span>
                    <span className="text-ink-400"> · {review.location}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink-500">
            Kuwa wa kwanza kustaafisha bidhaa hii — hakiki yako inasaidia
            wateja wengine kuchagua vizuri.
          </p>
        )}
        <div className="mt-8 max-w-2xl">
          <ReviewForm defaultSlug={product.slug} defaultName={product.name} />
        </div>
      </section>

      {/* Bidhaa zinazohusiana */}
      {related.length > 0 ? (
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Endelea kuvinjari</p>
              <h2 className="heading-display mt-2">Bidhaa zinazohusiana</h2>
            </div>
            <Link
              href="/bidhaa"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
            >
              Zote
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
