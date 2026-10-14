"use client";

import { useMemo, useState } from "react";
import { products, type Product } from "@/lib/data/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SparkleIcon } from "@/components/ui/icons";

type Question = {
  id: string;
  title: string;
  options: { value: string; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: "family",
    title: "Which fragrance family do you enjoy?",
    options: [
      { value: "mwaarifi", label: "Warm & sweet — vanilla, honey, caramel" },
      { value: "mizizi", label: "Fresh & citrus — lemon, mint, bright notes" },
      { value: "maua", label: "Floral — rose, jasmine, tropical flowers" },
      { value: "miti", label: "Woody & rich — sandalwood, cedar, oud, amber" },
    ],
  },
  {
    id: "occasion",
    title: "When do you usually wear fragrance?",
    options: [
      { value: "kila_siku", label: "Every day — work, school or casual plans" },
      { value: "jioni", label: "Evenings — dinners and nights out" },
      { value: "maalum", label: "Special occasions — celebrations and events" },
    ],
  },
  {
    id: "strength",
    title: "How strong would you like it to be?",
    options: [
      { value: "nyepesi", label: "Light — subtle and good for daytime" },
      { value: "kati", label: "Balanced — noticeable but not overpowering" },
      { value: "muda_mrefu", label: "Long-lasting — stays with you for hours" },
    ],
  },
];

const FAMILY_KEYWORDS: Record<string, string[]> = {
  mwaarifi: ["vanilla", "honey", "caramel", "sweet", "sugar", "mwaarifi"],
  mizizi: ["citrus", "lemon", "orange", "bergamot", "fresh", "lime", "mint"],
  maua: ["floral", "rose", "jasmine", "peony", "bloom", "maua", "flower"],
  miti: ["woody", "sandalwood", "cedar", "oud", "amber", "musk", "vanilla"],
};

const OCCASION_KEYWORDS: Record<string, string[]> = {
  kila_siku: ["daily", "mist", "light", "fresh", "everyday"],
  jioni: ["night", "nights", "evening", "intense", "parfum"],
  maalum: ["parfum", "eau de", "premium", "special", "gift"],
};

function score(product: Product, answers: Record<string, string>): number {
  const text = `${product.name} ${product.shortDescription} ${product.description} ${product.ingredients}`.toLowerCase();
  let value = 0;

  for (const kw of FAMILY_KEYWORDS[answers.family] ?? []) {
    if (text.includes(kw)) value += 5;
  }
  for (const kw of OCCASION_KEYWORDS[answers.occasion] ?? []) {
    if (text.includes(kw)) value += 2;
  }
  if (answers.strength === "muda_mrefu" && text.includes("parfum")) value += 3;
  if (answers.strength === "nyepesi" && (text.includes("mist") || text.includes("light"))) value += 3;
  if (product.category === "purest-glow" || product.category === "skincare") value += 2;
  if (product.badges.includes("bestseller")) value += 1;
  return value;
}

/** Search harufu inayokufaa — inapanga bidhaa za Fragrance/Body kwa majibu yako. */
export function ScentFinder({ products: items }: { products?: Product[] }) {
  // Bidhaa hutoka kwenye DB kupitia ukurasa (fallback: katalogi ya ndani).
  const catalog = items ?? products;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const total = QUESTIONS.length;
  const finished = step >= total;

  const results = useMemo(() => {
    if (!finished) return [];
    return catalog
      .filter((p) => p.category === "purest-glow" || p.category === "body-care" || p.category === "skincare")
      .map((product) => ({ product, value: score(product, answers) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((r) => r.product);
  }, [catalog, finished, answers]);

  function choose(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setStep((s) => s + 1);
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
                Fragrances picked for you
              </p>
              <p className="text-sm text-ink-500">
                Matched to the notes, occasions and strength you chose.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
            className="btn-outline px-4 py-2 text-xs"
          >
            Start again
          </button>
        </div>

        {results.length === 0 ? (
          <p className="card mt-6 p-6 text-sm text-ink-500">
            We could not find an exact match. Message us on WhatsApp for
            personal advice.
          </p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const q = QUESTIONS[step];

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>
          Step {step + 1} of {total}
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

      <div className="mt-6 grid gap-3">
        {q.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => choose(q.id, option.value)}
            className="rounded-xl border border-cream-300 bg-surface px-4 py-3.5 text-left text-sm text-ink-700 transition-colors hover:border-brand-300 hover:bg-cream-100"
          >
            {option.label}
          </button>
        ))}
      </div>

      {step > 0 ? (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="mt-6 text-sm text-ink-500 transition-colors hover:text-accent"
        >
          ← Go back
        </button>
      ) : null}
    </div>
  );
}
