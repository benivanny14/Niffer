import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ClockIcon, MapPinIcon, TruckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Shipping & Payments",
  description:
    "Delivery details, costs, estimated arrival times and payment methods at Niffer Cosmetics.",
};

const zones = [
  {
    zone: "Dar es Salaam",
    time: "1–2 days",
    fee: "TSh 3,000 · Free on orders over TSh 50,000",
  },
  {
    zone: "Other mainland regions",
    time: "2–5 days",
    fee: "TSh 5,000–10,000 depending on distance",
  },
  {
    zone: "Zanzibar",
    time: "3–6 days",
    fee: "TSh 8,000",
  },
];

export default function ShippingPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Customer service</p>
      <h1 className="heading-display mt-2">Shipping & Payments</h1>
      <p className="mt-3 text-ink-500">
        We aim to deliver your order safely and on time. Here is the
        full delivery information.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink-900">
          Delivery
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-cream-300">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Estimated time</th>
                <th className="px-4 py-3">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 bg-surface">
              {zones.map((z) => (
                <tr key={z.zone}>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {z.zone}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{z.time}</td>
                  <td className="px-4 py-3 text-ink-500">{z.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm text-ink-500">
          <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          Delivery is free in Dar es Salaam on orders over TSh 50,000.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink-900">
          Payment methods
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { name: "M-Pesa", note: "Pay with your phone" },
            { name: "Mixx by Yas", note: "Pay with your phone" },
            { name: "Airtel Money", note: "Pay with your phone" },
            { name: "Cash on delivery", note: "Pay when your order arrives" },
          ].map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between rounded-xl border border-cream-300 bg-surface px-4 py-3"
            >
              <span className="font-medium text-ink-900">{p.name}</span>
              <span className="text-sm text-ink-500">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="flex items-center gap-2 font-medium text-ink-900">
            <ClockIcon className="h-5 w-5 text-brand-600" />
            Opening hours
          </p>
          <p className="mt-2 text-sm text-ink-500">{site.hours}</p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-2 font-medium text-ink-900">
            <MapPinIcon className="h-5 w-5 text-brand-600" />
            Our address
          </p>
          <p className="mt-2 text-sm text-ink-500">{site.address}</p>
        </div>
      </section>
    </div>
  );
}
