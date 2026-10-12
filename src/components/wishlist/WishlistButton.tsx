"use client";

import { useStore } from "@/lib/store";
import { HeartIcon } from "@/components/ui/icons";

type Props = { slug: string; className?: string };

/** Kitufe cha kupenda/kutowapenda bidhaa (wishlist) — huhifadhiwa localStorage. */
export function WishlistButton({ slug, className = "" }: Props) {
  const { inWishlist, toggleWishlist } = useStore();
  const active = inWishlist(slug);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(slug)}
      aria-pressed={active}
      aria-label={active ? "Ondoa kwenye upendwa" : "Hifadhi kwenye upendwa"}
      className={`rounded-full p-2 transition-colors ${
        active
          ? "bg-surface/90 text-danger-600"
          : "bg-surface/70 text-ink-500 hover:text-danger-600"
      } ${className}`}
    >
      <HeartIcon className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
