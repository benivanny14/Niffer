"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

const THEME_KEY = "niffer.theme";

/**
 * Badilisha kati ya mwanga na giza.
 *
 * Mwanzo wa hali: script ndani ya `<body>` (layout) husoma `localStorage`
 * na `prefers-color-scheme` KABLA ya render — hakuna "flash" ya muda.
 * Kubonyeza hapa huhifadhi uchaguzi wa wazi (`dark`/`light`).
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  // Fuata hali halisi ya <html> (pamoja na mabadiliko kutoka kifaa kimoja).
  useEffect(() => {
    const sync = () =>
      setDark(document.documentElement.classList.contains("dark"));
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* kivinjari kinazuia storage — mabadiliko bado yanafanya kazi */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Mwanga" : "Giza"}
      className="rounded-full p-2 text-ink-700 transition-colors hover:bg-cream-200 hover:text-accent"
    >
      {dark ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
