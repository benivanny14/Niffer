"use client";

import { useEffect, useState } from "react";
import { site, waLink } from "@/lib/site";
import { ArrowUpIcon, ChatIcon } from "@/components/ui/icons";

/** WhatsApp (chini kulia) + Rudi Juu (baada ya kukimbia). */
export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Rudi juu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-surface text-ink-700 shadow-lg transition-colors hover:text-accent"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      ) : null}

      <a
        href={waLink(
          `Habari ${site.name}, nina swali kuhusu bidhaa zenu.`,
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Oda au ombi kwa WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-xl transition-colors hover:scale-105 hover:bg-brand-800"
      >
        <ChatIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
