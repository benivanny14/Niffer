"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories } from "@/lib/data/catalog";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { CloseIcon, MenuIcon, SparkleIcon } from "@/components/ui/icons";

const navLinks = [
  { href: "/bidhaa", label: "Bidhaa" },
  { href: "/ofa", label: "Ofa" },
  { href: "/zawadi", label: "Zawadi" },
  { href: "/makala", label: "Makala" },
  { href: "/swali", label: "Zana Bure" },
  { href: "/matawi", label: "Matawi" },
  { href: "/kuhusu", label: "Kuhusu" },
  { href: "/wasiliana", label: "Wasiliana" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Funga menu ya simu ukibofya mahali popote nje ya drawer.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-50/90 backdrop-blur">
      <div className="bg-brand-800 text-white">
        <div className="container-x flex min-h-9 items-center justify-center gap-2 py-1.5 text-xs leading-snug">
          <SparkleIcon className="hidden h-3.5 w-3.5 shrink-0 text-gold-500 sm:block" />
          <p className="text-center">
            Usafirishaje bure Dar es Salaam kwa oda zaidi ya TSh 50,000 ·
            Malipo salama: M-Pesa, Mixx by Yas, Airtel Money
          </p>
        </div>
      </div>

      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <SparkleIcon className="h-7 w-7 text-accent" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-ink-900">
              Niffer
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">
              Cosmetics
            </span>
          </span>
        </Link>

        <nav aria-label="Menyu kuu" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-ink-700 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <HeaderControls />
          <button
            type="button"
            className="rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Funga menyu" : "Fungua menyu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-cream-300 bg-cream-50 lg:hidden"
        >
          <nav aria-label="Menyu ya simu" className="container-x py-4">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-5 px-3">Kategoria</p>
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/bidhaa?kategoria=${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
