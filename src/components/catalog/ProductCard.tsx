"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Product } from "@/lib/data/catalog";
import { formatTsh, discountPercent } from "@/lib/format";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductImage } from "@/components/media/ProductImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { useStock } from "@/lib/stock";
import { arrayOrEmpty } from "@/lib/api";

const badgeStyles: Record<Product["badges"][number], string> = {
  new: "bg-success-100 text-success-600",
  bestseller: "bg-gold-100 text-gold-700",
  sale: "bg-danger-100 text-danger-600",
  "low-stock": "bg-warning-100 text-warning-600",
};

const badgeLabels: Record<Product["badges"][number], string> = {
  new: "New",
  bestseller: "Bestseller",
  sale: "Sale",
  "low-stock": "Low stock",
};

const subscribeNoop = () => () => {};

export function ProductCard({ product }: { product: Product }) {
  const badges = arrayOrEmpty<Product["badges"][number]>(product.badges);
  const discount = discountPercent(product.priceTsh, product.compareAtTsh);
  const stock = useStock(product.slug);
  const outOfStock = stock === 0;
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  return (
    <article className="product-card group flex h-full flex-col overflow-hidden">
      <div className="product-card__media relative aspect-[4/5] overflow-hidden bg-cream-200">
        <Link href={`/bidhaa/${product.slug}`} className="block h-full w-full" aria-label={product.name}>
          <ProductImage
            src={product.image}
            alt={product.imageAlt}
            fit="contain"
            priority={false}
            className="h-full w-full"
          />
        </Link>

        {badges.length > 0 ? (
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1 sm:left-3 sm:top-3">
            {badges.map((badge) => (
              <span key={badge} className={`badge px-1.5 py-1 text-[9px] sm:px-2 sm:text-[10px] ${badgeStyles[badge]}`}>
                {badgeLabels[badge]}
              </span>
            ))}
          </div>
        ) : null}

        {discount ? (
          <span className="badge absolute right-2 top-11 bg-brand-700 px-1.5 py-1 text-[9px] text-white sm:right-3 sm:top-14 sm:px-2 sm:text-[10px]">
            -{discount}%
          </span>
        ) : null}

        <WishlistButton slug={product.slug} className="absolute right-3 top-3" />
      </div>

      <div className="product-card__body flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.6em] font-sans text-sm font-medium leading-snug text-ink-900 sm:text-base">
          <Link href={`/bidhaa/${product.slug}`} className="transition-colors hover:text-accent">
            {product.name}
          </Link>
        </h3>
        <p className="hidden line-clamp-2 text-sm text-ink-500 sm:block">{product.shortDescription}</p>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

        <div className="product-card__price mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold leading-tight text-ink-900 sm:text-lg">{formatTsh(product.priceTsh)}</span>
          {product.compareAtTsh ? (
            <span className="text-xs text-ink-500 line-through">{formatTsh(product.compareAtTsh)}</span>
          ) : null}
        </div>

        {mounted && outOfStock ? (
          <span className="mt-1 text-sm font-medium text-danger-600">Out of stock</span>
        ) : mounted && stock <= 5 ? (
          <span className="mt-1 text-sm font-medium text-warning-600">Only {stock} left</span>
        ) : null}

        <div className="mt-auto pt-2">
          <AddToCartButton slug={product.slug} disabled={mounted && outOfStock} />
        </div>
      </div>
    </article>
  );
}
