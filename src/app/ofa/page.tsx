import type { Metadata } from "next";
import Link from "next/link";
import { formatTsh } from "@/lib/format";
import { products, saleProducts, newArrivals } from "@/lib/data/catalog";
import { promoCodes } from "@/lib/promo";
import { ProductCard } from "@/components/catalog/ProductCard";
import { site } from "@/lib/site";
import { ChatIcon, TagIcon, TruckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Ofa na Punguzo",
  description:
    "Punguzo maalum, ofa za wiki na bundles za Niffer Cosmetics — kununua sasa ni rahisi na bei nafuu.",
};

const bundles = [
  {
    slug: "rutini-ya-asubuhi",
    title: "Bundle: Rutini ya Asubuhi",
    description: "Cleanser + Vitamin C Serum + Sunscreen — hatua tatu za asubuhi.",
    slugs: [
      "gentle-foam-cleanser",
      "radiance-vitamin-c-serum",
      "sun-shield-spf50",
    ],
    discountPercent: 12,
  },
  {
    slug: "urembo-kamili",
    title: "Bundle: Urembo Kamili",
    description: "Lipstick set + Mascara + Brashi — kwa matukio maalum.",
    slugs: [
      "velvet-matte-lipstick-set",
      "volumizing-mascara",
      "pro-makeup-brush-set",
    ],
    discountPercent: 10,
  },
  {
    slug: "nywele-zenye-afya",
    title: "Bundle: Nywele Zenye Afya",
    description: "Shampoo + Conditioner — ratiba kamili ya wiki.",
    slugs: ["argan-repair-shampoo", "silk-touch-conditioner"],
    discountPercent: 8,
  },
];

export default function OffersPage() {
  const onSale = saleProducts();
  const fresh = newArrivals();

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Ofa maalum</p>
      <h1 className="heading-display mt-2">Ofa na punguzo</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Tunapunguza bei kwa bidhaa zilizochaguliwa kila mwezi. Kumbuka: stoo ni
        ndogo kwa baadhi ya bidhaa — nakamsha unapohitaji.
      </p>

      {/* Vihudumisho */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: TagIcon,
            title: "Punguzo hadi 18%",
            description: "Kwa bidhaa zilizo kwenye punguzo hivi karibuni",
          },
          {
            icon: TruckIcon,
            title: "Usafirishaji bure",
            description: `Dar es Salaam kwa oda zaidi ya ${formatTsh(site.freeShippingThresholdTsh)}`,
          },
          {
            icon: ChatIcon,
            title: "Oda ya WhatsApp",
            description: "Unaweza kuagiza kwa haraka kwa WhatsApp",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div key={title} className="card flex items-start gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
              <p className="mt-0.5 text-sm text-ink-500">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Punguzo */}
      {onSale.length > 0 ? (
        <section className="mt-14">
          <h2 className="heading-display">Punguzo la muda</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {onSale.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Misimbo ya punguzo */}
      <section className="mt-14">
        <h2 className="heading-display">Misimbo ya punguzo</h2>
        <p className="mt-3 max-w-2xl text-ink-500">
          Tumia msimbo kwenye hatua ya malipo ili upate punguzo lako.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {promoCodes.map((promo) => (
            <li key={promo.code} className="card flex flex-col p-5">
              <span className="badge self-start bg-brand-100 text-brand-700">
                <TagIcon className="h-3.5 w-3.5" />
                {promo.code}
              </span>
              <p className="mt-3 font-display text-lg text-ink-900">
                {promo.label}
              </p>
              {promo.minSubtotalTsh ? (
                <p className="mt-1 text-xs text-ink-400">
                  Oda ya angalau {formatTsh(promo.minSubtotalTsh)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* Bundles */}
      <section className="mt-14">
        <h2 className="heading-display">Bundle — nunua pamoja, ongeza faida</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const items = bundle.slugs
              .map((s) => products.find((p) => p.slug === s))
              .filter((p): p is NonNullable<typeof p> => p !== undefined);
            const total = items.reduce((s, p) => s + p.priceTsh, 0);
            const bundlePrice = Math.round(
              total * (1 - bundle.discountPercent / 100),
            );
            return (
              <li key={bundle.slug} className="card flex flex-col p-6">
                <span className="badge bg-gold-100 text-gold-700">
                  Punguzo {bundle.discountPercent}%
                </span>
                <h3 className="mt-3 font-display text-xl text-ink-900">
                  {bundle.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-500">
                  {bundle.description}
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={`/bidhaa/${item.slug}`}
                        className="text-ink-700 hover:text-brand-700"
                      >
                        {item.name}
                      </Link>
                      <span className="text-ink-400">
                        {formatTsh(item.priceTsh)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-cream-200 pt-3">
                  <span className="text-sm text-ink-400 line-through">
                    {formatTsh(total)}
                  </span>
                  <span className="font-display text-xl text-brand-700">
                    {formatTsh(bundlePrice)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/bidhaa/${item.slug}`}
                      className="btn-outline flex-1 px-3 py-2 text-xs"
                    >
                      Nunua {item.name.split(" ")[0]}
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Mpya */}
      {fresh.length > 0 ? (
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Zilizofika hivi karibuni</p>
              <h2 className="heading-display mt-2">Bidhaa mpya</h2>
            </div>
            <Link
              href="/bidhaa?kipengele=mpya"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Zote mpya →
            </Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fresh.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
