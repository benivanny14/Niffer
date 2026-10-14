import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BulkCalculator, RfqForm } from "@/components/wholesale/JumlaPortal";
import { listProducts } from "@/lib/server/catalog";
import { bulkTiers as tiers } from "@/lib/wholesale";
import { ShieldIcon, TruckIcon, TagIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Wholesale pricing, bulk discounts, and quote requests for retailers, salons, and beauty shops across Tanzania.",
};

const benefits = [
  {
    icon: TagIcon,
    title: "Wholesale pricing",
    description: "Save up to 22% depending on your order quantity.",
  },
  {
    icon: TruckIcon,
    title: "Delivery benefits",
    description: "Free delivery in Dar es Salaam on wholesale orders.",
  },
  {
    icon: ShieldIcon,
    title: "Authentic products",
    description: "Every product is sourced from trusted suppliers.",
  },
];

export default async function WholesalePage() {
  // Bidhaa za DB kwa kikokotoo na fomu ya RFQ.
  await connection();
  const products = await listProducts();

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Wholesale portal</p>
      <h1 className="heading-display mt-2">Wholesale</h1>
      <p className="mt-3 max-w-2xl text-ink-500">Sell Niffer Cosmetics products in your salon, shop, or online. We offer wholesale pricing and support to retailers across Tanzania.</p>

      {/* Portali: fuatilia ombi */}
      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 border-brand-300 p-6">
        <div>
          <h2 className="font-display text-xl text-ink-900">
            Already submitted a quote request?
          </h2>
          <p className="mt-1 text-sm text-ink-500">Track your quote request and the price set by our team using the phone number you submitted.</p>
        </div>
        <Link href="/jumla/ombi" className="btn-primary">
          Track my request
        </Link>
      </div>

      {/* Faida */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {benefits.map(({ icon: Icon, title, description }) => (
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

      {/* Tier table */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink-900">
          Wholesale pricing for bulk orders
        </h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Tier</th>
                <th className="px-5 py-3 font-semibold">Quantity</th>
                <th className="px-5 py-3 font-semibold">Discount</th>
                <th className="px-5 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr
                  key={tier.label}
                  className="border-b border-cream-200 last:border-0"
                >
                  <td className="px-5 py-4 font-medium text-ink-900">
                    {tier.label}
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    {tier.min}+ {tier.max ? `– ${tier.max}` : " products"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge bg-brand-100 text-accent">
                      -{tier.discount}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-500">
                    {tier.max
                      ? "Great for new retailers"
                      : "For large orders and established stores"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Wholesale prices apply to all products unless they are already on
          discount. Discounts are calculated for each product in your order.
        </p>
      </section>

      {/* Kikokotoo cha bei ya jumla */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink-900">
          Calculate your price instantly
        </h2>
        <div className="mt-6">
          <BulkCalculator products={products} />
        </div>
      </section>

      {/* Fomu */}
      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-ink-900">
            Request wholesale pricing
          </h2>
          <p className="mt-3 text-ink-500">Complete this form and we will call you within 24 hours, Monday through Saturday, with a tailored quote.</p>
          <ul className="mt-6 space-y-3 text-sm text-ink-500">
            <li>• We accept M-Pesa, Mixx by Yas, and Airtel Money</li>
            <li>• Free delivery in Dar es Salaam on wholesale orders</li>
            <li>• A 50% deposit is required for orders over TSh 1,000,000</li>
          </ul>
          <p className="mt-6 text-sm text-ink-500">
            Need advice?{" "}
            <Link
              href="/wasiliana"
              className="font-medium text-accent hover:underline"
            >
              Contact us
            </Link>{" "}
            or call us.
          </p>
        </div>
        <RfqForm products={products} />
      </section>
    </div>
  );
}
