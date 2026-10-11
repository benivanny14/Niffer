"use client";

import { useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { products } from "@/lib/data/catalog";
import { CheckIcon, StarIcon } from "@/components/ui/icons";
import { RatingStars } from "@/components/ui/RatingStars";
import Link from "next/link";

export type LocalReview = {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productSlug: string;
  createdAt: string;
};

const REVIEWS_KEY = "niffer.reviews.v1";
const localReviewsStore = createLocalStore<LocalReview[]>(REVIEWS_KEY, []);

/** Hook: hakiki za ndani (local). */
export function useLocalReviews(): LocalReview[] {
  return useSyncExternalStore(
    localReviewsStore.subscribe,
    localReviewsStore.get,
    localReviewsStore.getServer,
  );
}

/** Orodha ya hakiki za local (kutoka ReviewForm) — client-only. */
export function LocalReviews() {
  const local = useLocalReviews();
  if (local.length === 0) return null;
  return (
    <ul className="mt-6 space-y-4">
      {local.map((review) => {
        const product = products.find((p) => p.slug === review.productSlug);
        return (
          <li key={review.id} className="card border-brand-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <RatingStars rating={review.rating} size="md" />
              <span className="badge bg-success-100 text-success-600">
                Hakiki yako
              </span>
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-ink-700">
              &ldquo;{review.comment}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-sm">
              <span className="font-semibold text-ink-900">
                {review.customerName}
              </span>
              <span className="text-ink-400"> · {review.location}</span>
              {product ? (
                <Link
                  href={`/bidhaa/${product.slug}`}
                  className="ml-2 text-xs font-semibold text-brand-700 hover:underline"
                >
                  {product.name} →
                </Link>
              ) : null}
            </figcaption>
          </li>
        );
      })}
    </ul>
  );
}

const field =
  "w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

/** Fomu ya kuacha hakiki — huhifadhi kwenye kifaa hiki (demo). */
export function ReviewForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [productSlug, setProductSlug] = useState(products[0].slug);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 10) return;
    localReviewsStore.set([
      {
        id: `local-${Date.now()}`,
        customerName: name.trim(),
        location: location.trim() || "Tanzania",
        rating,
        comment: comment.trim(),
        productSlug,
        createdAt: new Date().toISOString(),
      },
      ...localReviewsStore.get(),
    ]);
    setDone(true);
    setComment("");
  }

  if (done) {
    return (
      <div className="card flex items-center gap-3 p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-700">
          Asante kwa hakiki yako! Inaonekana mara moja kwenye ukurasa huu.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Jina lako *
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Jina lako"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Mji</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={field}
            placeholder="Mfano: Dar es Salaam"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">Bidhaa</span>
        <select
          value={productSlug}
          onChange={(e) => setProductSlug(e.target.value)}
          className={field}
        >
          {products.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink-700">
          Ukadiriaji
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`Ukadiriaji ${value}`}
              className={`rounded-full p-1 transition-colors ${
                value <= rating ? "text-gold-500" : "text-ink-300"
              }`}
            >
              <StarIcon className="h-7 w-7" />
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          Hakiki yako *
        </span>
        <textarea
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          minLength={10}
          className={field}
          placeholder="Eleza uzoefu wako na bidhaa hii…"
        />
      </label>

      <button type="submit" className="btn-primary w-full">
        Tuma Hakiki
      </button>
      <p className="text-center text-xs text-ink-400">
        Hakiki zako huhifadhiwa kwenye kifaa hiki (demo). Kwenye tovuti halisi,
        hutumwa kwa modareta kabla ya kuonyeshwa.
      </p>
    </form>
  );
}
