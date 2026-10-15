"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { categories as fallbackCategories, type Category } from "@/lib/data/catalog";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { CloseIcon, MenuIcon, SparkleIcon } from "@/components/ui/icons";

const navLinks = [
  { href: "/bidhaa", label: "Products" },
  { href: "/ofa", label: "Sale" },
  { href: "/zawadi", label: "Gifts" },
  { href: "/makala", label: "Journal" },
  { href: "/swali", label: "Free Tools" },
  { href: "/matawi", label: "Locations" },
  { href: "/kuhusu", label: "About" },
  { href: "/wasiliana", label: "Contact" },
  { href: "/akaunti", label: "Account", mobileOnly: true },
  { href: "/upendwa", label: "Wishlist", mobileOnly: true },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<Category[]>(fallbackCategories);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const directionDistance = useRef(0);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const previousY = lastScrollY.current;
        const delta = currentY - previousY;

        if (currentY < 72) {
          directionDistance.current = 0;
          setHidden(false);
        } else if (Math.abs(delta) >= 1) {
          const direction = Math.sign(delta);
          directionDistance.current = Math.sign(directionDistance.current) === direction
            ? directionDistance.current + delta
            : delta;

          if (directionDistance.current <= -18) {
            setHidden(false);
            directionDistance.current = 0;
          } else if (currentY > 180 && directionDistance.current >= 28 && !open) {
            setHidden(true);
            directionDistance.current = 0;
          }
        }

        lastScrollY.current = currentY;
        frame = 0;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    let active = true;
    fetch("/api/categories", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ categories?: Category[] }> : null)
      .then((data) => {
        if (active && Array.isArray(data?.categories)) setCategoryOptions(data.categories);
      })
      .catch(() => undefined);
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
    <header className={`site-header sticky top-0 z-40 ${hidden ? "site-header--hidden" : ""}`}>
      <div className="site-header__announcement">
        <div className="container-x flex min-h-8 items-center justify-center gap-2 py-1 text-[11px] leading-snug">
          <SparkleIcon className="h-3.5 w-3.5 shrink-0 text-gold-500" />
          <p className="text-center">Free delivery in Dar es Salaam on orders over TSh 50,000 <span>·</span> Pay with M-Pesa, Mixx, Airtel or on delivery</p>
        </div>
      </div>

      <div className="site-header__main container-x flex min-h-[5.25rem] items-center justify-between gap-3 py-1.5">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3" onClick={() => setOpen(false)} aria-label="Niffer Cosmetics home">
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.04] sm:h-[5.25rem] sm:w-[5.25rem]">
            <span aria-hidden className="absolute -inset-1 rounded-full border border-dashed border-gold-500/60 transition-transform duration-500 ease-out group-hover:rotate-90" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gold-500 via-brand-400 to-brand-800 p-[4px] shadow-[0_14px_30px_-16px_rgba(95,23,49,0.7)]">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-surface p-[3px]">
                <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-cream-100 text-accent">
                  {profileImage ? (
                    <Image src={profileImage} alt="Niffer Cosmetics profile" fill unoptimized sizes="84px" className="object-cover" />
                  ) : (
                    <SparkleIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                  )}
                </span>
              </span>
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

        <nav aria-label="Main menu" className="hidden xl:block">
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
            className="rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
          <div id="mobile-menu" className="site-header__mobile border-t border-cream-300 bg-cream-50 xl:hidden">
          <nav aria-label="Mobile menu" className="container-x py-4">
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
            <p className="eyebrow mt-5 px-3">Categories</p>
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {categoryOptions.map((category) => (
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
