"use client";

import Link from "next/link";
import Image from "next/image";
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
  { href: "/akaunti", label: "Akaunti", mobileOnly: true },
  { href: "/upendwa", label: "Upendwa", mobileOnly: true },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    let active = true;
    const loadProfile = () => {
      fetch("/api/store-profile", { cache: "no-store" })
        .then((response) => response.ok ? response.json() as Promise<{ image?: string }> : null)
        .then((data) => { if (active && data) setProfileImage(data.image ?? ""); })
        .catch(() => undefined);
    };
    const onUpdated = (event: Event) => {
      const image = (event as CustomEvent<string>).detail;
      if (image) setProfileImage(image);
    };
    loadProfile();
    window.addEventListener("niffer:store-profile-updated", onUpdated);
    return () => {
      active = false;
      window.removeEventListener("niffer:store-profile-updated", onUpdated);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="site-header__announcement">
        <div className="container-x flex min-h-8 items-center justify-center gap-2 py-1 text-[11px] leading-snug">
          <SparkleIcon className="h-3.5 w-3.5 shrink-0 text-gold-500" />
          <p className="text-center">Usafirishaji bure Dar es Salaam kwa oda zaidi ya TSh 50,000 <span>·</span> Lipa kwa M-Pesa, Mixx, Airtel au baada ya kupokea</p>
        </div>
      </div>

      <div className="site-header__main container-x flex min-h-[5.25rem] items-center justify-between gap-3 py-2">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3" onClick={() => setOpen(false)} aria-label="Niffer Cosmetics, ukurasa wa mwanzo">
          <span className="relative h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-gold-500 via-brand-400 to-brand-800 p-[3px] shadow-lg shadow-black/25 sm:h-[4.5rem] sm:w-[4.5rem]">
            <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface text-accent ring-2 ring-surface">
              {profileImage ? (
                <Image src={profileImage} alt="Profile ya Niffer Cosmetics" fill unoptimized sizes="72px" className="object-cover" />
              ) : (
                <SparkleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              )}
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ink-900 sm:text-xl">
              Niffer
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-600 sm:text-[10px] sm:tracking-[0.3em]">
              Cosmetics
            </span>
          </span>
        </Link>

        <nav aria-label="Menyu kuu" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {navLinks
              .filter((link) => !link.mobileOnly)
              .map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="site-header__nav-link text-sm font-medium text-ink-700 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <div className="site-header__actions flex items-center gap-1">
          <HeaderControls />
          <button
            type="button"
            className="rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Funga menyu" : "Fungua menyu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
          <div id="mobile-menu" className="site-header__mobile border-t border-cream-300 bg-cream-50 lg:hidden">
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
