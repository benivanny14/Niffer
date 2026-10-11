import type { Metadata } from "next";
import Link from "next/link";
import { products, reviews } from "@/lib/data/catalog";
import { getProductBySlug } from "@/lib/data/catalog";
import { RatingStars } from "@/components/ui/RatingStars";
import { ReviewForm, LocalReviews } from "@/components/ui/ReviewForm";
import { StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Hakiki za Wateja",
  description:
    "Soma na uandike hakiki za bidhaa za Niffer Cosmetics kutoka kwa wateja halisi Tanzania.",
};

function RatingSummary() {
  const all = reviews;
  const avg =
    all.length > 0
      ? all.reduce((sum, r) => sum + r.rating, 0) / all.length
      : 0;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: all.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="card grid gap-8 p-6 sm:grid-cols-2">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="font-display text-5xl text-ink-900">
          {avg.toFixed(1)}
        </p>
        <RatingStars rating={avg} size="lg" />
        <p className="mt-2 text-sm text-ink-500">
          Kutoka maoni {all.length} ya wateja
        </p>
      </div>
      <ul className="space-y-2">
        {dist.map(({ star, count }) => {
          const pct =
            reviews.length > 0
              ? Math.round((count / reviews.length) * 100)
              : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="flex w-8 items-center gap-0.5 text-ink-500">
                {star}
                <StarIcon className="h-3.5 w-3.5 text-gold-500" />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200">
                <span
                  className="block h-full rounded-full bg-gold-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-8 text-right text-xs text-ink-400">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ReviewsPage() {
  // Hakiki za local (kutoka ReviewForm) ni client-side — hapa tunatumia
  // za katalogi pekee; local zinaonyeshwa ndani ya component ya chini.
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Ukaguzi</p>
      <h1 className="heading-display mt-2">Hakiki za wateja</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Soma uzoefu wa wateja wetu halisi. Umeonunua kutoka Niffer? Acha hakiki
        yako ili kusaidia wateja wengine.
      </p>

      <div className="mt-10">
        <RatingSummary />
      </div>

      {/* Fomu + orodha */}
      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl text-ink-900">
            Maoni ya hivi karibuni
          </h2>
          <LocalReviews />
          <ul className="mt-6 space-y-4">
            {reviews.map((review) => {
              const product = getProductBySlug(review.productSlug);
              return (
                <li key={review.id} className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <RatingStars rating={review.rating} size="md" />
                    {product ? (
                      <Link
                        href={`/bidhaa/${product.slug}`}
                        className="text-xs font-semibold text-brand-700 hover:underline"
                      >
                        {product.name} →
                      </Link>
                    ) : null}
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-ink-700">
                    &ldquo;{review.comment}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 text-sm">
                    <span className="font-semibold text-ink-900">
                      {review.customerName}
                    </span>
                    <span className="text-ink-400"> · {review.location}</span>
                  </figcaption>
                </li>
              );
            })}
          </ul>

          {/* Orodha ya bidhaa zenye hakiki */}
          <section className="mt-12">
            <h2 className="font-display text-2xl text-ink-900">
              Bidhaa zilizokaguliwa zaidi
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {products
                .slice()
                .sort((a, b) => b.reviewCount - a.reviewCount)
                .slice(0, 6)
                .map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/bidhaa/${product.slug}`}
                      className="card flex items-center justify-between gap-3 p-4 transition-colors hover:border-brand-300"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-900">
                          {product.name}
                        </span>
                        <RatingStars
                          rating={product.rating}
                          reviewCount={product.reviewCount}
                          size="sm"
                        />
                      </span>
                      <span className="text-xs text-ink-400">
                        {product.reviewCount} maoni
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        </div>

        {/* Fomu */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl text-ink-900">
            Andika hakiki yako
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-500">
            Maoni yako yanaweza kumsaidia mteja mwingine.
          </p>
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
