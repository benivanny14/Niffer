import type { Metadata } from "next";
import { connection } from "next/server";
import { listAllReviews, listReviews } from "@/lib/server/leads";
import { ReviewForm } from "@/components/ui/ReviewForm";

export const metadata: Metadata = {
  title: "Hakiki za Wateja",
  description:
    "Soma hakiki zilizoidhinishwa au tuma maoni yako kuhusu bidhaa ulizonunua.",
};

export default async function ReviewsPage() {
  // Orodha ya hakiki zilizoidhinishwa pamoja na za kusubiri huonyeshwa kwa uwazi.
  await connection();
  const [all, pending] = await Promise.all([listReviews(200), listAllReviews(300)]);
  const pendingReviews = pending.filter((review) => review.status === "pending");

  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Ukaguzi</p>
      <h1 className="heading-display mt-2">Hakiki za wateja</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Soma uzoefu wa wateja wetu halisi. Umeonunua kutoka Niffer? Acha hakiki
        yako ili kusaidia wateja wengine.
      </p>
      {/* Fomu + orodha */}
      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl text-ink-900">
            Maoni ya hivi karibuni
          </h2>

          {all.length === 0 && pendingReviews.length === 0 ? (
            <p className="card mt-6 p-6 text-sm text-ink-500">
              Bado hakuna hakiki zilizochapishwa. Unaweza kuandika hakiki yako kwenye fomu iliyo hapa chini.
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
                      <span className="badge bg-success-100 text-success-600">Imeidhinishwa</span>
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
              <h3 id="pending-reviews-title" className="font-semibold text-ink-900">Hakiki zinazosubiri kuidhinishwa</h3>
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
