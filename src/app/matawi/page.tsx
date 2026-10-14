import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { MapPinIcon } from "@/components/ui/icons";
import { BranchExplorer } from "@/components/branches/BranchExplorer";

export const metadata: Metadata = {
  title: "Our Locations",
  description:
    "Visit Niffer Cosmetics locations — Dar es Salaam, Mwanza, and Arusha. Get in-person product advice.",
};

const branches = [
  {
    name: "Niffer Cosmetics — Samora (Branch)",
    city: "Dar es Salaam",
    address: "Samora Street, near Msimbazi Post Office",
    hours: "Monday–Saturday · 9:00–20:00",
    phone: "+255 754 000 000",
    phoneTel: "+255754000000",
    flagship: true,
    services: ["Product advice", "Product displays", "Mobile money payments"],
  },
  {
    name: "Niffer Cosmetics — Mwanza",
    city: "Mwanza",
    address: "Nyakato, Buzazi Street, near Buzazi Market",
    hours: "Monday–Saturday · 9:00–19:00",
    phone: "+255 754 000 100",
    phoneTel: "+255754000100",
    flagship: false,
    services: ["Product advice", "Mobile money payments"],
  },
  {
    name: "Niffer Cosmetics — Arusha",
    city: "Arusha",
    address: "Sokoni, Uhuru Street, near the Clock Tower",
    hours: "Monday–Saturday · 9:00–19:00",
    phone: "+255 754 000 200",
    phoneTel: "+255754000200",
    flagship: false,
    services: ["Product advice", "Mobile money payments"],
  },
];

export default function BranchesPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Visit Niffer</p>
      <h1 className="heading-display mt-2">Our locations</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Visit our branches to see products in person and get
        free advice, and pay by mobile money. For quick orders, contact us on WhatsApp.
      </p>

      {/* Choose a city (?eneo=) */}
      <div className="mt-10">
        <Suspense
          fallback={<div className="h-10 w-64 animate-pulse rounded-full bg-cream-200" />}
        >
          <BranchExplorer branches={branches} />
        </Suspense>
      </div>

      {/* Branch map */}
      <section className="card mt-12 overflow-hidden">
        <div className="relative aspect-video bg-cream-200">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <MapPinIcon className="h-12 w-12 text-brand-600" />
            <p className="font-display text-xl text-ink-900">
              Our locations map
            </p>
            <p className="max-w-md px-4 text-sm text-ink-500">
              A Google Maps view will be available here to help you find directions
              for quick help at your nearest branch.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-ink-500">
            Flagship store: {site.address} · {site.hours}
          </p>
          <Link href="/wasiliana" className="text-sm font-semibold text-accent hover:underline">
            Contact us →
          </Link>
        </div>
      </section>
    </div>
  );
}
