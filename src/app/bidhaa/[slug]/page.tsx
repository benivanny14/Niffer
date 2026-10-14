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
import { ProductImage } from "@/components/media/ProductImage";
import { BuyBox } from "@/components/catalog/BuyBox";
import { ReviewForm } from "@/components/ui/ReviewForm";
import {
  ArrowRightIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/ui/icons";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Union ya katalogi ya ndani + DB (bidhaa za admin).
  try {
    const fromDb = (await listProducts()).map((p) => ({ slug: p.slug }));
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
  await connection();
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/bidhaa/${product.slug}` },
    openGraph: {
      type: "website",
      locale: "sw_TZ",
      siteName: "Niffer Cosmetics",
      title: product.name,
      description: product.shortDescription,
      url: `/bidhaa/${product.slug}`,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
  };
}

const badgeLabels: Record<Product["badges"][number], string> = {
  new: "New arrivals",
  bestseller: "Best seller",
  sale: "Discount",
  "low-stock": "Low stock",
};

export default async function ProductPage({ params }: PageProps) {
  // params ni URL data — Suspense hukuruhusu instant navigation (App Shell).
  return (
    <div className="container-x py-10 lg:py-14">
      <Suspense
        fallback={
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-cream-200" />
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
  await connection();
  const { slug } = await params;
  // Bidhaa + haziki huru — ZIP pamoja (kila round-trip ~250ms).
  const [all, rawReviews] = await Promise.all([
    listProducts(),
    listReviews(300),
  ]);
  const product = all.find((p) => p.slug === slug);
  if (!product) notFound();

  const discount = discountPercent(product.priceTsh, product.compareAtTsh);
  // Hakiki za bidhaa hii tu.
  const productReviews = rawReviews.filter((r) => r.productSlug === product.slug);
  // Related products (kategoria ile ile).
  const related = all
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
              { name: "Home", path: "/" },
              { name: "Products", path: "/bidhaa" },
              { name: product.name, path: `/bidhaa/${product.slug}` },
            ]),
          ),
        }}
      />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-ink-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/bidhaa" className="hover:text-accent">
              Products
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-ink-700">{product.name}</li>
        </ol>
      </nav>

      <div className="product-detail mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery — picha halisi ya bidhaa */}
        <div className="product-detail__gallery relative aspect-[4/5] animate-fade-in overflow-hidden rounded-2xl border border-cream-300 bg-cream-200">
          <ProductImage
            src={product.image}
            alt={product.imageAlt}
            fit="contain"
            priority
            className="h-full w-full"
          />
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
        <div className="product-detail__info animate-fade-up">
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
                ? `${productReviews.length} reviews in our store`
                : "No reviews yet"}
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
              Delivery in Dar es Salaam within 1–2 days
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldIcon className="h-4 w-4 shrink-0 text-brand-600" />
              Pay on delivery
            </li>
          </ul>

          <BuyBox product={product} />
        </div>
      </div>

      {/* Maoni ya bidhaa hii + fomu ya kuacha hakiki */}
      <section className="mt-16">
        <h2 className="heading-display">
          {productReviews.length > 0
            ? "Reviews for this product"
            : "Leave a review"}
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
            Be the first to review this product — your feedback helps others.
            other customers make informed choices.
          </p>
        )}
        <div className="mt-8 max-w-2xl">
          <ReviewForm defaultSlug={product.slug} defaultName={product.name} />
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 ? (
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Keep browsing</p>
              <h2 className="heading-display mt-2">Related products</h2>
            </div>
            <Link
              href="/bidhaa"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent"
            >
              All products
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
