import { StarIcon } from "@/components/ui/icons";

type RatingStarsProps = {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
};

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
}: RatingStarsProps) {
  const starClass =
    size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-6 w-6";
  const hasReviews = reviewCount === undefined ? rating > 0 : reviewCount > 0;
  const normalizedRating = Number.isFinite(rating)
    ? Math.min(5, Math.max(0, rating))
    : 0;
  if (!hasReviews) {
    return (
      <span className="rating-stars__empty text-xs leading-5 text-ink-400">
        No reviews
      </span>
    );
  }

  return (
    <div
      className="rating-stars flex min-w-0 items-center gap-1.5"
      role="img"
      aria-label={`${normalizedRating.toFixed(1)} out of 5, ${reviewCount ?? 1} ${reviewCount === 1 ? "review" : "reviews"}`}
    >
      <div
        className="flex shrink-0 items-center gap-0.5"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.min(1, Math.max(0, normalizedRating - i));
          return (
            <span key={i} className={`relative inline-flex ${starClass}`}>
              <StarIcon className={`${starClass} text-ink-300`} />
              {fill > 0 ? (
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden text-gold-500"
                  style={{ width: `${fill * 100}%` }}
                >
                  <StarIcon className={`${starClass} max-w-none`} />
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-ink-700">
        {normalizedRating.toFixed(1)}
      </span>
      {typeof reviewCount === "number" ? (
        <span className="shrink-0 text-xs text-ink-400">({reviewCount})</span>
      ) : null}
    </div>
  );
}
