import type { Metadata } from "next";
import { connection } from "next/server";
import { listAllReviews, listReviews } from "@/lib/server/leads";
import { ReviewForm } from "@/components/ui/ReviewForm";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description:
    "Read approved reviews or share your feedback about products you have purchased.",
};

export default async function ReviewsPage() {
  // Orodha ya hakiki zilizoidhinishwa pamoja na za kusubiri huonyeshwa kwa uwazi.
  await connection();
  const [all, pending] = await Promise.all([listReviews(200), listAllReviews(300)]);
  const pendingReviews = pending.filter((review) => review.status === "pending");

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Reviews</p>
      <h1 className="heading-display mt-2">Customer reviews</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Read feedback from our customers. Purchased from Niffer? Leave a review
        to help other shoppers.
      </p>
      {/* Fomu + orodha */}
      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl text-ink-900">
            Recent reviews
          </h2>

          {all.length === 0 && pendingReviews.length === 0 ? (
            <p className="card mt-6 p-6 text-sm text-ink-500">
              No reviews have been published yet. You can leave a review using the form below.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {all.map((review) => {
                return (
                  <li
                    key={review.id}
                    className="card p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gold-700">{review.rating}/5</span>
<span className="badge bg-success-100 text-success-600">Approved</span>
                    </div>
                    <blockquote className="mt-3 text-sm leading-relaxed text-ink-700">
                      &ldquo;{review.comment}&rdquo;
                    </blockquote>
                    <p className="mt-3 text-sm">
                      <span className="font-semibold text-ink-900">
                        {review.customerName}
                      </span>
                      <span className="text-ink-400"> · {review.location}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          {pendingReviews.length > 0 ? (
            <section className="mt-8" aria-labelledby="pending-reviews-title">
              <h3 id="pending-reviews-title" className="font-semibold text-ink-900">Reviews awaiting approval</h3>
              <ul className="mt-4 space-y-4">
                {pendingReviews.map((review) => (
                  <li key={review.id} className="card border-dashed p-6">
                    <span className="badge bg-warning-100 text-warning-700">Inakaguliwa</span>
                    <blockquote className="mt-3 text-sm leading-relaxed text-ink-700">&ldquo;{review.comment}&rdquo;</blockquote>
                    <p className="mt-3 text-sm text-ink-500">{review.customerName} · {review.location}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

        </div>

        {/* Fomu */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl text-ink-900">
            Write a review
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-500">
            Your feedback can help another customer.
          </p>
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
