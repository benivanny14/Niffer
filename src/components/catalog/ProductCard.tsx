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

const badgeStyles: Record<Product["badges"][number], string> = {
  new: "bg-success-100 text-success-600",
  bestseller: "bg-gold-100 text-gold-700",
  sale: "bg-danger-100 text-danger-600",
  "low-stock": "bg-warning-100 text-warning-600",
};

const badgeLabels: Record<Product["badges"][number], string> = {
  new: "Mpya",
  bestseller: "Kinachouzwa zaidi",
  sale: "Punguzo",
  "low-stock": "Zimebaki kidogo",
};

const subscribeNoop = () => () => {};

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.priceTsh, product.compareAtTsh);
  const stock = useStock(product.slug);
  const outOfStock = stock === 0;
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-200">
        <Link href={`/bidhaa/${product.slug}`} className="block h-full w-full" aria-label={product.name}>
          <ProductImage
            src={product.image}
            alt={product.imageAlt}
            priority={false}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {product.badges.length > 0 ? (
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.badges.map((badge) => (
              <span key={badge} className={`badge ${badgeStyles[badge]}`}>
                {badgeLabels[badge]}
              </span>
            ))}
          </div>
        ) : null}

        {discount ? (
          <span className="badge absolute right-3 top-14 bg-brand-700 text-white shadow-sm">
            -{discount}%
          </span>
        ) : null}

        <WishlistButton slug={product.slug} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg leading-snug text-ink-900">
          <Link href={`/bidhaa/${product.slug}`} className="transition-colors hover:text-accent">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-ink-500">{product.shortDescription}</p>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-ink-900">{formatTsh(product.priceTsh)}</span>
          {product.compareAtTsh ? (
            <span className="text-sm text-ink-300 line-through">{formatTsh(product.compareAtTsh)}</span>
          ) : null}
        </div>

        {mounted && outOfStock ? (
          <span className="mt-1 text-sm font-medium text-danger-600">Imeisha</span>
        ) : mounted && stock <= 5 ? (
          <span className="mt-1 text-sm font-medium text-warning-600">Zimebaki {stock} tu</span>
        ) : null}

        <div className="mt-auto pt-2">
          <AddToCartButton slug={product.slug} disabled={mounted && outOfStock} />
        </div>
      </div>
    </article>
  );
}
