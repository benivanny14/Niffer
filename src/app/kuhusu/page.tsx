import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import {
  ChatIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About Niffer Cosmetics",
  description:
    "Learn about Niffer Cosmetics, our online beauty store and how to reach our team.",
};

const values = [
  {
    icon: ShieldIcon,
    title: "Clear product details",
    body: "We share clear product information so you can make an informed choice before ordering.",
  },
  {
    icon: TruckIcon,
    title: "Reliable delivery",
    body: "Delivery fees and estimated arrival times are shown when you place your order.",
  },
  {
    icon: ChatIcon,
    title: "Friendly support",
    body: "We can help you choose products and answer questions before or after your purchase.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">About Niffer</p>
      <h1 className="heading-display mt-2 max-w-2xl">
        Beauty shopping made simple
      </h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-ink-500">
        Niffer Cosmetics is an online beauty store serving customers across Tanzania.
        Browse products, read the details and contact us if you need help before
        placing an order.
      </p>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {values.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg text-ink-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Our store</p>
          <h2 className="heading-display mt-2 text-3xl">
            Find what you need
          </h2>
          <p className="mt-4 leading-relaxed text-ink-500">
            Shop skincare, makeup, haircare and fragrance in one place. Compare
            product details before you order.
          </p>
          <p className="mt-4 leading-relaxed text-ink-500">
            Questions about products, payment or delivery? Our team is happy to
            help by phone, WhatsApp or email.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/bidhaa" className="btn-primary">
              Browse products
            </Link>
            <Link href="/wasiliana" className="btn-outline">
              Contact us
            </Link>
          </div>
        </div>
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-cream-200">
          <SparkleIcon className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-brand-300" />
        </div>
      </section>

      <section className="mt-16 rounded-2xl bg-cream-100 p-8">
        <h2 className="font-display text-2xl text-ink-900">Get in touch</h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-ink-500">Phone / WhatsApp</p>
            <a
              href={`tel:${site.phoneTel}`}
              className="font-medium text-accent hover:underline"
            >
              {site.phoneDisplay}
            </a>
          </div>
          <div>
            <p className="text-ink-500">Email</p>
            <a
              href={`mailto:${site.email}`}
              className="font-medium text-accent hover:underline"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="text-ink-500">Address</p>
            <p className="font-medium text-ink-900">{site.address}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
