import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { listProducts } from "@/lib/server/catalog";
import { ScentFinder } from "@/components/tools/ScentFinder";

export const metadata: Metadata = {
  title: "Tafuta Harufu Yako",
  description:
    "Jibu maswali mafupi na upate harufu zinazokufaa — perfumes na body mist za Niffer Cosmetics zilizopangwa kwa ladha yako.",
};

export default async function ScentFinderPage() {
  // Bidhaa za DB (perfumes/body mist halisi kutoka duka).
  await connection();
  const products = await listProducts();

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Zana ya bure</p>
      <h1 className="heading-display mt-2">Tafuta harufu yako</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Harufu ni ya kibinafsi. Jibu maswali matatu na tunakuletea chaguo
        zinazolingana na ladha na matukio yako.
      </p>

      <p className="mt-4 text-sm text-ink-500">
        Ngozi yako inahitaji utunzaji? Pia jaribu{" "}
        <Link href="/swali" className="font-semibold text-accent hover:underline">
          Swali la Utunzaji →
        </Link>
      </p>

      <div className="mt-8">
        <ScentFinder products={products} />
      </div>
    </div>
  );
}
