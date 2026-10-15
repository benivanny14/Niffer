import type { Metadata } from "next";
import Link from "next/link";
import { formatTsh } from "@/lib/format";
import { connection } from "next/server";
import { listProducts } from "@/lib/server/catalog";
import { listAvailablePromoRules } from "@/lib/server/promo";
import { ProductCard } from "@/components/catalog/ProductCard";
import { site } from "@/lib/site";
import { ChatIcon, TagIcon, TruckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Offers & Discounts",
  description:
    "Special offers and bundles from Niffer Cosmetics — for a little extra value.",
};

const bundles = [
  {
    slug: "mwanachuo-starter",
    title: "Bundle: Mwanachuo Starter",
    description: "Mwanachuo Pack 45k + 65k — a starter skincare set for students.",
    slugs: ["mwanachuo-pack-45k", "mwanachuo-pack-65k-vaseline"],
    discountPercent: 12,
  },
  {
    slug: "purest-glow-duo",
    title: "Bundle: Purest Glow Duo",
    description: "Purest Glow Pack 65k + 100k — a brightening set at an affordable price.",
    slugs: ["purest-glow-pack-65k", "purest-glow-pack-100k"],
    discountPercent: 10,
  },
  {
    slug: "body-care-weekly",
    title: "Bundle: Body Care Weekly",
    description: "Body Pack 125k + Skincare Pack 175k — a complete weekly routine.",
    slugs: ["body-pack-125k", "skincare-pack-175k"],
    discountPercent: 8,
  },
];

export default async function OffersPage() {
  // Ofa kutoka DB (bei za admin) — dynamic render.
  await connection();
  const products = await listProducts();
  const promoCodes = await listAvailablePromoRules();
  const onSale = products.filter((p) => p.compareAtTsh);
  const fresh = products.filter((p) => p.badges.includes("new"));

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Special offers</p>
      <h1 className="heading-display mt-2">Offers & discounts</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Save on selected products throughout the month. Some items are available in limited
        quantities, so shop while they are in stock.
      </p>

      {/* Vihudumisho */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: TagIcon,
            title: "Save up to 18%",
            description: "On selected items",
          },
          {
            icon: TruckIcon,
            title: "Free delivery",
            description: `Dar es Salaam on orders over ${formatTsh(site.freeShippingThresholdTsh)}`,
          },
          {
            icon: ChatIcon,
            title: "Order on WhatsApp",
            description: "Message us to place an order",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div key={title} className="card flex items-start gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
              <p className="mt-0.5 text-sm text-ink-500">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Discount */}
      {onSale.length > 0 ? (
        <section className="mt-14">
          <h2 className="heading-display">Limited-time offers</h2>
          <ul className="product-grid mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {onSale.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Discount codes */}
      <section className="mt-14">
        <h2 className="heading-display">Discount codes</h2>
        <p className="mt-3 max-w-2xl text-ink-500">
          Enter a code at checkout to apply your discount.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {promoCodes.map((promo) => (
            <li key={promo.code} className="card flex flex-col p-5">
              <span className="badge self-start bg-brand-100 text-accent">
                <TagIcon className="h-3.5 w-3.5" />
                {promo.code}
              </span>
              <p className="mt-3 font-display text-lg text-ink-900">
                {promo.label}
              </p>
              {promo.minSubtotalTsh ? (
                <p className="mt-1 text-xs text-ink-400">
                  Minimum order {formatTsh(promo.minSubtotalTsh)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        {promoCodes.length === 0 ? <p className="mt-4 text-sm text-ink-500">There are no active discount codes right now.</p> : null}
      </section>

      {/* Bundles */}
      <section className="mt-14">
        <h2 className="heading-display">Bundles — shop together and save</h2>
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
                  Save {bundle.discountPercent}%
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
                        className="text-ink-700 hover:text-accent"
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
                  <span className="font-display text-xl text-accent">
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
                      Shop {item.name.split(" ")[0]}
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* New arrivals */}
      {fresh.length > 0 ? (
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Just arrived</p>
              <h2 className="heading-display mt-2">New arrivals</h2>
            </div>
            <Link
              href="/bidhaa?kipengele=mpya"
              className="text-sm font-semibold text-accent hover:text-accent"
            >
              View all new arrivals →
            </Link>
          </div>
          <ul className="product-grid mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
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
