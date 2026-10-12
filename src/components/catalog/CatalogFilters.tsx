"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { categories } from "@/lib/data/catalog";
import { tanzaniaRegions } from "@/lib/site";
import {
  priceRanges,
  sortOptions,
  type ProductFilterCounts,
} from "@/lib/product-filter";
import { MapPinIcon } from "@/components/ui/icons";

/**
 * Vichujio vya ukurasa wa bidhaa — mtindo wa jiji.com: kipande kimoja cha
 * mkoa → mji, kategoria, kipengele, bei na upangaji. Kila mabadiliko
 * huandika kwenye URL (?mkoa=&mji=…) ili viungi viweze kushirikiwa.
 */
export function CatalogFilters({ counts }: { counts: ProductFilterCounts }) {
  const router = useRouter();
  const params = useSearchParams();

  const category = params.get("kategoria") ?? "";
  const feature = params.get("kipengele") ?? "";
  const region = params.get("mkoa") ?? "";
  const city = params.get("mji") ?? "";
  const bei = params.get("bei") ?? "";
  const sort = params.get("sort") ?? "maarufu";

  // Server tayari hupunguza hesabu za mji kwenye mkoa uliochaguliwa.
  const cities = Object.keys(counts.city).filter((name) => name.length > 0);

  function update(next: Record<string, string | null>) {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") search.delete(key);
      else search.set(key, value);
    }
    const qs = search.toString();
    router.push(qs ? `/bidhaa?${qs}` : "/bidhaa", { scroll: false });
  }

  const chip = (active: boolean) =>
    `badge border transition-colors ${
      active
        ? "border-brand-700 bg-brand-700 text-white"
        : "border-cream-300 bg-surface text-ink-500 hover:border-brand-300 hover:text-accent"
    }`;

  const hasActive =
    category || feature || region || city || bei || sort !== "maarufu";

  const activeLabels: { key: string; label: string; clear: Record<string, null> }[] = [];
  if (category) {
    activeLabels.push({
      key: "kategoria",
      label: categories.find((c) => c.slug === category)?.name ?? category,
      clear: { kategoria: null },
    });
  }
  if (feature) {
    const featureLabels: Record<string, string> = {
      mpya: "Bidhaa mpya",
      punguzo: "Punguzo",
      inayoisha: "Zinazoisha",
    };
    activeLabels.push({
      key: "kipengele",
      label: featureLabels[feature] ?? feature,
      clear: { kipengele: null },
    });
  }
  if (region) {
    activeLabels.push({
      key: "mkoa",
      label: `Mkoa: ${region}`,
      clear: { mkoa: null, mji: null },
    });
  }
  if (city) {
    activeLabels.push({
      key: "mji",
      label: `Mji: ${city}`,
      clear: { mji: null },
    });
  }
  if (bei) {
    activeLabels.push({
      key: "bei",
      label: priceRanges.find((r) => r.value === bei)?.label ?? bei,
      clear: { bei: null },
    });
  }

  const field =
    "rounded-xl border border-cream-300 bg-surface px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

  return (
    <div className="space-y-5">
      {/* Kategoria + kipengele */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => update({ kategoria: null })}
          aria-pressed={!category}
          className={chip(!category)}
        >
          Zote
        </button>
        {categories.map((c) => {
          const count = counts.category[c.slug] ?? 0;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() =>
                update({ kategoria: category === c.slug ? null : c.slug })
              }
              aria-pressed={category === c.slug}
              className={chip(category === c.slug)}
            >
              {c.name}
              <span
                className={`ml-1.5 text-xs ${
                  category === c.slug ? "text-white/70" : "text-ink-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        <span className="mx-1 hidden h-5 w-px bg-cream-300 sm:block" />
        {[
          { value: "mpya", label: "Mpya" },
          { value: "punguzo", label: "Punguzo" },
          { value: "inayoisha", label: "Zinazoisha" },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() =>
              update({ kipengele: feature === f.value ? null : f.value })
            }
            aria-pressed={feature === f.value}
            className={chip(feature === f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Eneo (mkoa → mji), bei, upangaji */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <MapPinIcon className="h-3.5 w-3.5" />
            Mkoa
          </span>
          <select
            value={region}
            onChange={(e) =>
              update({ mkoa: e.target.value || null, mji: null })
            }
            className={`${field} w-full`}
          >
            <option value="">Miko yote</option>
            {tanzaniaRegions.map((r) => (
              <option key={r} value={r}>
                {r}
                {counts.region[r] ? ` (${counts.region[r]})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <MapPinIcon className="h-3.5 w-3.5" />
            Mji
          </span>
          <select
            value={city}
            onChange={(e) => update({ mji: e.target.value || null })}
            disabled={!region || cities.length === 0}
            className={`${field} w-full disabled:opacity-50`}
          >
            <option value="">
              {region ? "Mji wote" : "Chagua mkoa kwanza"}
            </option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c} ({counts.city[c] ?? 0})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Bei
          </span>
          <select
            value={bei}
            onChange={(e) => update({ bei: e.target.value || null })}
            className={`${field} w-full`}
          >
            <option value="">Bei zote</option>
            {priceRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Panga kwa
          </span>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value || null })}
            className={`${field} w-full`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Vichujio hai */}
      {hasActive ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Vinavyotumika:
          </span>
          {activeLabels.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => update(item.clear)}
              className="badge border border-brand-300 bg-brand-50 text-accent transition-colors hover:border-brand-500"
              aria-label={`Ondoa ${item.label}`}
            >
              {item.label} ×
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              router.push("/bidhaa", { scroll: false })
            }
            className="text-xs font-semibold text-ink-500 underline transition-colors hover:text-accent"
          >
            Ondoa zote
          </button>
        </div>
      ) : null}
    </div>
  );
}
