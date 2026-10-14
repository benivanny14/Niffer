import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { listProducts } from "@/lib/server/catalog";
import { ScentFinder } from "@/components/tools/ScentFinder";

export const metadata: Metadata = {
  title: "Find Your Fragrance",
  description:
    "Answer a few questions to find fragrances that suit you — from Niffer Cosmetics that match your preferences.",
};

export default async function ScentFinderPage() {
  // Bidhaa za DB (perfumes/body mist halisi kutoka duka).
  await connection();
  const products = await listProducts();

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Free tool</p>
      <h1 className="heading-display mt-2">Find your fragrance</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Fragrance is personal. Answer three questions to see options
        matched to your taste and occasions.
      </p>

      <p className="mt-4 text-sm text-ink-500">
        Looking for a skincare routine? Try our{" "}
        <Link href="/swali" className="font-semibold text-accent hover:underline">
          Skincare routine quiz →
        </Link>
      </p>

      <div className="mt-8">
        <ScentFinder products={products} />
      </div>
    </div>
  );
}
