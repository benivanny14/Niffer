"use client";

import { useState } from "react";
import { SparkleIcon } from "@/components/ui/icons";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Lazima iwe "cover" kwa cards, "contain" kwa detail. */
  fit?: "cover" | "contain";
  priority?: boolean;
};

/**
 * Media module: hutumia `src` yaProductImage. Kama picha haipo au haipakiki,
 * huangukia kwenye gradient ya brand + sparkle (hakuna picha iliyovunjika).
 */
export function ProductImage({
  src,
  alt,
  className = "",
  fit = "cover",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-cream-200 ${className}`}
      >
        <SparkleIcon className="h-1/3 w-1/3 max-h-24 max-w-24 text-brand-300" />
      </div>
    );
  }

  // Image za katalogi ni 4:5. width/height ni "presentational hints" —
  // CSS classes (h-/w-) huzi-override, lakini zinazuia layout shift.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG static assets; swap to <Image> after real photoshoot
    <img
      src={src}
      alt={alt}
      width={800}
      height={1000}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
    />
  );
}
