"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/lib/data/catalog";
import { apiPost, errorMessage } from "@/lib/api";
import { CheckIcon, StarIcon } from "@/components/ui/icons";

const field =
  "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

/**
 * Fomu ya kuacha hakiki — huhifadhi kwenye database ya seva.
 * `defaultSlug` hutumika kwenye ukurasa wa bidhaa (bidhaa tayari imechaguliwa).
 */
export function ReviewForm({
  defaultSlug,
  defaultName,
}: {
  defaultSlug?: string;
  defaultName?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [productSlug, setProductSlug] = useState(
    defaultSlug || products[0]?.slug || "",
  );
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (comment.trim().length < 10) {
      setError("Please write a review of at least 10 characters.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await apiPost("/api/reviews", {
        customerName: name,
        location,
        rating,
        comment,
        productSlug,
      });
      setDone(true);
      setComment("");
      // Onyesha hakiki mpya mara moja (server ndio hupaka ukurasa).
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="card flex items-center gap-3 p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-700">
          Thank you for your review! It has been submitted and will appear here
          after our team has reviewed it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Your name *
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Your name"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">City</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={field}
            placeholder="e.g. Dar es Salaam"
          />
        </label>
      </div>

      {defaultSlug ? (
        <p className="rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-500">
          Reviewing:{" "}
          <span className="font-semibold text-ink-900">
            {defaultName ??
              products.find((p) => p.slug === defaultSlug)?.name ??
              defaultSlug}
          </span>
        </p>
      ) : (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Product</span>
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
      )}

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink-700">
          Rating
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`Rating ${value}`}
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
          Your review *
        </span>
        <textarea
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          minLength={10}
          className={field}
          placeholder="Tell us about your experience with this product…"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="btn-primary w-full disabled:opacity-60"
      >
        {sending ? "Submitting…" : "Submit review"}
      </button>
      <p className="text-center text-xs text-ink-400">
        Your review is saved securely and shared with other customers.
      </p>
    </form>
  );
}
