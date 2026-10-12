import type { Metadata } from "next";
import Link from "next/link";
import { site, waLink } from "@/lib/site";
import {
  ChatIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Matawi Yetu",
  description:
    "Tembelea matawi ya Niffer Cosmetics — Dar es Salaam, Mwanza na Arusha. Pata ushauri wa bure wa urembo.",
};

const branches = [
  {
    name: "Niffer Cosmetics — Samora (Daraja)",
    city: "Dar es Salaam",
    address: "Mtaa wa Samora, karibu na Posta ya Msimbazi",
    hours: "Jumatatu–Jumamosi · 9:00–20:00",
    phone: "+255 754 000 000",
    phoneTel: "+255754000000",
    flagship: true,
    services: ["Ushauri wa bure", "Maonyesho ya bidhaa", "Malipo ya mobile money"],
  },
  {
    name: "Niffer Cosmetics — Mwanza",
    city: "Mwanza",
    address: "Nyakato, Mtaa wa Buzazi, karibu na Soko la Buzazi",
    hours: "Jumatatu–Jumamosi · 9:00–19:00",
    phone: "+255 754 000 100",
    phoneTel: "+255754000100",
    flagship: false,
    services: ["Ushauri wa bure", "Malipo ya mobile money"],
  },
  {
    name: "Niffer Cosmetics — Arusha",
    city: "Arusha",
    address: "Sokoni, Mtaa wa Uhuru, karibu na Clock Tower",
    hours: "Jumatatu–Jumamosi · 9:00–19:00",
    phone: "+255 754 000 200",
    phoneTel: "+255754000200",
    flagship: false,
    services: ["Ushauri wa bure", "Malipo ya mobile money"],
  },
];

export default function BranchesPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Tembelea Niffer</p>
      <h1 className="heading-display mt-2">Matawi yetu</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Unaweza kutembelea matawi yetu kujiona bidhaa halisi, kupata ushauri wa
        bure, na kulipa kwa mobile money. Kwa oda za haraka, tumia WhatsApp.
      </p>

      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <li
            key={branch.name}
            className={`card flex flex-col p-6 ${
              branch.flagship ? "border-brand-300" : ""
            }`}
          >
            {branch.flagship ? (
              <span className="badge mb-3 self-start bg-gold-100 text-gold-700">
                Tawi kuu
              </span>
            ) : null}
            <h2 className="font-display text-xl text-ink-900">{branch.name}</h2>
            <ul className="mt-4 flex-1 space-y-3 text-sm text-ink-500">
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {branch.address}
              </li>
              <li className="flex items-start gap-2.5">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {branch.hours}
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <a
                  href={`tel:${branch.phoneTel}`}
                  className="transition-colors hover:text-accent"
                >
                  {branch.phone}
                </a>
              </li>
            </ul>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {branch.services.map((service) => (
                <li
                  key={service}
                  className="rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-ink-500"
                >
                  {service}
                </li>
              ))}
            </ul>
            <a
              href={waLink(
                `Habari ${site.name}, nina swali kuhusu tawi la ${branch.city}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-5 w-full"
            >
              <ChatIcon className="h-4 w-4" />
              WhatsApp tawi la {branch.city}
            </a>
          </li>
        ))}
      </ul>

      {/* Ramani ya eneo */}
      <section className="card mt-12 overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-brand-100 via-cream-200 to-gold-100">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <MapPinIcon className="h-12 w-12 text-brand-600" />
            <p className="font-display text-xl text-ink-900">
              Ramani ya matawi yetu
            </p>
            <p className="max-w-md px-4 text-sm text-ink-500">
              Kwenye tovuti halisi, tunaweka Google Maps hapa ili upate mwelekeo
              wa haraka kwa twi lako linalokaribu.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-ink-500">
            Tawi kuu: {site.address} · {site.hours}
          </p>
          <Link href="/wasiliana" className="text-sm font-semibold text-accent hover:underline">
            Wasiliana nasi →
          </Link>
        </div>
      </section>
    </div>
  );
}
