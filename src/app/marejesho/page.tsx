import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Returns",
  description:
    "Niffer Cosmetics return and exchange policy.",
};

const can = [
  "The product is unused and in its original condition",
  "Return within 7 days of receiving your order",
  "Provide your receipt or order number",
  "Refund or product exchange",
];

const cannot = [
  "Opened or used products",
  "Products applied directly to the skin, such as mascara and lipstick",
  "Orders received more than 7 days ago",
];

export default function ReturnsPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Customer service</p>
      <h1 className="heading-display mt-2">Returns & Exchanges</h1>
      <p className="mt-3 text-ink-500">
        If an item is incorrect or does not meet your expectations, we are here to help.
        We want you to shop with confidence.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-success-600">
            <CheckIcon className="h-5 w-5" />
            Accepted
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            {can.map((c) => (
              <li key={c} className="flex gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-danger-600">
            <CloseIcon className="h-5 w-5" />
            Not accepted
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
            {cannot.map((c) => (
              <li key={c} className="flex gap-2">
                <CloseIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink-900">
          How to return an item
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-ink-500">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-accent">
              1
            </span>
            <p>
              Contact us within 7 days via WhatsApp or phone, uonyeshe
              your order number.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-accent">
              2
            </span>
            <p>
              We will provide instructions for returning the product (kupitia duka letu au
              courier).
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-accent">
              3
            </span>
            <p>
              After we receive and inspect the item, we will arrange a refund or
              ubadilishaji.
            </p>
          </li>
        </ol>
        <div className="mt-8">
          <Link href="/wasiliana" className="btn-primary">
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
