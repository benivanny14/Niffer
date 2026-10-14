"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { Portal } from "@/components/ui/Portal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

export function HeaderControls() {
  const { count, wishlist, ready } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex min-h-11 items-center gap-2 rounded-md border border-ink-200/70 px-3 text-ink-500 transition-colors duration-200 ease-in-out hover:border-brand-700/40 hover:text-brand-700"
          aria-label="Search products"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="hidden text-sm md:inline">Search products</span>
        </button>

        <Link
          href="/akaunti"
          className="hidden rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent sm:block"
          aria-label="Your account"
        >
          <UserIcon className="h-5 w-5" />
        </Link>

        <Link
          href="/upendwa"
          className="relative hidden rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent sm:block"
          aria-label={`Wishlist (${wishlist.length})`}
        >
          <HeartIcon className="h-5 w-5" />
          {ready && wishlist.length > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white">
              {wishlist.length}
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent"
          aria-label={`Shopping bag (${count})`}
        >
          <BagIcon className="h-5 w-5" />
          {ready && count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white">
              {count}
            </span>
          ) : null}
        </button>
      </div>

      {/* Portal kwenye <body> — kichwa kina backdrop-blur ambacho kingezuia
          drawer hizi kufunika ukurasa (fixed ndani ya containing block). */}
      <Portal>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </Portal>
    </>
  );
}
