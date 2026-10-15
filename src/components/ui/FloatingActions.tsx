"use client";

import { useEffect, useState } from "react";
import { site, waLink } from "@/lib/site";
import { ArrowUpIcon, ChatIcon } from "@/components/ui/icons";

/** WhatsApp (chini kulia) + Rudi Juu (baada ya kukimbia). */
export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [nearProductGrid, setNearProductGrid] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 639px)");
    const activeGrids = new Set<Element>();
    const observedGrids = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && document.documentElement.contains(entry.target)) {
            activeGrids.add(entry.target);
          } else {
            activeGrids.delete(entry.target);
          }
        }
        setNearProductGrid(mobile.matches && activeGrids.size > 0);
      },
      { rootMargin: "120px 0px 120px 0px" },
    );

    function observeGrids(root: ParentNode) {
      if (root instanceof Element && root.matches(".product-grid") && !observedGrids.has(root)) {
        observedGrids.add(root);
        observer.observe(root);
        const rect = root.getBoundingClientRect();
        if (rect.bottom >= -120 && rect.top <= window.innerHeight + 120) activeGrids.add(root);
      }
      root.querySelectorAll?.(".product-grid").forEach((grid) => {
        if (observedGrids.has(grid)) return;
        observedGrids.add(grid);
        observer.observe(grid);
        const rect = grid.getBoundingClientRect();
        if (rect.bottom >= -120 && rect.top <= window.innerHeight + 120) activeGrids.add(grid);
      });
      setNearProductGrid(mobile.matches && activeGrids.size > 0);
    }

    observeGrids(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) observeGrids(node);
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    const onBreakpointChange = () => setNearProductGrid(mobile.matches && activeGrids.size > 0);
    mobile.addEventListener("change", onBreakpointChange);
    return () => {
      mutations.disconnect();
      observer.disconnect();
      mobile.removeEventListener("change", onBreakpointChange);
    };
  }, []);

  if (nearProductGrid) return null;

  return (
    <div className="floating-actions fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="floating-actions__top flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-surface text-ink-700 shadow-lg transition-colors hover:text-accent"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      ) : null}

      <a
        href={waLink(
          `Habari ${site.name}, I have a question about your products.`,
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order or ask us on WhatsApp"
        className="floating-actions__whatsapp flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-xl transition-colors hover:scale-105 hover:bg-brand-800"
      >
        <ChatIcon className="h-7 w-7" />
      </a>
    </div>
  );
}
