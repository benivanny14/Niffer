"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { BagIcon, CheckIcon } from "@/components/ui/icons";

type Props = {
  slug: string;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
};

/** Kitufe cha kuongeza kikapu kinachotumia store ya global. */
export function AddToCartButton({
  slug,
  disabled = false,
  className = "",
  compact = false,
}: Props) {
  const { add } = useStore();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function onClick() {
    add(slug, 1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-live="polite"
      className={`btn ${
        added ? "bg-success-600 text-white" : "btn-primary"
      } ${compact ? "px-4 py-2 text-xs" : "w-full"} ${className}`}
    >
      {added ? (
        <>
          <CheckIcon className="h-4 w-4" />
          Imeongezwa
        </>
      ) : (
        <>
          <BagIcon className="h-4 w-4" />
          Weka kikapu
        </>
      )}
    </button>
  );
}
