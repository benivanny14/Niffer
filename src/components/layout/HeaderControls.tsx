"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

export function HeaderControls() {
  const { count, wishlist, ready } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-brand-700"
          aria-label="Tafuta bidhaa"
        >
          <SearchIcon className="h-5 w-5" />
        </button>

        <Link
          href="/akaunti"
          className="hidden rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-brand-700 sm:block"
          aria-label="Akaunti yako"
        >
          <UserIcon className="h-5 w-5" />
        </Link>

        <Link
          href="/upendwa"
          className="relative hidden rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-brand-700 sm:block"
          aria-label={`Bidhaa unazopenda (${wishlist.length})`}
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
          className="relative rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-brand-700"
          aria-label={`Kikapu changu (${count})`}
        >
          <BagIcon className="h-5 w-5" />
          {ready && count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white">
              {count}
            </span>
          ) : null}
        </button>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
