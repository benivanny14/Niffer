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
      <p className="eyebrow">Hifadhi yako</p>
      <h1 className="heading-display mt-2">Bidhaa unazopenda</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Hifadhi bidhaa unazopenda ili zipate pale unapohitaji. Zinahifadhiwa
        kwenye kifaa chako.
      </p>

      {items.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <HeartIcon className="mx-auto h-14 w-14 text-ink-300" />
          <p className="font-display mt-6 text-xl text-ink-900">
            Bado hujahifadhi bidhaa yoyote
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Bofya alama ya moyo kwenye bidhaa yoyote ili kuiongeza hapa.
          </p>
          <Link href="/bidhaa" className="btn-primary mt-6">
            Vinjari Bidhaa
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
