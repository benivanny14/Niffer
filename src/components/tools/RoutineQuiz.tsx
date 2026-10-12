"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { products, type Product } from "@/lib/data/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SparkleIcon, CheckIcon } from "@/components/ui/icons";

type Question = {
  id: string;
  title: string;
  hint?: string;
  options: { value: string; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: "skin",
    title: "Aina ya ngozi yako?",
    hint: "Chagua ile inayokufaa zaidi siku za asubuhi.",
    options: [
      { value: "kavu", label: "Kavu — inajisikia nyufa baada ya kusafisha" },
      { value: "mafuta", label: "Mafuta — inawaka haraka, uso unang'aa" },
      { value: "mchanganyiko", label: "Mchanganyiko — T-zone inawaka, nyingine kavu" },
      { value: "kawaida", label: "Kawaida — sare, rahisi kutunza" },
    ],
  },
  {
    id: "goal",
    title: "Lengo lako kuu la urembo?",
    options: [
      { value: "mwanga", label: "Urefu wa mwanga na ngozi safi" },
      { value: "maumivu", label: "Kupunguza chunvi na madoa" },
      { value: "unyevu", label: "Kudumisha unyevu muda wote" },
      { value: "umri", label: "Kupunguza mistari ya umri" },
    ],
  },
  {
    id: "routine",
    title: "Unapenda utunzaji wa aina gani?",
    options: [
      { value: "haraka", label: "Haraka — hatua 2–3 tu kila siku" },
      { value: "kamili", label: "Kamili — napenda hatua zote za rutini" },
      { value: "mchana", label: "Machweo — sehemu ya jioni zaidi" },
    ],
  },
  {
    id: "budget",
    title: "Bajeti yako kwa bidhaa moja?",
    options: [
      { value: "chini", label: "Chini ya TSh 20,000" },
      { value: "kati", label: "TSh 20,000 – 40,000" },
      { value: "juu", label: "Zaidi ya TSh 40,000" },
    ],
  },
];

const GOAL_KEYWORDS: Record<string, string[]> = {
  mwanga: ["vitamin c", "bright", "radiance", "glow", "mwanga", "angavu"],
  maumivu: ["acne", "salicylic", "tea tree", "pimple", "clarify", "purif"],
  unyevu: ["hyaluronic", "moistur", "aloe", "unyevu", "hydrate", "nourish", "shea"],
  umri: ["retinol", "collagen", "anti-age", "wrinkle", "firm", "age"],
};

const SKIN_KEYWORDS: Record<string, string[]> = {
  kavu: ["cream", "nourish", "shea", "butter", "rich", "dry"],
  mafuta: ["oil-free", "gel", "matt", "oil control", "clarif"],
  mchanganyiko: ["balance", "gel", "daily"],
  kawaida: ["daily", "gentle", "everyday"],
};

const BUDGET_MAX: Record<string, number> = {
  chini: 20_000,
  kati: 40_000,
  juu: Number.MAX_SAFE_INTEGER,
};

function score(product: Product, answers: Record<string, string>): number {
  const text = `${product.name} ${product.shortDescription} ${product.description} ${product.ingredients}`.toLowerCase();
  let value = 0;

  for (const kw of GOAL_KEYWORDS[answers.goal] ?? []) {
    if (text.includes(kw)) value += 4;
  }
  for (const kw of SKIN_KEYWORDS[answers.skin] ?? []) {
    if (text.includes(kw)) value += 2;
  }
  // Skincare ndiyo msingi wa rutini ya ngozi.
  if (product.category === "skincare") value += 2;
  if (product.category === "body-care" && answers.goal === "unyevu") value += 1;

  const max = BUDGET_MAX[answers.budget] ?? Number.MAX_SAFE_INTEGER;
  value += product.priceTsh <= max ? 3 : -4;

  if (product.badges.includes("bestseller")) value += 1;
  return value;
}

export function RoutineQuiz({ products: items }: { products?: Product[] }) {
  // Bidhaa hutoka kwenye DB kupitia ukurasa (fallback: katalogi ya ndani).
  const catalog = items ?? products;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const total = QUESTIONS.length;
  const finished = step >= total;

  const results = useMemo(() => {
    if (!finished) return [];
    return catalog
      .map((product) => ({ product, value: score(product, answers) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((r) => r.product);
  }, [catalog, finished, answers]);

  function choose(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setStep((s) => s + 1);
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  if (finished) {
    return (
      <div>
        <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-accent">
              <SparkleIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink-900">
                Mapendekezo yako kwa ngozi yako
              </p>
              <p className="text-sm text-ink-500">
                Yamepangwa kwa majibu yako — anza na haya matatu.
              </p>
            </div>
          </div>
          <button type="button" onClick={restart} className="btn-outline px-4 py-2 text-xs">
            Anza tena
          </button>
        </div>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        <Link href="/bidhaa" className="btn-primary mt-8">
          Vinjari bidhaa zote
        </Link>
      </div>
    );
  }

  const q = QUESTIONS[step];

  return (
    <div className="card p-6 sm:p-8">
      {/* Maendeleo */}
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>
          Swali {step + 1} kati ya {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full bg-brand-700 transition-all duration-300"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 font-display text-2xl text-ink-900">{q.title}</h2>
      {q.hint ? <p className="mt-1 text-sm text-ink-500">{q.hint}</p> : null}

      <div className="mt-6 grid gap-3">
        {q.options.map((option) => {
          const selected = answers[q.id] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(q.id, option.value)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors ${
                selected
                  ? "border-brand-600 bg-brand-50 text-ink-900"
                  : "border-cream-300 bg-surface text-ink-700 hover:border-brand-300 hover:bg-cream-100"
              }`}
            >
              <span>{option.label}</span>
              {selected ? <CheckIcon className="h-4 w-4 shrink-0 text-accent" /> : null}
            </button>
          );
        })}
      </div>

      {step > 0 ? (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="mt-6 text-sm text-ink-500 transition-colors hover:text-accent"
        >
          ← Rudi nyuma
        </button>
      ) : null}
    </div>
  );
}
