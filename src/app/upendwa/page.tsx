"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { getProduct } from "@/lib/catalog-client";
import { ProductCard } from "@/components/catalog/ProductCard";
import { HeartIcon } from "@/components/ui/icons";

export default function WishlistPage() {
  const { wishlist, ready } = useStore();

  if (!ready) return null;

  const items = wishlist
    .map((slug) => getProduct(slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Your wishlist</p>
      <h1 className="heading-display mt-2">Your wishlist</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Save products you like so you can find them when needed. They are saved
        on your device.
      </p>

      {items.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <HeartIcon className="mx-auto h-14 w-14 text-ink-300" />
          <p className="font-display mt-6 text-xl text-ink-900">
            Your wishlist is empty
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Select the heart on any product to add it here.
          </p>
          <Link href="/bidhaa" className="btn-primary mt-6">
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
